import Link from "next/link";
import { runAllScenarios } from "@/evals/runner";

export default function EvalsPage() {
  const results = runAllScenarios();
  const passing = results.filter((r) => r.passed).length;

  return (
    <main id="main-content" className="detail-page">
      <Link href="/" className="back-link">← Back to workspace</Link>
      <p className="eyebrow">BUILT FOR CONFIDENCE</p>
      <h1 className="text-2xl font-bold text-gray-900">Reliability Evals</h1>
      <p className="mt-1 text-sm text-gray-500">
        Deterministic scenarios for the capability policy - the decision logic is never left to free-form
        model judgment, so these run instantly with no API calls.
      </p>

      <div className="eval-summary"><strong>{passing} / {results.length}</strong><div><p>Scenarios passing</p><small>{passing === results.length ? "All capability policy checks passed." : "Some checks need your attention."}</small></div></div>

      <ul className="mt-6 space-y-2">
        {results.map((r) => (
          <li
            key={r.id}
            className="eval-card text-sm"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900">{r.id}</span>
              <span className={r.passed ? "text-green-700" : "text-red-700"}>
                {r.passed ? "PASS" : "FAIL"}
              </span>
            </div>
            <p className="mt-1 text-gray-600">{r.description}</p>
            {!r.passed && (
              <p className="mt-1 text-xs text-red-700">
                expected {r.expected.decision} (includeInDemo: {String(r.expected.includeInDemo)}), got{" "}
                {r.actual.decision} (includeInDemo: {String(r.actual.includeInDemo)})
              </p>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
