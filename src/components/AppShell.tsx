"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isEvals = pathname.startsWith("/evals");
  const isRun = pathname.startsWith("/runs/");
  return <div className="app-shell">
    <a className="skip-link" href="#main-content">Skip to content</a>
    <aside className="sidebar">
      <Link href="/" className="brand"><span className="brand-mark">r<span>↗</span></span>relay<span className="brand-suffix">SE</span></Link>
      <div className="workspace-label"><span className="workspace-avatar">SE</span><div>Solutions workspace<small>Discovery to demo</small></div></div>
      <p className="nav-label">WORKSPACE</p>
      <nav aria-label="Main navigation"><Link href="/" className={`nav-item ${!isEvals && !isRun ? "active" : ""}`} aria-current={pathname === "/" ? "page" : undefined}><span aria-hidden="true">▦</span>Overview</Link><Link href="/#recent-runs" className={`nav-item ${isRun ? "active" : ""}`}><span aria-hidden="true">▤</span>Scenario runs</Link><Link href="/evals" className={`nav-item ${isEvals ? "active" : ""}`} aria-current={isEvals ? "page" : undefined}><span aria-hidden="true">◇</span>Reliability</Link></nav>
      <div className="sidebar-bottom"><div className="trust-card"><span className="trust-icon">✓</span><strong>Confidence, by design.</strong><p>Verified capabilities.<br />A human in the loop.</p><Link href="/evals">View reliability checks ↗</Link></div><div className="workspace-identity"><span className="workspace-avatar">SE</span><div>Solutions engineering<small>RelaySE workspace</small></div></div></div>
    </aside>
    <div className="app-body"><div className="topbar"><div>Workspace <span>/</span> <strong>{isEvals ? "Reliability" : isRun ? "Scenario run" : "Overview"}</strong></div><span className="topbar-label"><span className="status-dot" /> Evidence-first demos</span></div>{children}</div>
  </div>;
}
