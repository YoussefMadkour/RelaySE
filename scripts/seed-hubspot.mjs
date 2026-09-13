#!/usr/bin/env node
// Idempotent HubSpot seed script. Run with:
//   node --env-file=.env.local scripts/seed-hubspot.mjs
//
// Reads data/seed/hubspot.json and creates (or reuses) the Company, the
// custom Deal properties, the Deal, the Contacts, and their associations
// via the HubSpot CRM v3/v4 REST API.

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const BASE_URL = process.env.HUBSPOT_BASE_URL || "https://api.hubapi.com";
const TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;

if (!TOKEN) {
  console.error("Missing HUBSPOT_ACCESS_TOKEN. Set it in .env.local and run with --env-file=.env.local");
  process.exit(1);
}

async function hsFetch(pathname, options = {}) {
  const url = `${BASE_URL}${pathname}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`${options.method || "GET"} ${pathname} -> ${res.status} ${res.statusText}\n${body}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

// The default HubSpot "Deals pipeline" has no "Discovery" stage out of the
// box (stages are: Appointment Scheduled, Qualified To Buy, Presentation
// Scheduled, Decision Maker Bought-In, Contract Sent, Closed Won/Lost).
// Rather than spend a scope on pipeline-stage editing, we map our
// conceptual "Discovery" stage onto the closest default stage.
const DISCOVERY_STAGE_ID = "appointmentscheduled";

const DEAL_CUSTOM_PROPERTIES = [
  { name: "verified_requirements", label: "Verified Requirements" },
  { name: "blocked_requirements", label: "Blocked Requirements" },
  { name: "walkthrough_url", label: "Personalized Walkthrough URL" },
  { name: "next_technical_step", label: "Next Technical Step" },
];

function resolveEnvPlaceholder(value) {
  if (typeof value !== "string") return value;
  const match = value.match(/^\$([A-Z_]+)$/);
  if (!match) return value;
  const resolved = process.env[match[1]];
  return resolved || undefined;
}

async function findCompanyByName(name) {
  const res = await hsFetch(`/crm/v3/objects/companies?limit=100&properties=name,domain`);
  return (res.results || []).find((c) => c.properties.name === name);
}

async function ensureCompany(spec) {
  const existing = await findCompanyByName(spec.name);
  if (existing) {
    console.log(`[company] exists: ${spec.name} (${existing.id})`);
    return existing;
  }
  const created = await hsFetch(`/crm/v3/objects/companies`, {
    method: "POST",
    body: JSON.stringify({
      properties: {
        name: spec.name,
        domain: spec.domain,
        industry: spec.industry,
        numberofemployees: spec.employeeCount,
        description: spec.notes || "",
      },
    }),
  });
  console.log(`[company] created: ${spec.name} (${created.id})`);
  return created;
}

async function ensureDealProperties() {
  const existing = await hsFetch(`/crm/v3/properties/deals`);
  const existingNames = new Set((existing.results || []).map((p) => p.name));
  for (const prop of DEAL_CUSTOM_PROPERTIES) {
    if (existingNames.has(prop.name)) {
      console.log(`[deal property] exists: ${prop.name}`);
      continue;
    }
    await hsFetch(`/crm/v3/properties/deals`, {
      method: "POST",
      body: JSON.stringify({
        name: prop.name,
        label: prop.label,
        type: "string",
        fieldType: "textarea",
        groupName: "dealinformation",
      }),
    });
    console.log(`[deal property] created: ${prop.name}`);
  }
}

async function findDealByName(name) {
  const res = await hsFetch(`/crm/v3/objects/deals?limit=100&properties=dealname`);
  return (res.results || []).find((d) => d.properties.dealname === name);
}

async function ensureDeal(spec) {
  const existing = await findDealByName(spec.name);
  if (existing) {
    console.log(`[deal] exists: ${spec.name} (${existing.id})`);
    return existing;
  }
  const created = await hsFetch(`/crm/v3/objects/deals`, {
    method: "POST",
    body: JSON.stringify({
      properties: {
        dealname: spec.name,
        amount: String(spec.amount),
        dealstage: DISCOVERY_STAGE_ID,
        pipeline: "default",
      },
    }),
  });
  console.log(`[deal] created: ${spec.name} (${created.id}) [dealstage="${DISCOVERY_STAGE_ID}" representing "Discovery"]`);
  return created;
}

async function findContactByName(firstname, lastname) {
  const res = await hsFetch(`/crm/v3/objects/contacts?limit=100&properties=firstname,lastname,email`);
  return (res.results || []).find(
    (c) => c.properties.firstname === firstname && c.properties.lastname === lastname
  );
}

async function ensureContact(spec) {
  const [firstname, ...rest] = spec.name.split(" ");
  const lastname = rest.join(" ");
  const existing = await findContactByName(firstname, lastname);
  if (existing) {
    console.log(`[contact] exists: ${spec.name} (${existing.id})`);
    return existing;
  }
  const email = resolveEnvPlaceholder(spec.email);
  const properties = { firstname, lastname, jobtitle: spec.title };
  if (email) properties.email = email;
  const created = await hsFetch(`/crm/v3/objects/contacts`, {
    method: "POST",
    body: JSON.stringify({ properties }),
  });
  console.log(`[contact] created: ${spec.name} (${created.id})${email ? "" : " [no email set - DEMO_PROSPECT_EMAIL/DEMO_STAKEHOLDER_EMAIL not configured yet]"}`);
  return created;
}

async function ensureAssociation(fromType, fromId, toType, toId) {
  await hsFetch(`/crm/v4/objects/${fromType}/${fromId}/associations/default/${toType}/${toId}`, {
    method: "PUT",
  });
}

async function main() {
  const seedPath = path.join(ROOT, "data", "seed", "hubspot.json");
  const seed = JSON.parse(await readFile(seedPath, "utf8"));

  console.log(`Seeding HubSpot...\n`);

  const company = await ensureCompany(seed.company);

  console.log();
  await ensureDealProperties();

  console.log();
  const deal = await ensureDeal(seed.deal);
  await ensureAssociation("companies", company.id, "deals", deal.id);
  console.log(`[association] company <-> deal`);

  console.log();
  for (const contactSpec of seed.contacts) {
    const contact = await ensureContact(contactSpec);
    await ensureAssociation("companies", company.id, "contacts", contact.id);
    await ensureAssociation("deals", deal.id, "contacts", contact.id);
    console.log(`[association] company/deal <-> ${contactSpec.name}`);
  }

  console.log("\nDone.");
  console.log(`  Company: ${company.id}`);
  console.log(`  Deal: ${deal.id}`);
}

main().catch((err) => {
  console.error("\nSeed failed:", err.message);
  process.exit(1);
});
