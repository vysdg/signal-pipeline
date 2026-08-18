"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, GitBranch, Activity, Settings } from "lucide-react";

const nav = [
  { href: "/dashboard",          icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/leads",    icon: Users,           label: "Leads"     },
  { href: "/dashboard/pipeline", icon: GitBranch,       label: "Pipeline"  },
  { href: "/dashboard/monitor",  icon: Activity,        label: "Monitor"   },
];

export function Sidebar() {
  const path = usePathname();

  function Item({ href, icon: Icon, label }: { href: string; icon: React.ElementType; label: string }) {
    const active = path === href || (href !== "/dashboard" && path.startsWith(href));
    return (
      <Link
        href={href}
        className="transition"
        style={{
          display: "flex", alignItems: "center", gap: 8,
          height: 30, padding: "0 10px",
          borderRadius: 4,
          fontSize: 13,
          fontWeight: active ? 500 : 400,
          color: active ? "var(--t0)" : "var(--t1)",
          background: active ? "var(--s3)" : "transparent",
          textDecoration: "none",
          borderLeft: `2px solid ${active ? "var(--t0)" : "transparent"}`,
          paddingLeft: active ? 8 : 10,
        }}
        onMouseEnter={e => {
          if (!active) {
            const el = e.currentTarget as HTMLAnchorElement;
            el.style.color = "var(--t0)";
            el.style.background = "rgba(28,25,23,0.04)";
          }
        }}
        onMouseLeave={e => {
          if (!active) {
            const el = e.currentTarget as HTMLAnchorElement;
            el.style.color = "var(--t1)";
            el.style.background = "transparent";
          }
        }}
      >
        <Icon size={13} strokeWidth={1.7} style={{ flexShrink: 0 }} />
        {label}
      </Link>
    );
  }

  return (
    <aside style={{
      width: 196,
      minHeight: "100vh",
      background: "var(--s2)",
      borderRight: "1px solid var(--b0)",
      display: "flex",
      flexDirection: "column",
      flexShrink: 0,
      padding: "14px 8px",
    }}>
      {/* Wordmark */}
      <div style={{ padding: "2px 10px 18px", display: "flex", alignItems: "center", gap: 7 }}>
        <div style={{
          width: 16, height: 16,
          background: "var(--t0)",
          borderRadius: 3,
          flexShrink: 0,
        }} />
        <span className="mono" style={{
          fontSize: 13,
          color: "var(--t0)",
          letterSpacing: "0.01em",
          fontWeight: 500,
        }}>
          signal
        </span>
      </div>

      {/* Nav */}
      <div style={{ display: "flex", flexDirection: "column", gap: 1, flex: 1 }}>
        {nav.map(item => <Item key={item.href} {...item} />)}
      </div>

      <div style={{ height: 1, background: "var(--b0)", margin: "8px 2px" }} />

      <div style={{ marginBottom: 10 }}>
        <Item href="/dashboard/settings" icon={Settings} label="Settings" />
      </div>

      {/* Live indicator */}
      <div style={{ padding: "0 10px", display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#16A34A", flexShrink: 0 }} />
        <span className="label">Live</span>
      </div>
    </aside>
  );
}
