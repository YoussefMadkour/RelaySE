"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function RunButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function runScenario() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/run", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Run failed. Please try again.");
      router.push(`/runs/${data.runId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setLoading(false);
    }
  }
  return <><button className="primary-button" disabled={loading} onClick={runScenario} aria-busy={loading}>{loading ? <><span className="spinner" /> Building your demo…</> : <>Run scenario <span aria-hidden="true">↗</span></>}</button>{loading && <p className="button-note" role="status">Checking evidence and preparing your walkthrough. This may take a moment.</p>}{error && <p className="error-message" role="alert">{error}</p>}</>;
}
