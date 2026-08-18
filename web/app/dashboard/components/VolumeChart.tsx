"use client";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type DataPoint = { date: string; quente: number; morno: number; frio: number };

function Tip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "var(--s1)", border: "1px solid var(--b1)",
      borderRadius: "var(--r)", padding: "10px 14px",
      boxShadow: "0 4px 12px rgba(28,25,23,0.08)",
    }}>
      <p className="label" style={{ marginBottom: 7 }}>{label}</p>
      {payload.map(p => (
        <div key={p.name} style={{ display: "flex", justifyContent: "space-between", gap: 14, fontSize: 12, marginBottom: 2 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--t1)" }}>
            <span style={{ width: 8, height: 1.5, background: p.color, display: "inline-block" }} />
            {p.name}
          </span>
          <span className="mono" style={{ color: "var(--t0)", fontWeight: 500 }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
}

export function VolumeChart({ data }: { data: DataPoint[] }) {
  return (
    <div className="surface" style={{ padding: "16px 18px 10px" }}>
      <p className="label" style={{ marginBottom: 14 }}>Volume semanal</p>
      <ResponsiveContainer width="100%" height={140}>
        <AreaChart data={data} margin={{ top: 2, right: 0, left: -28, bottom: 0 }}>
          <defs>
            {([["hot","var(--hot)"],["warm","var(--warm)"],["cold","var(--cold)"]] as const).map(([id,color])=>(
              <linearGradient key={id} id={`g-${id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor={color} stopOpacity={0.10} />
                <stop offset="100%" stopColor={color} stopOpacity={0}    />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid vertical={false} stroke="var(--b0)" />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--t2)" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: "var(--t2)" }} axisLine={false} tickLine={false} />
          <Tooltip content={<Tip />} cursor={{ stroke: "var(--b1)", strokeWidth: 1 }} />
          <Area dataKey="quente" name="Quente" stroke="var(--hot)"  fill="url(#g-hot)"  strokeWidth={1.5} dot={false} />
          <Area dataKey="morno"  name="Morno"  stroke="var(--warm)" fill="url(#g-warm)" strokeWidth={1.5} dot={false} />
          <Area dataKey="frio"   name="Frio"   stroke="var(--cold)" fill="url(#g-cold)" strokeWidth={1.5} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
