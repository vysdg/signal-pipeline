export type Temperature = "QUENTE" | "MORNO" | "FRIO";

const config: Record<Temperature, { label: string; dot: string; bg: string; color: string }> = {
  QUENTE: { label: "Quente", dot: "#ff4b4b", bg: "rgba(255,75,75,0.12)",  color: "#ff7070" },
  MORNO:  { label: "Morno",  dot: "#f59e0b", bg: "rgba(245,158,11,0.12)", color: "#fbbf24" },
  FRIO:   { label: "Frio",   dot: "#3b82f6", bg: "rgba(59,130,246,0.12)", color: "#60a5fa" },
};

export function TemperatureBadge({ temperature }: { temperature: Temperature }) {
  const c = config[temperature] ?? config.FRIO;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 9px", borderRadius: 99,
      background: c.bg, color: c.color,
      fontSize: 11, fontWeight: 500, letterSpacing: "0.02em",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: c.dot, flexShrink: 0 }} />
      {c.label}
    </span>
  );
}
