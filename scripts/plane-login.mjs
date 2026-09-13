#!/usr/bin/env node
// Logs into Plane's web UI and saves a reusable Playwright storage state
// (session cookies/local storage), since PLANE_API_KEY only authenticates
// REST calls, not the browser session Playwright capture needs.
//
// Run with: node --env-file=.env.local scripts/plane-login.mjs

import { chromium } from "playwright";
import path from "node:path";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const EMAIL = process.env.PLANE_EMAIL;
const PASSWORD = process.env.PLANE_PASSWORD;
const WORKSPACE_SLUG = process.env.PLANE_WORKSPACE_SLUG;

if (!EMAIL || !PASSWORD) {
  console.error("Missing PLANE_EMAIL or PLANE_PASSWORD in .env.local");
  process.exit(1);
}

const AUTH_DIR = path.join(ROOT, "data", ".auth");
const STORAGE_STATE_PATH = path.join(AUTH_DIR, "plane.json");

async function main() {
  await mkdir(AUTH_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto("https://app.plane.so/", { waitUntil: "networkidle" });
  await page.fill("input#email", EMAIL);
  await page.click('button:has-text("Continue")');
  await page.waitForSelector("input#password", { timeout: 10_000 });
  await page.fill("input#password", PASSWORD);
  await page.click('button:has-text("Continue")');

  await page.waitForURL(/app\.plane\.so\/(?!$)/, { timeout: 15_000 }).catch(() => {});
  await page.waitForTimeout(2000);

  const url = page.url();
  console.log(`Post-login URL: ${url}`);

  if (url === "https://app.plane.so/" || /sign-?in|login/i.test(url)) {
    const bodyText = await page.textContent("body");
    console.error("Login does not appear to have succeeded. Page text snippet:");
    console.error(bodyText?.slice(0, 800));
    await browser.close();
    process.exit(1);
  }

  await context.storageState({ path: STORAGE_STATE_PATH });
  console.log(`Saved authenticated session to ${STORAGE_STATE_PATH}`);

  if (WORKSPACE_SLUG) {
    const workspaceUrl = `https://app.plane.so/${WORKSPACE_SLUG}/`;
    await page.goto(workspaceUrl, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
    const finalUrl = page.url();
    console.log(`Workspace check - navigated to ${workspaceUrl}, landed at ${finalUrl}`);
    if (/sign-?in|login/i.test(finalUrl)) {
      console.error("Session did not carry over to the workspace URL - login likely failed.");
      await browser.close();
      process.exit(1);
    }
    await page.screenshot({ path: path.join(AUTH_DIR, "workspace-check.png") });
    console.log(`Saved a confirmation screenshot to ${path.join(AUTH_DIR, "workspace-check.png")}`);
  }

  await browser.close();
}

main().catch((err) => {
  console.error("Login failed:", err.message);
  process.exit(1);
});
