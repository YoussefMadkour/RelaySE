import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium, type Browser } from "playwright";
import type { DemoScene } from "@/domain/schema";

export type CaptureResult = {
  sceneId: string;
  screenshotPath: string;
  route: string;
  capturedAt: string;
};

export type CaptureOptions = {
  baseUrl: string;
  storageStatePath?: string;
  outputDir?: string;
  viewport?: { width: number; height: number };
};

/**
 * Deterministic capture runner. Authenticates once (via a saved Playwright
 * storage state - see scripts/plane-login.ts for how that gets created),
 * then visits each scene's product route and captures a screenshot.
 *
 * Fails loudly if a route cannot be loaded. Never silently substitutes a
 * fake screenshot - a failed capture must block the walkthrough, not produce
 * a misleading one.
 */
export async function captureScenes(scenes: DemoScene[], options: CaptureOptions): Promise<CaptureResult[]> {
  const outputDir = options.outputDir ?? path.join(process.cwd(), "data", "traces", "screenshots");
  await mkdir(outputDir, { recursive: true });

  let browser: Browser | null = null;
  const results: CaptureResult[] = [];

  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: options.viewport ?? { width: 1440, height: 900 },
      storageState: options.storageStatePath,
    });
    const page = await context.newPage();

    for (const scene of scenes) {
      const url = new URL(scene.productRoute, options.baseUrl).toString();
      try {
        // Plane is an SPA with persistent background connections (websockets/
        // polling) that never go fully idle, so "networkidle" reliably times
        // out here. Use "domcontentloaded" plus a best-effort short idle
        // window, then a fixed settle time for client-rendered content.
        const response = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20_000 });
        if (!response || !response.ok()) {
          throw new Error(`HTTP ${response?.status() ?? "no response"} loading ${url}`);
        }
        await page.waitForLoadState("networkidle", { timeout: 5_000 }).catch(() => {});
        await page.waitForTimeout(1500);

        // Plane is an SPA: an invalid/missing resource (deleted project, bad
        // ID, expired session redirected to login) still returns HTTP 200
        // with the app shell - the failure only shows up in the rendered
        // content. A raw HTTP status check alone would silently accept a
        // "not found" or "sign in" screen as a valid capture.
        const bodyText = (await page.textContent("body")) ?? "";
        const notFoundMatch = bodyText.match(/project not found|page not found|does not exist|cycle not found/i);
        if (notFoundMatch) {
          throw new Error(`Page rendered a "${notFoundMatch[0]}" state instead of real content`);
        }
        if (/sign in|log in/i.test(bodyText.slice(0, 300))) {
          throw new Error("Page rendered a sign-in screen - the saved session has likely expired");
        }

        const screenshotPath = path.join(outputDir, `${scene.id}.png`);
        await page.screenshot({ path: screenshotPath, fullPage: false });

        results.push({
          sceneId: scene.id,
          screenshotPath,
          route: scene.productRoute,
          capturedAt: new Date().toISOString(),
        });
      } catch (err) {
        throw new Error(
          `Capture failed for scene "${scene.title}" (${scene.productRoute}): ${(err as Error).message}. ` +
            `Blocking walkthrough generation rather than substituting a fake screenshot.`
        );
      }
    }
  } finally {
    await browser?.close();
  }

  return results;
}
