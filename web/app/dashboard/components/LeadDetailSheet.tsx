"use client";
import { useEffect, useState } from "react";
import { Lead } from "./LeadTable";
import { TemperatureBadge } from "./TemperatureBadge";
import { ScoreBar } from "./ScoreBar";

type Props = { lead: Lead; onClose: () => void };

function initials(name: string) {
  return name.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase() || "?";
}

export function LeadDetailSheet({ lead, onClose }: Props) {
  const [copied, setCopied] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  function copy() {
    navigator.clipboard.writeText(lead.pitch);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex justify-end"
      onClick={onClose}
    >
      <div
        className="bg-white h-full w-full max-w-lg shadow-2xl flex flex-col transition-transform duration-300 ease-out"
        style={{ transform: visible ? "translateX(0)" : "translateX(100%)" }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600">
              {initials(lead.contact_name)}
            </div>
            <div>
              <p className="font-medium text-gray-900">{lead.contact_name || "Lead"}</p>
              <p className="text-xs text-gray-400">{lead.contact_company || lead.contact_email}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-1">Temperatura</p>
              <TemperatureBadge temperature={lead.temperature} />
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-2">Score IA</p>
              <ScoreBar score={lead.score || 0} temperature={lead.temperature} />
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-1">Origem</p>
              <p className="text-sm font-medium text-gray-700">{lead.source}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-1">Nicho</p>
              <p className="text-sm font-medium text-gray-700">{lead.niche || "—"}</p>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
            <p className="text-xs text-amber-600 font-medium mb-1 uppercase tracking-wide">Dor principal</p>
            <p className="text-sm text-amber-900">{lead.pain_point || "—"}</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Pitch gerado pela IA</p>
              <button
                onClick={copy}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                {copied ? "Copiado ✓" : "Copiar"}
              </button>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {lead.pitch}
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-2">Contato</p>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Email</span>
                <span className="text-gray-700">{lead.contact_email || "—"}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Empresa</span>
                <span className="text-gray-700">{lead.contact_company || "—"}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Data</span>
                <span className="text-gray-700">{new Date(lead.created_at).toLocaleString("pt-BR")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
