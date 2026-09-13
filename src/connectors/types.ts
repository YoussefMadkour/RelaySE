import type { CapabilityEvidence } from "@/domain/schema";

export type Opportunity = {
  accountName: string;
  opportunity: {
    name: string;
    amount: number;
    stage: string;
    owner: string;
  };
  contacts: { name: string; title: string; role: string }[];
  existingNextStep: string | null;
  existingMeeting: { title: string; eventId: string; attendees: string[] } | null;
};

export interface CRMConnector {
  getOpportunity(accountName: string): Promise<Opportunity>;
}

export interface DriveConnector {
  getCapabilityMatrix(): Promise<CapabilityEvidence[]>;
}

export type ConnectorMode = "mock" | "live";

export function connectorMode(): ConnectorMode {
  return process.env.LIVE_MODE === "true" ? "live" : "mock";
}
