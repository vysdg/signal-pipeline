"use client";
import { useEffect, useState } from "react";

type Props = { total: number; processed: number; warm: number; hot: number };

export function FunnelChart({ total, processed, warm, hot }: Props) {
  const [ready, setReady] = useState(false);
  useEffect(() => { const t = setTimeout(() => setReady(true), 100); return () => clearTimeout(t); }, []);

  const pct = (n: number) => (total > 0 ? Math.round((n / total) * 100) : 0);

  const stages = [
    { label: "Ingestão",   n: total,     p: 100,           color: "var(--t2)" },
    { label: "Processado", n: processed, p: pct(processed), color: "var(--a)"  },
    { label: "Morno+",     n: warm,      p: pct(warm),      color: "var(--warm)" },
    { label: "Quente",     n: hot,       p: pct(hot),       color: "var(--hot)"  },
  ];

  return (
    <div className="surface" style={{ padding: "18px 20px" }}>
      <p className="label" style={{ marginBottom: 16 }}>Funil</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {stages.map(({ label, n, p, color }) => (
          <div key={label}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: 6,
            }}>
              <span style={{ fontSize: 12, color: "var(--t1)" }}>{label}</span>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <span className="mono" style={{ fontSize: 13, color: "var(--t0)" }}>{n}</span>
                <span className="mono label">{p}%</span>
              </div>
            </div>
            <div style={{
              height: 2,
              background: "var(--b1)",
              borderRadius: 99,
              overflow: "hidden",
            }}>
              <div style={{
                height: "100%",
                width: ready ? `${Math.max(p, 1)}%` : "0%",
                background: color,
                borderRadius: 99,
                transition: "width 0.7s cubic-bezier(0.16,1,0.3,1)",
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
