"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export function AutoRefresh({ intervalMs = 30000 }: { intervalMs?: number }) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(intervalMs / 1000);
  const startRef = useRef<number>(0);

  useEffect(() => {
    startRef.current = Date.now();
    const tick = setInterval(() => {
      const elapsed = Date.now() - startRef.current;
      const remaining = Math.ceil((intervalMs - elapsed) / 1000);
      if (remaining <= 0) {
        router.refresh();
        startRef.current = Date.now();
        setCountdown(intervalMs / 1000);
      } else {
        setCountdown(remaining);
      }
    }, 1000);
    return () => clearInterval(tick);
  }, [router, intervalMs]);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{
        width: 5, height: 5, borderRadius: "50%", background: "#16A34A", flexShrink: 0,
        animation: "pulse 2s ease-in-out infinite",
      }} />
      <span className="label" style={{ color: "var(--t2)" }}>
        live · {countdown}s
      </span>
    </div>
  );
}
