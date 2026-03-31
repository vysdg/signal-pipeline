"use client";
import { useState } from "react";
import { TemperatureBadge, Temperature } from "./TemperatureBadge";
import { ScoreBar } from "./ScoreBar";
import { LeadDetailSheet } from "./LeadDetailSheet";

export type Lead = {
  id: string;
  contact_name: string;
  contact_email: string;
  contact_company: string;
  source: string;
  temperature: Temperature;
  score: number;
  niche: string;
  pain_point: string;
  pitch: string;
  created_at: string;
};

type Props = { leads: Lead[] };

const FILTERS = ["Todos", "QUENTE", "MORNO", "FRIO"] as const;

function initials(name: string) {
  return name.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase() || "?";
}

const avatarColors: Record<Temperature, string> = {
  QUENTE: "bg-red-50 text-red-600",
  MORNO:  "bg-amber-50 text-amber-600",
  FRIO:   "bg-blue-50 text-blue-600",
};

export function LeadTable({ leads }: Props) {
  const [filter, setFilter] = useState<string>("Todos");
  const [selected, setSelected] = useState<Lead | null>(null);

  const filtered = filter === "Todos" ? leads : leads.filter(l => l.temperature === filter);

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 animate-fade-up stagger-5">
        <div className="flex items-center justify-between p-5 border-b border-gray-50">
          <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Leads recentes</p>
          <div className="flex gap-1">
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-full text-xs transition-all ${
                  filter === f
                    ? "bg-gray-900 text-white"
                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                }`}
              >
                {f === "Todos" ? "Todos" : f.charAt(0) + f.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-gray-400 border-b border-gray-50">
                <th className="text-left px-5 py-3 font-normal">Contato</th>
                <th className="text-left px-4 py-3 font-normal">Origem</th>
                <th className="text-left px-4 py-3 font-normal">Nicho</th>
                <th className="text-left px-4 py-3 font-normal">Dor principal</th>
                <th className="text-left px-4 py-3 font-normal">Temperatura</th>
                <th className="text-left px-4 py-3 font-normal w-32">Score IA</th>
                <th className="text-left px-4 py-3 font-normal">Data</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead, i) => (
                <tr
                  key={lead.id}
                  className={`border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer animate-fade-up`}
                  style={{ animationDelay: `${i * 40}ms` }}
                  onClick={() => setSelected(lead)}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium shrink-0 ${avatarColors[lead.temperature]}`}>
                        {initials(lead.contact_name)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{lead.contact_name || "—"}</p>
                        <p className="text-xs text-gray-400">{lead.contact_email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-md">{lead.source}</span>
                  </td>
                  <td className="px-4 py-4 text-xs text-gray-500">{lead.niche || "—"}</td>
                  <td className="px-4 py-4 text-xs text-gray-500 max-w-48 truncate">{lead.pain_point || "—"}</td>
                  <td className="px-4 py-4">
                    <TemperatureBadge temperature={lead.temperature} />
                  </td>
                  <td className="px-4 py-4 w-36">
                    <ScoreBar score={lead.score || 0} temperature={lead.temperature} />
                  </td>
                  <td className="px-4 py-4 text-xs text-gray-400">
                    {new Date(lead.created_at).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-4 py-4 text-xs text-gray-400">›</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-sm text-gray-400">
                    Nenhum lead encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <LeadDetailSheet lead={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
