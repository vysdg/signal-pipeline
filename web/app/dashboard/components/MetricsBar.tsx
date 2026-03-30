const metrics = [
  { label: "Leads processados", value: "248",   sub: "+12 hoje" },
  { label: "Taxa de conversão",  value: "18.4%", sub: "+2.1% vs mês ant." },
  { label: "Leads quentes",      value: "41",    sub: "16.5% do total" },
  { label: "Pitch gerado",       value: "204",   sub: "82% dos leads" },
];

export function MetricsBar() {
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
