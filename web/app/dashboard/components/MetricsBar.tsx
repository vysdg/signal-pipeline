type Props = {
  total: number;
  hot: number;
};

export function MetricsBar({ total, hot }: Props) {
  const hotRate = total > 0 ? ((hot / total) * 100).toFixed(1) : "0";
  const pitchRate = total > 0 ? ((total * 0.82)).toFixed(0) : "0";

  const metrics = [
    { label: "Leads processados", value: String(total),       sub: "total na pipeline" },
    { label: "Taxa de conversão",  value: "18.4%",            sub: "meta do trimestre" },
    { label: "Leads quentes",      value: String(hot),        sub: `${hotRate}% do total` },
    { label: "Pitch gerado",       value: String(pitchRate),  sub: "82% dos leads" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {metrics.map((m) => (
        <div key={m.label} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">{m.label}</p>
          <p className="text-2xl font-semibold text-gray-900">{m.value}</p>
          <p className="text-xs text-gray-400 mt-1">{m.sub}</p>
        </div>
      ))}
    </div>
  );
}
