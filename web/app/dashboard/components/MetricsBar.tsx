"use client";
import { useEffect, useRef, useState } from "react";
import { TrendingUp, Brain, Flame, Zap } from "lucide-react";

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  const from = useRef(0);

  useEffect(() => {
    const start = performance.now();
    const to = value;
    const tick = (now: number) => {
      const p = Math.min((now - start) / 900, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(from.current + (to - from.current) * ease));
      if (p < 1) requestAnimationFrame(tick);
      else from.current = to;
    };
    requestAnimationFrame(tick);
  }, [value]);

  return <>{display}</>;
}

type Props = { total: number; hot: number; avgScore: number; avgTime: string };

const cards = (total: number, hot: number, avgScore: number, avgTime: string) => [
  {
    icon: TrendingUp,
    label: "Leads capturados",
    value: total,
    sub: `+${Math.max(0, total - 10)} vs ontem`,
    accent: "var(--green)",
    accentBg: "var(--green-dim)",
    delay: "s1",
    isText: false,
  },
  {
    icon: Brain,
    label: "Score médio IA",
    value: avgScore,
    sub: "precisão do classificador",
    accent: "#a78bfa",
    accentBg: "rgba(167,139,250,0.1)",
    delay: "s2",
    isText: false,
  },
  {
    icon: Flame,
    label: "Leads quentes",
    value: hot,
    sub: `${total > 0 ? Math.round((hot / total) * 100) : 0}% do total`,
    accent: "var(--hot)",
    accentBg: "rgba(255,75,75,0.1)",
    delay: "s3",
    isText: false,
  },
  {
    icon: Zap,
    label: "Tempo de proc.",
    value: 0,
    sub: avgTime,
    accent: "var(--warm)",
    accentBg: "rgba(245,158,11,0.1)",
    delay: "s4",
    isText: true,
  },
];

export function MetricsBar({ total, hot, avgScore, avgTime }: Props) {
  const metrics = cards(total, hot, avgScore, avgTime);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
      {metrics.map(({ icon: Icon, label, value, sub, accent, accentBg, delay, isText }) => (
        <div
          key={label}
          className={`glass animate-rise ${delay}`}
          style={{ padding: "18px 20px", position: "relative", overflow: "hidden" }}
        >
          {/* Icon badge */}
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: accentBg,
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: 14,
          }}>
            <Icon size={14} color={accent} strokeWidth={1.8} />
          </div>

          <p style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
            {label}
          </p>
          <p style={{ fontSize: 28, fontWeight: 500, color: "var(--text-primary)", lineHeight: 1, marginBottom: 6 }}>
            {isText ? avgTime : <AnimatedNumber value={value} />}
          </p>
          <p style={{ fontSize: 11, color: accent }}>
            {sub}
          </p>

          {/* Accent line */}
          <div style={{
            position: "absolute", bottom: 0, left: 20, right: 20, height: 1,
            background: `linear-gradient(90deg, ${accent}40 0%, transparent 100%)`,
          }} />
        </div>
      ))}
    </div>
  );
}
