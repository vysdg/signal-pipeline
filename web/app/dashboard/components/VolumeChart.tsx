"use client";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";

type Props = { data: { date: string; quente: number; morno: number; frio: number }[] };

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "var(--bg-elevated)",
      border: "1px solid var(--border-strong)",
      borderRadius: 10, padding: "10px 14px",
      fontSize: 12, color: "var(--text-primary)",
    }}>
      <p style={{ color: "var(--text-secondary)", marginBottom: 6, fontSize: 11 }}>{label}</p>
      {payload.map(p => (
        <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: p.color, flexShrink: 0 }} />
          <span style={{ color: "var(--text-secondary)" }}>{p.name}:</span>
          <span style={{ fontWeight: 500 }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
}

export function VolumeChart({ data }: Props) {
  return (
    <div className="glass animate-rise s3" style={{ padding: "20px 20px 12px" }}>
      <p style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>
        Volume por temperatura
      </p>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} barSize={14} barGap={3}>
          <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "var(--text-muted)" }}
            axisLine={false} tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "var(--text-muted)" }}
            axisLine={false} tickLine={false} width={24}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
          <Legend
            wrapperStyle={{ fontSize: 10, color: "var(--text-secondary)", paddingTop: 8 }}
            iconSize={6} iconType="circle"
          />
          <Bar dataKey="quente" name="Quente" fill="#ff4b4b" radius={[3, 3, 0, 0]} opacity={0.9} />
          <Bar dataKey="morno"  name="Morno"  fill="#f59e0b" radius={[3, 3, 0, 0]} opacity={0.9} />
          <Bar dataKey="frio"   name="Frio"   fill="#3b82f6" radius={[3, 3, 0, 0]} opacity={0.9} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
