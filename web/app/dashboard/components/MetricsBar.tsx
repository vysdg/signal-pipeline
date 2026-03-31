"use client";
import { useEffect, useRef, useState } from "react";

type Metric = {
  label: string;
  value: number;
  suffix?: string;
  sub: string;
  positive: boolean;
  delay: string;
};

function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<number>(0);

  useEffect(() => {
    const start = performance.now();
    const duration = 800;
    const from = ref.current;
    const to = value;

    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      const current = Math.round(from + (to - from) * ease);
      setDisplay(current);
      if (p < 1) requestAnimationFrame(tick);
      else ref.current = to;
    };

    requestAnimationFrame(tick);
  }, [value]);

  return <>{display}{suffix}</>;
}

type Props = { total: number; hot: number; avgScore: number; avgTime: string };

export function MetricsBar({ total, hot, avgScore, avgTime }: Props) {
  const metrics: Metric[] = [
    { label: "Leads capturados", value: total, sub: `+${Math.max(0, total - 10)} vs ontem`, positive: true, delay: "stagger-1" },
    { label: "Score médio IA",   value: avgScore, sub: "precisão do classificador", positive: true, delay: "stagger-2" },
    { label: "Leads quentes",    value: hot, sub: `${total > 0 ? Math.round((hot/total)*100) : 0}% do total`, positive: hot > 0, delay: "stagger-3" },
    { label: "Tempo de proc.",   value: 0, suffix: "", sub: avgTime, positive: true, delay: "stagger-4" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {metrics.map((m, i) => (
        <div
          key={m.label}
          className={`bg-white rounded-2xl border border-gray-100 p-5 animate-fade-up ${m.delay}`}
        >
          <p className="text-xs text-gray-400 mb-2 tracking-wide uppercase">{m.label}</p>
          <p className="text-3xl font-medium text-gray-900 mb-1">
            {i === 3 ? avgTime : <AnimatedNumber value={m.value} suffix={m.suffix} />}
          </p>
          <p className={`text-xs ${m.positive ? "text-emerald-600" : "text-red-500"}`}>
            {m.sub}
          </p>
        </div>
      ))}
    </div>
  );
}
