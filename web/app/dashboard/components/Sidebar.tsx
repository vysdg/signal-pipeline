"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, GitBranch, Activity, Settings } from "lucide-react";

const nav = [
  { href: "/dashboard",          icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/leads",    icon: Users,           label: "Leads" },
  { href: "/dashboard/pipeline", icon: GitBranch,       label: "Pipeline" },
  { href: "/dashboard/monitor",  icon: Activity,        label: "Monitor" },
];

const bottom = [
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
];

export function Sidebar() {
  const path = usePathname();

  function NavItem({ href, icon: Icon, label }: { href: string; icon: React.ElementType; label: string }) {
    const active = path === href || (href !== "/dashboard" && path.startsWith(href));
    return (
      <Link
        href={href}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 9,
          height: 32,
          padding: "0 12px",
          borderRadius: 5,
          fontSize: 13,
          fontWeight: active ? 500 : 400,
          color: active ? "var(--t0)" : "var(--t1)",
          background: active ? "var(--s2)" : "transparent",
          textDecoration: "none",
          borderLeft: active ? "2px solid var(--a)" : "2px solid transparent",
          paddingLeft: active ? 10 : 12,
          transition: "color 0.12s, background 0.12s",
          whiteSpace: "nowrap" as const,
        }}
        onMouseEnter={e => {
          if (!active) {
            (e.currentTarget as HTMLAnchorElement).style.color = "var(--t0)";
            (e.currentTarget as HTMLAnchorElement).style.background = "var(--s2)";
          }
        }}
        onMouseLeave={e => {
          if (!active) {
            (e.currentTarget as HTMLAnchorElement).style.color = "var(--t1)";
            (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
          }
        }}
      >
        <Icon size={14} strokeWidth={1.6} style={{ flexShrink: 0 }} />
        {label}
      </Link>
    );
  }

  return (
    <aside style={{
      width: 200,
      minHeight: "100vh",
      background: "var(--s1)",
      borderRight: "1px solid var(--b0)",
      display: "flex",
      flexDirection: "column",
      flexShrink: 0,
      padding: "16px 10px",
    }}>
      {/* Logo */}
      <div style={{
        padding: "4px 12px 20px",
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}>
        <div style={{
          width: 20, height: 20,
          background: "var(--a)",
          borderRadius: 4,
          flexShrink: 0,
        }} />
        <span style={{
          fontSize: 13,
          fontWeight: 600,
          color: "var(--t0)",
          letterSpacing: "-0.01em",
        }}>
          signal
        </span>
      </div>

      {/* Primary nav */}
      <div style={{ display: "flex", flexDirection: "column", gap: 1, flex: 1 }}>
        {nav.map(item => <NavItem key={item.href} {...item} />)}
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "var(--b0)", margin: "10px 2px" }} />

      {/* Bottom nav */}
      <div style={{ display: "flex", flexDirection: "column", gap: 1, marginBottom: 12 }}>
        {bottom.map(item => <NavItem key={item.href} {...item} />)}
      </div>

      {/* Status */}
      <div style={{ padding: "0 12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{
            width: 5, height: 5,
            borderRadius: "50%",
            background: "#22C55E",
            flexShrink: 0,
          }} />
          <span style={{ fontSize: 11, color: "var(--t2)" }}>Live</span>
        </div>
      </div>
    </aside>
  );
}
