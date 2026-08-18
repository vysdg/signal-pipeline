"use client";
import { useEffect, useState } from "react";

type Props = { total: number; processed: number; warm: number; hot: number };

const steps = (total: number, processed: number, warm: number, hot: number) => [
  { label: "Ingestão",   value: total,     pct: 100,                                          color: "#7c7c99", glow: "rgba(124,124,153,0.3)" },
  { label: "Processado", value: processed, pct: total > 0 ? Math.round((processed/total)*100) : 0, color: "#a78bfa", glow: "rgba(167,139,250,0.3)" },
  { label: "Morno+",     value: warm,      pct: total > 0 ? Math.round((warm/total)*100) : 0, color: "#f59e0b", glow: "rgba(245,158,11,0.3)" },
  { label: "Quente",     value: hot,       pct: total > 0 ? Math.round((hot/total)*100) : 0,  color: "#ff4b4b", glow: "rgba(255,75,75,0.3)" },
];

export function FunnelChart({ total, processed, warm, hot }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 150); return () => clearTimeout(t); }, []);

  const data = steps(total, processed, warm, hot);

  return (
    <div className="glass animate-rise s4" style={{ padding: "20px" }}>
      <p style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 20 }}>
        Funil de conversão
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {data.map((s) => (
          <div key={s.label}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>{s.label}</span>
              <span style={{ fontSize: 11, color: s.color, fontWeight: 500 }}>
                {s.value} <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>({s.pct}%)</span>
              </span>
            </div>
            <div style={{ height: 4, background: "rgba(255,255,255,0.05)", borderRadius: 99, overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: mounted ? `${Math.max(s.pct, 2)}%` : "0%",
                background: s.color,
                boxShadow: `0 0 8px ${s.glow}`,
                borderRadius: 99,
                transition: "width 0.8s cubic-bezier(0.16,1,0.3,1)",
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
