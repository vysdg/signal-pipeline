type Temperature = "QUENTE" | "MORNO" | "FRIO";

const styles: Record<Temperature, string> = {
  QUENTE: "bg-red-100 text-red-800 border border-red-200",
  MORNO:  "bg-amber-100 text-amber-800 border border-amber-200",
  FRIO:   "bg-blue-100 text-blue-800 border border-blue-200",
};

const icons: Record<Temperature, string> = {
  QUENTE: "🔥",
  MORNO:  "⚡",
  FRIO:   "❄️",
};

export function TemperatureBadge({ temperature }: { temperature: Temperature }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[temperature]}`}>
      {icons[temperature]} {temperature}
    </span>
  );
}
