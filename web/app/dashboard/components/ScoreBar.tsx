type Props = { score: number; temperature: "QUENTE" | "MORNO" | "FRIO" };

const colors: Record<string, string> = {
  QUENTE: "#ff4b4b",
  MORNO:  "#f59e0b",
  FRIO:   "#3b82f6",
};

export function ScoreBar({ score, temperature }: Props) {
  const color = colors[temperature] ?? colors.FRIO;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-primary)", width: 22, flexShrink: 0 }}>
        {score}
      </span>
      <div style={{
        flex: 1, height: 3,
        background: "rgba(255,255,255,0.06)",
        borderRadius: 99, overflow: "hidden",
      }}>
        <div style={{
          height: "100%", borderRadius: 99,
          width: `${score}%`,
          background: color,
          boxShadow: `0 0 6px ${color}80`,
          transition: "width 0.8s cubic-bezier(0.16,1,0.3,1)",
        }} />
      </div>
    </div>
  );
}
