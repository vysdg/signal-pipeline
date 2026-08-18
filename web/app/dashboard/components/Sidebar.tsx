"use client";
import { LayoutDashboard, Users, GitBranch, Zap, Settings, Activity } from "lucide-react";

const nav = [
  { icon: LayoutDashboard, label: "Dashboard",  href: "/dashboard", active: true },
  { icon: Users,           label: "Leads",      href: "/dashboard/leads" },
  { icon: GitBranch,       label: "Pipeline",   href: "/dashboard/pipeline" },
  { icon: Activity,        label: "Monitor",    href: "/dashboard/monitor" },
  { icon: Settings,        label: "Ajustes",    href: "/dashboard/settings" },
];

export function Sidebar() {
  return (
    <aside
      style={{
        width: 56,
        background: "var(--bg-surface)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "16px 0",
        gap: 4,
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div
        style={{
          width: 32, height: 32,
          borderRadius: 10,
          background: "var(--green)",
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: 16,
          flexShrink: 0,
        }}
      >
        <Zap size={16} color="#09090c" strokeWidth={2.5} />
      </div>

      {/* Nav items */}
      {nav.map(({ icon: Icon, label, href, active }) => (
        <a
          key={href}
          href={href}
          title={label}
          style={{
            width: 36, height: 36,
            borderRadius: 10,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: active ? "var(--green-dim)" : "transparent",
            color: active ? "var(--green)" : "var(--text-muted)",
            transition: "background 0.15s, color 0.15s",
            textDecoration: "none",
          }}
          onMouseEnter={e => {
            if (!active) {
              (e.currentTarget as HTMLAnchorElement).style.background = "var(--bg-elevated)";
              (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-secondary)";
            }
          }}
          onMouseLeave={e => {
            if (!active) {
              (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
              (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-muted)";
            }
          }}
        >
          <Icon size={16} strokeWidth={1.8} />
        </a>
      ))}

      {/* Live indicator */}
      <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
        <div className="glow-dot" />
        <span style={{ fontSize: 9, color: "var(--text-muted)", letterSpacing: "0.05em" }}>LIVE</span>
      </div>
    </aside>
  );
}
