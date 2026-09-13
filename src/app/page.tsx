"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runScenario() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/run", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Run failed");
      router.push(`/runs/${data.runId}`);
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-20">
      <h1 className="text-2xl font-bold text-gray-900">Verified Discovery-to-Demo Agent</h1>
      <p className="mt-2 text-gray-600">
        An AI Solutions Engineer that turns a discovery-call transcript into a verified, personalized
        product walkthrough.
      </p>

      <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="font-semibold text-gray-900">Northstar Labs</h2>
        <p className="mt-1 text-sm text-gray-500">
          $250,000 opportunity &middot; Discovery &rarr; Personalized Technical Follow-Up
        </p>
        <button
          onClick={runScenario}
          disabled={loading}
          className="mt-4 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          {loading ? "Running..." : "Run scenario"}
        </button>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>
    </main>
  );
}
