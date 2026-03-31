"use client";
import { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

type Props = { data: { date: string; quente: number; morno: number; frio: number }[] };

export function VolumeChart({ data }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const chart = useRef<Chart | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    if (chart.current) chart.current.destroy();

    chart.current = new Chart(ref.current, {
      type: "bar",
      data: {
        labels: data.map(d => d.date),
        datasets: [
          { label: "Quente", data: data.map(d => d.quente), backgroundColor: "#FCA5A5", borderRadius: 4 },
          { label: "Morno",  data: data.map(d => d.morno),  backgroundColor: "#FCD34D", borderRadius: 4 },
          { label: "Frio",   data: data.map(d => d.frio),   backgroundColor: "#93C5FD", borderRadius: 4 },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: "bottom", labels: { boxWidth: 10, font: { size: 11 } } } },
        scales: {
          x: { stacked: true, grid: { display: false }, ticks: { font: { size: 11 } } },
          y: { stacked: true, grid: { color: "#f3f4f6" }, ticks: { font: { size: 11 } } },
        },
        animation: { duration: 800, easing: "easeOutQuart" },
      },
    });

    return () => chart.current?.destroy();
  }, [data]);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 animate-fade-up stagger-3">
      <p className="text-xs text-gray-400 uppercase tracking-wide mb-4">Volume por temperatura</p>
      <div style={{ height: 180 }}>
        <canvas ref={ref} />
      </div>
    </div>
  );
}
