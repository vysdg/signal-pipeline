export type Temperature = "QUENTE" | "MORNO" | "FRIO";

const config: Record<Temperature, { label: string; classes: string }> = {
  QUENTE: { label: "Quente", classes: "bg-red-50 text-red-700 border border-red-100" },
  MORNO:  { label: "Morno",  classes: "bg-amber-50 text-amber-700 border border-amber-100" },
  FRIO:   { label: "Frio",   classes: "bg-blue-50 text-blue-700 border border-blue-100" },
};

export function TemperatureBadge({ temperature }: { temperature: Temperature }) {
  const { label, classes } = config[temperature] ?? config.FRIO;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${classes}`}>
      {label}
    </span>
  );
}
