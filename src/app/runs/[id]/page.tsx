import { notFound } from "next/navigation";
import { loadRunTrace } from "@/trace/store";
import { ApprovalPanel } from "./ApprovalPanel";

const DECISION_STYLE: Record<string, string> = {
  ALLOW: "bg-green-100 text-green-800",
  ALLOW_WITH_WARNING: "bg-amber-100 text-amber-800",
  BLOCK: "bg-red-100 text-red-800",
  REQUIRE_HUMAN_REVIEW: "bg-gray-200 text-gray-700",
};

export default async function RunPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const trace = await loadRunTrace(id);
  if (!trace) notFound();

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <header className="border-b border-gray-200 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{trace.prospect}</h1>
            <p className="mt-1 text-sm text-gray-500">
              ${trace.demoPlan?.opportunityValue.toLocaleString()} opportunity &middot; Discovery &rarr;
              Personalized Technical Follow-Up
            </p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${
              trace.mode === "live" ? "bg-red-100 text-red-700" : "bg-gray-200 text-gray-700"
            }`}
          >
            {trace.mode.toUpperCase()}
          </span>
        </div>
      </header>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900">Requirements &amp; Verification</h2>
        <table className="mt-3 w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-500">
              <th className="py-2">Requirement</th>
              <th className="py-2">Buyer evidence</th>
              <th className="py-2">Decision</th>
            </tr>
          </thead>
          <tbody>
            {trace.decisions.map((d) => (
              <tr key={d.requirementId} className="border-b border-gray-100">
                <td className="py-3 font-medium text-gray-900">{d.capability}</td>
                <td className="max-w-xs py-3 text-gray-600">&ldquo;{d.buyerEvidence.quote}&rdquo;</td>
                <td className="py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${DECISION_STYLE[d.decision]}`}>
                    {d.decision}
                  </span>
                  <div className="mt-1 text-xs text-gray-500">{d.reason}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {trace.deferredTopics.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900">Deferred (not requirements)</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {trace.deferredTopics.map((t) => (
              <li key={t.name} className="rounded-md bg-gray-100 p-3">
                <span className="font-medium text-gray-900">{t.name}</span>
                <p className="mt-1 text-gray-600">&ldquo;{t.evidence.quote}&rdquo;</p>
                <p className="mt-1 text-xs text-gray-500">{t.note}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900">Demo Plan</h2>
        {trace.demoPlan && trace.demoPlan.scenes.length > 0 ? (
          <ol className="mt-3 space-y-4">
            {trace.demoPlan.scenes.map((scene, i) => {
              const capture = trace.captures.find((c) => c.sceneId === scene.id);
              return (
              <li key={scene.id} className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="text-xs font-bold uppercase tracking-wide text-indigo-600">
                  Scene {i + 1}
                </div>
                <div className="mt-1 font-semibold text-gray-900">{scene.title}</div>
                <p className="mt-1 text-sm text-gray-600">{scene.narration}</p>
                {capture && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={capture.publicUrl}
                    alt={scene.title}
                    className="mt-3 w-full rounded-md border border-gray-200"
                  />
                )}
                <details className="mt-2 text-xs text-gray-500">
                  <summary className="cursor-pointer">Evidence chain</summary>
                  <div className="mt-2 space-y-1">
                    <p>
                      <b>Buyer evidence:</b> &ldquo;{scene.buyerEvidence.quote}&rdquo;
                    </p>
                    {scene.productEvidence.map((pe, j) => (
                      <p key={j}>
                        <b>Product evidence:</b> {pe.sourceDocument} &mdash; {pe.evidenceText} ({pe.status})
                      </p>
                    ))}
                    <p>
                      <b>Product route:</b> {scene.productRoute}
                    </p>
                  </div>
                </details>
              </li>
              );
            })}
          </ol>
        ) : (
          <p className="mt-3 text-sm text-gray-500">No scenes generated.</p>
        )}
      </section>

      {trace.demoPlan && trace.demoPlan.scenes.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900">Personalized Walkthrough</h2>
          <video
            controls
            className="mt-3 w-full rounded-lg border border-gray-200"
            src="/media/northstar-walkthrough.mp4"
          />
          <p className="mt-2 text-xs text-gray-500">
            35s &middot; generated from the 3 real captured scenes above &middot; built with HyperFrames
          </p>
        </section>
      )}

      <ApprovalPanel
        runId={trace.runId}
        approvalStatus={trace.approvalStatus}
        message={trace.approvalRequest?.message ?? null}
        actions={trace.actions}
      />

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900">Next Steps</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {trace.nextSteps.map((step, i) => (
            <li key={i} className="rounded-md bg-white border border-gray-200 p-3">
              <span className="font-medium text-gray-900">{step.type}</span>
              {step.timeframe && <span className="ml-2 text-gray-500">({step.timeframe})</span>}
              <p className="mt-1 text-gray-600">&ldquo;{step.evidence.quote}&rdquo;</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <details className="rounded-lg border border-gray-200 bg-white p-4">
          <summary className="cursor-pointer text-sm font-semibold text-gray-900">
            Full run trace ({trace.steps.length} steps)
          </summary>
          <pre className="mt-3 overflow-x-auto text-xs text-gray-600">
            {JSON.stringify(trace.steps, null, 2)}
          </pre>
        </details>
      </section>
    </main>
  );
}
