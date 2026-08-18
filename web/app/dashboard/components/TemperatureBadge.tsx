export type Temperature = "QUENTE" | "MORNO" | "FRIO";

const cfg: Record<Temperature, { label: string; color: string; bg: string }> = {
  QUENTE: { label: "Quente", color: "var(--hot)",  bg: "var(--hot10)"  },
  MORNO:  { label: "Morno",  color: "var(--warm)", bg: "var(--warm10)" },
  FRIO:   { label: "Frio",   color: "var(--cold)", bg: "var(--cold10)" },
};

export function TemperatureBadge({ temperature }: { temperature: Temperature }) {
  const c = cfg[temperature] ?? cfg.FRIO;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "2px 7px", borderRadius: 3,
      background: c.bg, color: c.color,
      fontSize: 11, fontWeight: 500,
      letterSpacing: "0.01em",
      whiteSpace: "nowrap" as const,
    }}>
      <span style={{
        width: 4, height: 4, borderRadius: "50%",
        background: c.color, flexShrink: 0,
      }} />
      {c.label}
    </span>
  );
}
