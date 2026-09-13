import Link from "next/link";
import { listRunTraces } from "@/trace/store";
import { RunButton } from "@/components/RunButton";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const runs = await listRunTraces();
  const pending = runs.filter((run) => run.approvalStatus === "pending").length;
  return (
    <main id="main-content" className="workspace">
      <header className="page-heading">
        <div><p className="eyebrow">YOUR SOLUTIONS ENGINEERING WORKSPACE</p><h1>Great demos start with discovery.</h1><p>Turn what your buyer needs into a demo you can stand behind.</p></div>
        <span className="subtle-tag"><span className="status-dot" /> Human approval built in</span>
      </header>
      <div className="stats-grid">
        <div className="stat-card"><span>Available scenario</span><div>01 <small>Ready to explore</small></div></div>
        <div className="stat-card"><span>Total runs</span><div>{String(runs.length).padStart(2, "0")} <small>Discovery to demo</small></div></div>
        <div className="stat-card"><span>Awaiting approval</span><div>{String(pending).padStart(2, "0")} <small>Human review</small></div></div>
      </div>
      <div className="section-heading"><h2>Your next great demo</h2><span>Featured scenario</span></div>
      <section className="scenario-card">
        <div className="scenario-copy">
          <span className="scenario-label"><span className="status-dot" /> READY TO RUN</span>
          <div className="account-heading"><span className="account-mark">N<span>✳</span></span><div><h2>Northstar Labs</h2><p>Discovery → Technical follow-up</p></div></div>
          <p className="scenario-description">A real buyer conversation. A tailored product story. Every capability checked against the evidence.</p>
          <div className="opportunity"><span>$250,000</span><small>Opportunity value</small></div>
          <div className="scenario-tags"><span>Discovery transcript</span><span>Product evidence</span><span>CRM context</span></div>
          <RunButton />
          <p className="button-note">Review the plan before customer-facing actions.</p>
        </div>
        <div className="scenario-preview">
          <div className="preview-heading"><span className="eyebrow">THE OUTPUT</span><span>Personalized walkthrough ↗</span></div>
          <video controls preload="none" poster="/media/plane-captures/scene-1-intake.png" aria-label="Northstar Labs example product walkthrough" src="/media/northstar-walkthrough.mp4" />
          <div className="preview-caption"><div><strong>Built around the buyer.</strong><p>From work intake to sprint planning.</p></div><span className="preview-duration">35 sec</span></div>
          <div className="evidence-note"><span>✓</span> An example walkthrough grounded in product evidence</div>
        </div>
      </section>
      <section className="workflow-section" aria-labelledby="workflow-title">
        <div className="section-heading"><h2 id="workflow-title">From conversation to confidence</h2><span>One connected workflow</span></div>
        <div className="workflow-grid">{[
          ["01", "Understand", "Extract buyer needs from the discovery conversation."],
          ["02", "Verify", "Check every capability against product evidence."],
          ["03", "Personalize", "Build a walkthrough around what matters to the buyer."],
          ["04", "Review & act", "Approve the follow-up before it reaches your customer."],
        ].map(([number, title, description]) => <div className="workflow-step" key={number}><span className="step-number">{number}</span><h3>{title}</h3><p>{description}</p></div>)}</div>
      </section>
      <section id="recent-runs" className="recent-runs">
        <div className="section-heading"><h2>Recent runs <span className="count-badge">{runs.length}</span></h2><span>Your discovery-to-demo activity</span></div>
        {runs.length ? <div className="runs-list">{runs.slice(0, 5).map(run => <Link className="run-row" href={`/runs/${run.runId}`} key={run.runId}><span className="run-avatar">N</span><div className="run-name"><strong>{run.prospect}</strong><span>{new Date(run.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })} · {run.mode} mode</span></div><span className={`run-status ${run.approvalStatus}`}>{run.approvalStatus === "pending" ? "Awaiting approval" : run.approvalStatus}</span><span className="row-arrow" aria-hidden="true">↗</span></Link>)}</div> : <div className="empty-state"><strong>Your first demo starts here.</strong><p>Run the Northstar Labs scenario to see its verified plan and evidence.</p></div>}
      </section>
      <footer className="workspace-footer"><span>Grounded in evidence. Guided by you.</span><Link href="/evals">Explore reliability checks →</Link></footer>
    </main>
  );
}
