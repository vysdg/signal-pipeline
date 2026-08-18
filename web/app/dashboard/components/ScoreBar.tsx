type Props = { score: number; temperature: "QUENTE" | "MORNO" | "FRIO" };

const clr: Record<string, string> = {
  QUENTE: "var(--hot)",
  MORNO:  "var(--warm)",
  FRIO:   "var(--cold)",
};

export function ScoreBar({ score, temperature }: Props) {
  const color = clr[temperature] ?? "var(--cold)";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span className="mono" style={{ fontSize: 12, color: "var(--t0)", width: 20, flexShrink: 0 }}>
        {score}
      </span>
      <div style={{
        flex: 1, height: 2,
        background: "var(--b1)",
        borderRadius: 99,
        overflow: "hidden",
      }}>
        <div style={{
          height: "100%",
          width: `${Math.max(score, 2)}%`,
          background: color,
          borderRadius: 99,
          transition: "width 0.6s cubic-bezier(0.16,1,0.3,1)",
        }} />
      </div>
    </div>
  );
}
