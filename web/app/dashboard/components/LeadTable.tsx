"use client";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

const TEMP_FILTERS = ["Todos", "QUENTE", "MORNO", "FRIO"] as const;
const TEMP_LBL: Record<string, string> = { Todos: "Todos", QUENTE: "Quente", MORNO: "Morno", FRIO: "Frio" };
const DATE_FILTERS = ["all", "today", "7d", "30d"] as const;
const DATE_LBL: Record<string, string> = { all: "Todos", today: "Hoje", "7d": "7 dias", "30d": "30 dias" };

type DateFilter = typeof DATE_FILTERS[number];

function initials(name: string) {
  return name.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase() || "?";
}

const clr: Record<Temperature, string> = { QUENTE: "var(--hot)", MORNO: "var(--warm)", FRIO: "var(--cold)" };

function exportCSV(leads: Lead[]) {
  const headers = ["Nome", "Email", "Empresa", "Origem", "Temperatura", "Score", "Nicho", "Dor principal", "Data"];
  const rows = leads.map(l => [
    `"${(l.contact_name || "").replace(/"/g, '""')}"`,
    `"${(l.contact_email || "").replace(/"/g, '""')}"`,
    `"${(l.contact_company || "").replace(/"/g, '""')}"`,
    l.source,
    l.temperature,
    l.score ?? 0,
    `"${(l.niche || "").replace(/"/g, '""')}"`,
    `"${(l.pain_point || "").replace(/"/g, '""')}"`,
    new Date(l.created_at).toLocaleDateString("pt-BR"),
  ]);
  const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function cutoffFor(df: DateFilter): Date | null {
  const now = new Date();
  if (df === "today") return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (df === "7d")  { const d = new Date(now); d.setDate(d.getDate() - 7);  return d; }
  if (df === "30d") { const d = new Date(now); d.setDate(d.getDate() - 30); return d; }
  return null;
}

export function LeadTable({ leads }: { leads: Lead[] }) {
  const [tempFilter, setTempFilter] = useState<string>("Todos");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [search, setSearch]         = useState("");
  const [selected, setSelected]     = useState<Lead | null>(null);

  const filtered = useMemo(() => {
    const q      = search.toLowerCase().trim();
    const cutoff = cutoffFor(dateFilter);
    return leads.filter(l => {
      if (tempFilter !== "Todos" && l.temperature !== tempFilter) return false;
      if (cutoff && new Date(l.created_at) < cutoff) return false;
      if (q && !`${l.contact_name} ${l.contact_company} ${l.contact_email}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [leads, tempFilter, dateFilter, search]);

  return (
    <>
      <div className="surface" style={{ overflow: "hidden" }}>
        {/* Toolbar row 1: label + search + CSV */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "11px 16px", borderBottom: "1px solid var(--b0)",
        }}>
          <p className="label" style={{ flexShrink: 0 }}>Todos os leads</p>

          {/* Search */}
          <div style={{ flex: 1, maxWidth: 320, position: "relative" }}>
            <svg
              width={12} height={12} viewBox="0 0 24 24" fill="none"
              stroke="var(--t2)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
              style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
            >
              <circle cx={11} cy={11} r={8} /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nome, empresa ou email…"
              style={{
                width: "100%",
                paddingLeft: 28, paddingRight: 10, paddingTop: 5, paddingBottom: 5,
                fontSize: 12, color: "var(--t0)",
                background: "var(--bg)",
                border: "1px solid var(--b1)",
                borderRadius: 4, outline: "none",
                fontFamily: "inherit",
              }}
            />
          </div>

          <div style={{ flex: 1 }} />

          {/* Date filter */}
          <div style={{ display: "flex", gap: 2 }}>
            {DATE_FILTERS.map(df => (
              <button
                key={df}
                onClick={() => setDateFilter(df)}
                className="transition"
                style={{
                  padding: "3px 9px", borderRadius: 3,
                  fontSize: 12, fontWeight: 500, border: "none", cursor: "pointer",
                  background: dateFilter === df ? "var(--s3)" : "transparent",
                  color: dateFilter === df ? "var(--t0)" : "var(--t2)",
                }}
              >
                {DATE_LBL[df]}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div style={{ width: 1, height: 16, background: "var(--b1)", flexShrink: 0 }} />

          {/* Temp filter */}
          <div style={{ display: "flex", gap: 2 }}>
            {TEMP_FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setTempFilter(f)}
                className="transition"
                style={{
                  padding: "3px 9px", borderRadius: 3,
                  fontSize: 12, fontWeight: 500, border: "none", cursor: "pointer",
                  background: tempFilter === f ? "var(--s3)" : "transparent",
                  color: tempFilter === f ? "var(--t0)" : "var(--t2)",
                }}
              >
                {TEMP_LBL[f]}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div style={{ width: 1, height: 16, background: "var(--b1)", flexShrink: 0 }} />

          {/* CSV export */}
          <button
            onClick={() => exportCSV(filtered)}
            title="Exportar CSV"
            className="transition"
            style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "4px 10px", borderRadius: 3, border: "1px solid var(--b1)",
              background: "transparent", cursor: "pointer", fontSize: 12,
              color: "var(--t1)", fontFamily: "inherit", fontWeight: 500,
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "var(--t0)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--b2)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "var(--t1)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--b1)"; }}
          >
            <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1={12} y1={15} x2={12} y2={3}/>
            </svg>
            CSV
          </button>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Contato", "Empresa", "Origem", "Nicho", "Dor principal", "Temp.", "Score", "Data"].map(h => (
                  <th key={h} className="label" style={{
                    textAlign: "left", padding: "9px 14px", fontWeight: 500,
                    borderBottom: "1px solid var(--b0)",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {filtered.map((lead, i) => {
                  const color = clr[lead.temperature];
                  return (
                    <motion.tr
                      key={lead.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.16, delay: Math.min(i * 0.018, 0.2) }}
                      onClick={() => setSelected(lead)}
                      style={{ borderBottom: "1px solid var(--b0)", cursor: "pointer" }}
                      onMouseEnter={e => {
                        const row = e.currentTarget as HTMLTableRowElement;
                        row.style.background = "var(--s2)";
                        const td = row.querySelector("td") as HTMLTableCellElement | null;
                        if (td) td.style.borderLeft = `2px solid ${color}`;
                      }}
                      onMouseLeave={e => {
                        const row = e.currentTarget as HTMLTableRowElement;
                        row.style.background = "transparent";
                        const td = row.querySelector("td") as HTMLTableCellElement | null;
                        if (td) td.style.borderLeft = "2px solid transparent";
                      }}
                    >
                      <td style={{ padding: "10px 14px", borderLeft: "2px solid transparent", transition: "border-color 0.1s" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{
                            width: 24, height: 24, borderRadius: "50%",
                            border: `1px solid ${color}40`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 9, fontWeight: 700, color, flexShrink: 0,
                          }}>
                            {initials(lead.contact_name)}
                          </div>
                          <div>
                            <p style={{ fontSize: 12, fontWeight: 500, color: "var(--t0)" }}>{lead.contact_name || "—"}</p>
                            <p style={{ fontSize: 11, color: "var(--t2)" }}>{lead.contact_email}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "10px 14px", fontSize: 12, color: "var(--t1)" }}>{lead.contact_company || "—"}</td>
                      <td style={{ padding: "10px 14px" }}>
                        <span style={{
                          fontSize: 10, padding: "2px 6px", borderRadius: 3,
                          background: "var(--s2)", color: "var(--t1)", fontWeight: 500, letterSpacing: "0.02em",
                        }}>
                          {lead.source}
                        </span>
                      </td>
                      <td style={{ padding: "10px 14px", fontSize: 12, color: "var(--t1)" }}>{lead.niche || "—"}</td>
                      <td style={{ padding: "10px 14px", maxWidth: 200 }}>
                        <p style={{ fontSize: 12, color: "var(--t1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {lead.pain_point || "—"}
                        </p>
                      </td>
                      <td style={{ padding: "10px 14px" }}><TemperatureBadge temperature={lead.temperature} /></td>
                      <td style={{ padding: "10px 14px", width: 120 }}>
                        <ScoreBar score={lead.score || 0} temperature={lead.temperature} />
                      </td>
                      <td className="mono" style={{ padding: "10px 14px", fontSize: 11, color: "var(--t2)" }}>
                        {new Date(lead.created_at).toLocaleDateString("pt-BR")}
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ padding: "40px", textAlign: "center" }}>
                    <p style={{ fontSize: 13, color: "var(--t2)" }}>
                      {search ? `Nenhum resultado para "${search}"` : "Nenhum lead encontrado"}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filtered.length > 0 && (
          <div style={{ padding: "9px 16px", borderTop: "1px solid var(--b0)", display: "flex", alignItems: "center", gap: 8 }}>
            <span className="label">{filtered.length} {filtered.length === 1 ? "lead" : "leads"}</span>
            {filtered.length < leads.length && (
              <span className="label" style={{ color: "var(--t2)", fontWeight: 400 }}>
                de {leads.length} no total
              </span>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selected && <LeadDetailSheet lead={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </>
  );
}
