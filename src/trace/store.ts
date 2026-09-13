import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { RunTraceSchema, type RunTrace } from "@/trace/schema";

const TRACES_DIR = path.join(process.cwd(), "data", "traces");

export async function saveRunTrace(trace: RunTrace): Promise<void> {
  await mkdir(TRACES_DIR, { recursive: true });
  const filePath = path.join(TRACES_DIR, `${trace.runId}.json`);
  await writeFile(filePath, JSON.stringify(trace, null, 2), "utf8");
}

export async function loadRunTrace(runId: string): Promise<RunTrace | null> {
  try {
    const filePath = path.join(TRACES_DIR, `${runId}.json`);
    const raw = await readFile(filePath, "utf8");
    return RunTraceSchema.parse(JSON.parse(raw));
  } catch {
    return null;
  }
}

export async function listRunTraces(): Promise<RunTrace[]> {
  try {
    const files = await readdir(TRACES_DIR);
    const traces = await Promise.all(
      files.filter((f) => f.endsWith(".json")).map((f) => loadRunTrace(f.replace(/\.json$/, "")))
    );
    return traces.filter((t): t is RunTrace => t !== null).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch {
    return [];
  }
}
