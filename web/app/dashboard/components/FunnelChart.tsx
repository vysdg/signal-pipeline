"use client";
import { useEffect, useState } from "react";

type Props = { total: number; processed: number; warm: number; hot: number };

export function FunnelChart({ total, processed, warm, hot }: Props) {
  const [ready, setReady] = useState(false);
  useEffect(() => { const t = setTimeout(() => setReady(true), 80); return () => clearTimeout(t); }, []);

  const pct = (n: number) => total > 0 ? Math.round((n / total) * 100) : 0;
  const stages = [
    { label: "Ingestão",   n: total,     p: 100,            color: "var(--t2)"   },
    { label: "Classificado", n: processed, p: pct(processed), color: "var(--t0)"  },
    { label: "Morno+",     n: warm,       p: pct(warm),      color: "var(--warm)" },
    { label: "Quente",     n: hot,        p: pct(hot),       color: "var(--hot)"  },
  ];

  return (
    <div className="surface" style={{ padding: "16px 18px" }}>
      <p className="label" style={{ marginBottom: 14 }}>Funil de conversão</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {stages.map(({ label, n, p, color }) => (
          <div key={label}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
              <span style={{ fontSize: 11, color: "var(--t1)" }}>{label}</span>
              <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
                <span className="mono" style={{ fontSize: 12, color: "var(--t0)", fontWeight: 500 }}>{n}</span>
                <span className="label">{p}%</span>
              </div>
            </div>
            <div style={{ height: 2, background: "var(--b0)", borderRadius: 99, overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: ready ? `${Math.max(p, 1)}%` : "0%",
                background: color, borderRadius: 99,
                transition: "width 0.7s cubic-bezier(0.16,1,0.3,1)",
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
