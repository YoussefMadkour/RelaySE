#!/usr/bin/env node
// Idempotent Plane seed script. Run with:
//   node --env-file=.env.local scripts/seed-plane.mjs
//
// Reads data/seed/plane.json and creates (or reuses) the workspace's
// projects, labels, issues, cycle, and pages via the Plane Cloud REST API.

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const BASE_URL = process.env.PLANE_BASE_URL || "https://api.plane.so";
const API_KEY = process.env.PLANE_API_KEY;
const WORKSPACE = process.env.PLANE_WORKSPACE_SLUG;

if (!API_KEY || !WORKSPACE) {
  console.error("Missing PLANE_API_KEY or PLANE_WORKSPACE_SLUG. Set them in .env.local and run with --env-file=.env.local");
  process.exit(1);
}

async function planeFetch(pathname, options = {}) {
  const url = `${BASE_URL}${pathname}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "X-API-Key": API_KEY,
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

function asList(response) {
  if (Array.isArray(response)) return response;
  if (response && Array.isArray(response.results)) return response.results;
  return [];
}

async function listProjects() {
  const res = await planeFetch(`/api/v1/workspaces/${WORKSPACE}/projects/`);
  return asList(res);
}

async function ensureProject(spec, existingProjects) {
  const found = existingProjects.find((p) => p.name === spec.name);
  if (found) {
    console.log(`[project] exists: ${spec.name} (${found.id})`);
    return found;
  }
  const created = await planeFetch(`/api/v1/workspaces/${WORKSPACE}/projects/`, {
    method: "POST",
    body: JSON.stringify({
      name: spec.name,
      identifier: spec.identifier,
      description: spec.description || "",
      cycle_view: true,
      page_view: true,
    }),
  });
  console.log(`[project] created: ${spec.name} (${created.id})`);
  return created;
}

async function listLabels(projectId) {
  const res = await planeFetch(`/api/v1/workspaces/${WORKSPACE}/projects/${projectId}/labels/`);
  return asList(res);
}

async function ensureLabel(projectId, name, existingLabels) {
  const found = existingLabels.find((l) => l.name === name);
  if (found) return found;
  const created = await planeFetch(`/api/v1/workspaces/${WORKSPACE}/projects/${projectId}/labels/`, {
    method: "POST",
    body: JSON.stringify({ name }),
  });
  console.log(`  [label] created: ${name} (${created.id})`);
  existingLabels.push(created);
  return created;
}

async function listStates(projectId) {
  const res = await planeFetch(`/api/v1/workspaces/${WORKSPACE}/projects/${projectId}/states/`);
  return asList(res);
}

async function listWorkItems(projectId) {
  const res = await planeFetch(`/api/v1/workspaces/${WORKSPACE}/projects/${projectId}/work-items/`);
  return asList(res);
}

async function ensureWorkItem(projectId, spec, existingItems, defaultStateId, labelsById) {
  const found = existingItems.find((i) => i.name === spec.title);
  if (found) {
    console.log(`  [issue] exists: ${spec.title} (${found.id})`);
    return found;
  }
  const body = {
    name: spec.title,
    priority: (spec.priority || "none").toLowerCase(),
    state: defaultStateId,
  };
  if (spec.label && labelsById[spec.label]) {
    body.labels = [labelsById[spec.label]];
  }
  const created = await planeFetch(`/api/v1/workspaces/${WORKSPACE}/projects/${projectId}/work-items/`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  console.log(`  [issue] created: ${spec.title} (${created.id})`);
  existingItems.push(created);
  return created;
}

async function listCycles(projectId) {
  const res = await planeFetch(`/api/v1/workspaces/${WORKSPACE}/projects/${projectId}/cycles/`);
  return asList(res);
}

async function ensureCycle(projectId, name) {
  const existing = await listCycles(projectId);
  const found = existing.find((c) => c.name === name);
  if (found) {
    console.log(`[cycle] exists: ${name} (${found.id})`);
    return found;
  }
  const today = new Date();
  const start = new Date(today.getTime() + 2 * 24 * 3600 * 1000);
  const end = new Date(start.getTime() + 13 * 24 * 3600 * 1000);
  const fmt = (d) => d.toISOString().slice(0, 10);
  const created = await planeFetch(`/api/v1/workspaces/${WORKSPACE}/projects/${projectId}/cycles/`, {
    method: "POST",
    body: JSON.stringify({
      name,
      project_id: projectId,
      start_date: fmt(start),
      end_date: fmt(end),
    }),
  });
  console.log(`[cycle] created: ${name} (${created.id})`);
  return created;
}

async function listCycleWorkItems(projectId, cycleId) {
  const res = await planeFetch(`/api/v1/workspaces/${WORKSPACE}/projects/${projectId}/cycles/${cycleId}/cycle-issues/`);
  return asList(res);
}

async function addIssuesToCycle(projectId, cycleId, issueIds) {
  const existing = await listCycleWorkItems(projectId, cycleId);
  const existingIds = new Set(existing.map((i) => i.issue || i.id));
  const missing = issueIds.filter((id) => !existingIds.has(id));
  if (missing.length === 0) {
    console.log(`[cycle] all ${issueIds.length} issue(s) already in cycle`);
    return;
  }
  await planeFetch(`/api/v1/workspaces/${WORKSPACE}/projects/${projectId}/cycles/${cycleId}/cycle-issues/`, {
    method: "POST",
    body: JSON.stringify({ issues: missing }),
  });
  console.log(`[cycle] added ${missing.length} issue(s) to cycle`);
}

async function listPages(projectId) {
  const res = await planeFetch(`/api/v1/workspaces/${WORKSPACE}/projects/${projectId}/pages/`);
  return asList(res);
}

async function ensurePage(projectId, spec, existingPages) {
  const found = existingPages.find((p) => p.name === spec.title);
  if (found) {
    console.log(`  [page] exists: ${spec.title} (${found.id})`);
    return found;
  }
  const created = await planeFetch(`/api/v1/workspaces/${WORKSPACE}/projects/${projectId}/pages/`, {
    method: "POST",
    body: JSON.stringify({
      name: spec.title,
      description_html: `<p>${spec.title} — seeded documentation for the Northstar Labs demo scenario.</p>`,
    }),
  });
  console.log(`  [page] created: ${spec.title} (${created.id})`);
  existingPages.push(created);
  return created;
}

async function main() {
  const seedPath = path.join(ROOT, "data", "seed", "plane.json");
  const seed = JSON.parse(await readFile(seedPath, "utf8"));

  console.log(`Seeding Plane workspace "${WORKSPACE}"...\n`);

  const existingProjects = await listProjects();
  const projectsByName = {};
  for (const p of seed.projects) {
    projectsByName[p.name] = await ensureProject(p, existingProjects);
  }

  const issuesByTitle = {};
  for (const [name, project] of Object.entries(projectsByName)) {
    const issuesForProject = seed.issues.filter((i) => i.project === name);
    if (issuesForProject.length === 0) continue;

    console.log(`\n[project] ${name}`);
    const existingLabels = await listLabels(project.id);
    const labelsById = {};
    const distinctLabels = [...new Set(issuesForProject.map((i) => i.label).filter(Boolean))];
    for (const labelName of distinctLabels) {
      const label = await ensureLabel(project.id, labelName, existingLabels);
      labelsById[labelName] = label.id;
    }

    const states = await listStates(project.id);
    const defaultState = states.find((s) => s.default) || states[0];
    const existingItems = await listWorkItems(project.id);

    for (const issueSpec of issuesForProject) {
      const item = await ensureWorkItem(project.id, issueSpec, existingItems, defaultState.id, labelsById);
      issuesByTitle[issueSpec.title] = { ...item, projectId: project.id };
    }
  }

  console.log(`\n[cycle] ${seed.cycle.name}`);
  const cycleProject = projectsByName[seed.cycle.project];
  const cycle = await ensureCycle(cycleProject.id, seed.cycle.name);
  const cycleIssueIds = seed.cycle.issuesIncluded.map((title) => {
    const issue = issuesByTitle[title];
    if (!issue) throw new Error(`Cycle references unknown issue "${title}" - check data/seed/plane.json`);
    return issue.id;
  });
  await addIssuesToCycle(cycleProject.id, cycle.id, cycleIssueIds);

  for (const pageSpec of seed.pages) {
    const project = projectsByName[pageSpec.linkedProject];
    console.log(`\n[project] ${pageSpec.linkedProject}`);
    const existingPages = await listPages(project.id);
    await ensurePage(project.id, pageSpec, existingPages);
  }

  console.log("\nDone. Project IDs:");
  for (const [name, project] of Object.entries(projectsByName)) {
    console.log(`  ${name}: ${project.id}`);
  }
}

main().catch((err) => {
  console.error("\nSeed failed:", err.message);
  process.exit(1);
});
