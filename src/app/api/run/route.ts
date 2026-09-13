import { NextResponse } from "next/server";
import { runDiscoveryToDemoAgent } from "@/agent/orchestrator";

export async function POST() {
  try {
    const trace = await runDiscoveryToDemoAgent({
      accountName: "Northstar Labs",
      transcriptRelativePath: "data/transcripts/northstar-discovery.md",
      crmFixture: "crm.json",
    });
    return NextResponse.json({ runId: trace.runId });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
