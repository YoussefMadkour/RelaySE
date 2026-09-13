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

// Seeded live HubSpot deal ID (see setup/hubspot.md / scripts/seed-hubspot.mjs
// output). The read side (getCRMConnector above) stays mock-fixture-based for
// now, but the final CRM update is a real outbound side effect with no useful
// "mock" version for a working demo - it always writes to the real deal.
const NORTHSTAR_DEAL_ID = "521436910788";

export interface HubSpotFollowupWriter {
  updateFollowup(params: {
    verifiedRequirements: string;
    blockedRequirements: string;
    walkthroughUrl: string;
    nextTechnicalStep: string;
  }): Promise<{ dealId: string }>;
}

class HubSpotFollowupLiveWriter implements HubSpotFollowupWriter {
  async updateFollowup(params: {
    verifiedRequirements: string;
    blockedRequirements: string;
    walkthroughUrl: string;
    nextTechnicalStep: string;
  }): Promise<{ dealId: string }> {
    const token = process.env.HUBSPOT_ACCESS_TOKEN;
    const baseUrl = process.env.HUBSPOT_BASE_URL || "https://api.hubapi.com";
    if (!token) throw new Error("HUBSPOT_ACCESS_TOKEN is not set.");

    const res = await fetch(`${baseUrl}/crm/v3/objects/deals/${NORTHSTAR_DEAL_ID}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        properties: {
          verified_requirements: params.verifiedRequirements,
          blocked_requirements: params.blockedRequirements,
          walkthrough_url: params.walkthroughUrl,
          next_technical_step: params.nextTechnicalStep,
        },
      }),
    });
    const body = await res.json();
    if (!res.ok) {
      throw new Error(`HubSpot deal update failed: ${JSON.stringify(body)}`);
    }
    return { dealId: NORTHSTAR_DEAL_ID };
  }
}

export function getHubSpotFollowupWriter(): HubSpotFollowupWriter {
  return new HubSpotFollowupLiveWriter();
}
