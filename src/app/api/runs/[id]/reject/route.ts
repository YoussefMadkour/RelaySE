import { NextResponse } from "next/server";
import { loadRunTrace, saveRunTrace } from "@/trace/store";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const trace = await loadRunTrace(id);
  if (!trace) {
    return NextResponse.json({ error: "Run not found" }, { status: 404 });
  }
  if (trace.approvalStatus !== "pending") {
    return NextResponse.json({ error: `Run is already ${trace.approvalStatus}` }, { status: 400 });
  }

  trace.approvalStatus = "rejected";
  await saveRunTrace(trace);
  return NextResponse.json({ trace });
}
