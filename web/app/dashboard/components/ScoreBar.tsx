type Props = { score: number; temperature: "QUENTE" | "MORNO" | "FRIO" };

const colors: Record<string, string> = {
  QUENTE: "bg-red-400",
  MORNO:  "bg-amber-400",
  FRIO:   "bg-blue-400",
};

export function ScoreBar({ score, temperature }: Props) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-gray-900 w-6">{score}</span>
      <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${colors[temperature]}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
