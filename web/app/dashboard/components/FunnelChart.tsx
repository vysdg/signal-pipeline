"use client";
import { useEffect, useState } from "react";

type Props = { total: number; processed: number; warm: number; hot: number };

export function FunnelChart({ total, processed, warm, hot }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), 200); }, []);

  const steps = [
    { label: "Ingestão",   value: total,     pct: 100, color: "bg-gray-700" },
    { label: "Processado", value: processed, pct: total > 0 ? Math.round((processed/total)*100) : 0, color: "bg-gray-500" },
    { label: "Morno+",     value: warm,      pct: total > 0 ? Math.round((warm/total)*100) : 0, color: "bg-amber-400" },
    { label: "Quente",     value: hot,       pct: total > 0 ? Math.round((hot/total)*100) : 0, color: "bg-red-400" },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 animate-fade-up stagger-4">
      <p className="text-xs text-gray-400 uppercase tracking-wide mb-4">Funil de conversão</p>
      <div className="flex flex-col gap-3">
        {steps.map((s) => (
          <div key={s.label} className="flex items-center gap-3">
            <span className="text-xs text-gray-400 w-20 shrink-0">{s.label}</span>
            <div className="flex-1 h-5 bg-gray-50 rounded-md overflow-hidden">
              <div
                className={`h-full ${s.color} rounded-md flex items-center pl-2 transition-all duration-700 ease-out`}
                style={{ width: mounted ? `${Math.max(s.pct, 4)}%` : "0%" }}
              >
                <span className="text-white text-xs font-medium">{s.value}</span>
              </div>
            </div>
            <span className="text-xs text-gray-400 w-8 text-right">{s.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
