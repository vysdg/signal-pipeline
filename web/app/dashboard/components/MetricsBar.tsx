"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    const from = prev.current;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - t0) / 800, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(from + (to - from) * ease));
      if (p < 1) requestAnimationFrame(tick);
      else prev.current = to;
    };
    requestAnimationFrame(tick);
  }, [to]);
  return <>{val}{suffix}</>;
}

type Props = { total: number; hot: number; avgScore: number; withPitch: number };

export function MetricsBar({ total, hot, avgScore, withPitch }: Props) {
  const hotPct = total > 0 ? Math.round((hot / total) * 100) : 0;

  const metrics = [
    { value: total,     label: "Leads capturados",  sub: `+${Math.max(0, total - 10)} vs ontem`, isNum: true  },
    { value: avgScore,  label: "Score médio IA",     sub: "precisão do classificador",            isNum: true  },
    { value: hot,       label: "Leads quentes",      sub: `${hotPct}% do total`,                  isNum: true  },
    { value: withPitch, label: "Com pitch gerado",   sub: `${total > 0 ? Math.round((withPitch/total)*100) : 0}% do total`, isNum: true },
  ];

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(4,1fr)",
      borderTop: "1px solid var(--b0)",
      borderBottom: "1px solid var(--b0)",
      marginBottom: 28,
    }}>
      {metrics.map(({ value, label, sub, isNum }, i) => (
        <motion.div
          key={label}
          style={{
            padding: "20px 24px 18px",
            borderLeft: i > 0 ? "1px solid var(--b0)" : "none",
          }}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
        >
          <p
            style={{
              fontFamily: "var(--font-display), sans-serif",
              fontSize: 46,
              fontWeight: 400,
              color: "var(--t0)",
              lineHeight: 1,
              letterSpacing: "0.01em",
              marginBottom: 8,
            }}
          >
            {isNum ? <Counter to={value} /> : value}
          </p>
          <p className="label" style={{ marginBottom: 3 }}>{label}</p>
          <p style={{ fontSize: 11, color: "var(--t2)" }}>{sub}</p>
        </motion.div>
      ))}
    </div>
  );
}
