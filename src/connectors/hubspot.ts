import { readFile } from "node:fs/promises";
import path from "node:path";
import type { CRMConnector, Opportunity } from "@/connectors/types";
import { connectorMode } from "@/connectors/types";

class HubSpotMockConnector implements CRMConnector {
  constructor(private fixtureName: string = "crm.json") {}

  async getOpportunity(accountName: string): Promise<Opportunity> {
    const fixturePath = path.join(process.cwd(), "data", "fixtures", this.fixtureName);
    const raw = await readFile(fixturePath, "utf8");
    const data = JSON.parse(raw) as Opportunity;
    if (data.accountName !== accountName) {
      throw new Error(`Mock CRM fixture is for "${data.accountName}", not "${accountName}"`);
    }
    return data;
  }
}

class HubSpotLiveConnector implements CRMConnector {
  async getOpportunity(): Promise<Opportunity> {
    throw new Error(
      "HubSpotLiveConnector not yet implemented (Phase 3). Set LIVE_MODE=false to use the mock connector."
    );
  }
}

export function getCRMConnector(fixtureName?: string): CRMConnector {
  return connectorMode() === "live" ? new HubSpotLiveConnector() : new HubSpotMockConnector(fixtureName);
}
