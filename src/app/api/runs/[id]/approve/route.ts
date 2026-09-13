import { NextResponse } from "next/server";
import { loadRunTrace, saveRunTrace } from "@/trace/store";
import { executeFollowup } from "@/agent/executeFollowup";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const trace = await loadRunTrace(id);
  if (!trace) {
    return NextResponse.json({ error: "Run not found" }, { status: 404 });
  }
  if (!trace.demoPlan) {
    return NextResponse.json({ error: "Run has no demo plan to execute" }, { status: 400 });
  }
  if (trace.approvalStatus !== "pending") {
    return NextResponse.json({ error: `Run is already ${trace.approvalStatus}` }, { status: 400 });
  }

  try {
    const actions = await executeFollowup({ demoPlan: trace.demoPlan, nextSteps: trace.nextSteps });
    trace.approvalStatus = "approved";
    trace.actions = actions;
    await saveRunTrace(trace);
    return NextResponse.json({ trace });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
