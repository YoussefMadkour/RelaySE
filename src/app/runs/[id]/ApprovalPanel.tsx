"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ExternalAction } from "@/domain/schema";

const ACTION_LABEL: Record<ExternalAction["app"], string> = {
  gmail: "Gmail",
  calendar: "Calendar",
  hubspot: "HubSpot",
  slack: "Slack",
};

export function ApprovalPanel(props: {
  runId: string;
  approvalStatus: "pending" | "approved" | "rejected";
  message: string | null;
  actions: ExternalAction[];
}) {
  const router = useRouter();
  const [status, setStatus] = useState(props.approvalStatus);
  const [actions, setActions] = useState(props.actions);
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function act(kind: "approve" | "reject") {
    setLoading(kind);
    setError(null);
    try {
      const res = await fetch(`/api/runs/${props.runId}/${kind}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `${kind} failed`);
      setStatus(data.trace.approvalStatus);
      setActions(data.trace.actions);
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(null);
    }
  }

  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold text-gray-900">Approval</h2>

      {props.message && (
        <pre className="mt-3 whitespace-pre-wrap rounded-lg border border-gray-200 bg-gray-50 p-4 text-xs text-gray-700">
          {props.message}
        </pre>
      )}
      <p className="mt-1 text-xs text-gray-500">Posted to #demo-approvals in Slack.</p>

      {status === "pending" && (
        <div className="mt-4 flex gap-3">
          <button
            onClick={() => act("approve")}
            disabled={loading !== null}
            className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-500 disabled:opacity-50"
          >
            {loading === "approve" ? "Executing..." : "Approve"}
          </button>
          <button
            onClick={() => act("reject")}
            disabled={loading !== null}
            className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-300 disabled:opacity-50"
          >
            {loading === "reject" ? "..." : "Reject"}
          </button>
        </div>
      )}

      {status === "rejected" && (
        <p className="mt-4 text-sm font-medium text-gray-600">
          Rejected. No customer-facing actions were taken.
        </p>
      )}

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {status === "approved" && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-gray-900">Actions</h3>
          <ul className="mt-2 space-y-2 text-sm">
            {actions.map((a, i) => (
              <li
                key={i}
                className={`flex items-center justify-between rounded-md border p-3 ${
                  a.status === "success"
                    ? "border-green-200 bg-green-50"
                    : a.status === "failed"
                      ? "border-red-200 bg-red-50"
                      : "border-gray-200 bg-gray-50"
                }`}
              >
                <span className="font-medium text-gray-900">{ACTION_LABEL[a.app]}</span>
                <span className={a.status === "success" ? "text-green-700" : "text-red-700"}>
                  {a.status === "success" ? "✓ " : "✗ "}
                  {a.status.toUpperCase()}
                  {a.externalId ? ` (${a.externalId})` : ""}
                  {a.error ? ` — ${a.error}` : ""}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
