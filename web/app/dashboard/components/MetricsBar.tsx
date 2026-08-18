"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

function Counter({ to }: { to: number }) {
  const [val, setVal] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    const from = prev.current;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / 700, 1);
      const ease = 1 - Math.pow(1 - p, 4);
      setVal(Math.round(from + (to - from) * ease));
      if (p < 1) requestAnimationFrame(tick);
      else prev.current = to;
    };
    requestAnimationFrame(tick);
  }, [to]);
  return <>{val}</>;
}

type Props = { total: number; hot: number; avgScore: number; avgTime: string };

export function MetricsBar({ total, hot, avgScore, avgTime }: Props) {
  const hotPct = total > 0 ? ((hot / total) * 100).toFixed(1) : "0.0";

  const cards = [
    { label: "Leads capturados", value: total,    sub: `+${Math.max(0, total - 10)} vs ontem`,    isNum: true  },
    { label: "Score médio",      value: avgScore, sub: "precisão do classificador",               isNum: true  },
    { label: "Leads quentes",    value: hot,      sub: `${hotPct}% do total`,                     isNum: true  },
    { label: "Proc. médio",      value: 0,        sub: avgTime,                                   isNum: false },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 16 }}>
      {cards.map(({ label, value, sub, isNum }, i) => (
        <motion.div
          key={label}
          className="surface"
          style={{ padding: "18px 20px" }}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="label" style={{ marginBottom: 10 }}>{label}</p>
          <p
            className="mono"
            style={{
              fontSize: 30,
              fontWeight: 400,
              color: "var(--t0)",
              lineHeight: 1,
              letterSpacing: "-0.02em",
              marginBottom: 8,
            }}
          >
            {isNum ? <Counter to={value} /> : sub}
          </p>
          {isNum && (
            <p style={{ fontSize: 11, color: "var(--t2)" }}>{sub}</p>
          )}
        </motion.div>
      ))}
    </div>
  );
}
