"use client";
import React from "react";
import { TemperatureBadge } from "./TemperatureBadge";

type Lead = {
  id: string;
  contact: { name: string; email: string; company?: string };
  source: string;
  temperature: "QUENTE" | "MORNO" | "FRIO";
  pitch: string;
  created_at: string;
};

export function LeadCard({ lead }: { lead: Lead }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-medium text-gray-900">{lead.contact.name}</p>
          <p className="text-sm text-gray-500">{lead.contact.email}</p>
          {lead.contact.company && (
            <p className="text-xs text-gray-400">{lead.contact.company}</p>
          )}
        </div>
        <TemperatureBadge temperature={lead.temperature} />
      </div>
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <span className="bg-gray-100 rounded px-2 py-0.5">{lead.source}</span>
        <span>{new Date(lead.created_at).toLocaleDateString("pt-BR")}</span>
      </div>
      <button
        onClick={() => setOpen(!open)}
        className="text-xs text-indigo-600 hover:text-indigo-800 text-left font-medium transition-colors"
      >
        {open ? "Ocultar pitch ↑" : "Ver pitch gerado ↓"}
      </button>
      {open && (
        <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 leading-relaxed border border-gray-100">
          {lead.pitch}
        </div>
      )}
    </div>
  );
}
