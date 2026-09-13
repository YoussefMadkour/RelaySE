import { readFile } from "node:fs/promises";
import path from "node:path";
import type { CapabilityEvidence } from "@/domain/schema";
import type { DriveConnector } from "@/connectors/types";
import { connectorMode } from "@/connectors/types";

class DriveMockConnector implements DriveConnector {
  async getCapabilityMatrix(): Promise<CapabilityEvidence[]> {
    const fixturePath = path.join(process.cwd(), "data", "fixtures", "capability-matrix.json");
    const raw = await readFile(fixturePath, "utf8");
    return JSON.parse(raw) as CapabilityEvidence[];
  }
}

class DriveLiveConnector implements DriveConnector {
  async getCapabilityMatrix(): Promise<CapabilityEvidence[]> {
    throw new Error(
      "DriveLiveConnector not yet implemented (Phase 3). Set LIVE_MODE=false to use the mock connector."
    );
  }
}

export function getDriveConnector(): DriveConnector {
  return connectorMode() === "live" ? new DriveLiveConnector() : new DriveMockConnector();
}
