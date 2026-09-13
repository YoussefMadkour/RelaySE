import { runAllScenarios } from "@/evals/runner";

export default function EvalsPage() {
  const results = runAllScenarios();
  const passing = results.filter((r) => r.passed).length;

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-2xl font-bold text-gray-900">Reliability Evals</h1>
      <p className="mt-1 text-sm text-gray-500">
        Deterministic scenarios for the capability policy - the decision logic is never left to free-form
        model judgment, so these run instantly with no API calls.
      </p>

      <div className="mt-4 inline-block rounded-full bg-gray-900 px-4 py-1.5 text-sm font-bold text-white">
        {passing} / {results.length} scenarios passing
      </div>

      <ul className="mt-6 space-y-2">
        {results.map((r) => (
          <li
            key={r.id}
            className={`rounded-md border p-3 text-sm ${
              r.passed ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
            }`}
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
