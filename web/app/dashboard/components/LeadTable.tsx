"use client";
import { useState } from "react";
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

const FILTERS = ["Todos", "QUENTE", "MORNO", "FRIO"] as const;
const FILTER_LABEL: Record<string, string> = { Todos: "Todos", QUENTE: "Quente", MORNO: "Morno", FRIO: "Frio" };

function initials(name: string) {
  return name.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase() || "?";
}

const tempColor: Record<Temperature, string> = {
  QUENTE: "var(--hot)",
  MORNO:  "var(--warm)",
  FRIO:   "var(--cold)",
};

export function LeadTable({ leads }: { leads: Lead[] }) {
  const [filter, setFilter] = useState<string>("Todos");
  const [selected, setSelected] = useState<Lead | null>(null);

  const filtered = filter === "Todos" ? leads : leads.filter(l => l.temperature === filter);

  return (
    <>
      <div className="surface" style={{ overflow: "hidden" }}>
        {/* Toolbar */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          borderBottom: "1px solid var(--b0)",
        }}>
          <p className="label">Leads recentes</p>
          <div style={{ display: "flex", gap: 2 }}>
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: "3px 10px",
                  borderRadius: 4,
                  fontSize: 12,
                  fontWeight: 500,
                  border: "none",
                  cursor: "pointer",
                  background: filter === f ? "var(--s3)" : "transparent",
                  color: filter === f ? "var(--t0)" : "var(--t2)",
                  transition: "background 0.12s, color 0.12s",
                }}
              >
                {FILTER_LABEL[f]}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Contato", "Empresa", "Origem", "Nicho", "Dor", "Temp.", "Score", "Data"].map(h => (
                  <th key={h} className="label" style={{
                    textAlign: "left",
                    padding: "10px 14px",
                    fontWeight: 500,
                    borderBottom: "1px solid var(--b0)",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {filtered.map((lead, i) => {
                  const color = tempColor[lead.temperature];
                  return (
                    <motion.tr
                      key={lead.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2, delay: Math.min(i * 0.025, 0.3) }}
                      onClick={() => setSelected(lead)}
                      style={{
                        borderBottom: "1px solid var(--b0)",
                        cursor: "pointer",
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLTableRowElement).style.background = "var(--s2)";
                        const cells = (e.currentTarget as HTMLTableRowElement).querySelectorAll("td");
                        if (cells[0]) (cells[0] as HTMLTableCellElement).style.borderLeft = `2px solid ${color}`;
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLTableRowElement).style.background = "transparent";
                        const cells = (e.currentTarget as HTMLTableRowElement).querySelectorAll("td");
                        if (cells[0]) (cells[0] as HTMLTableCellElement).style.borderLeft = "2px solid transparent";
                      }}
                    >
                      {/* Contact */}
                      <td style={{ padding: "11px 14px", borderLeft: "2px solid transparent", transition: "border-color 0.12s" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                          <div style={{
                            width: 26, height: 26,
                            borderRadius: "50%",
                            border: `1px solid ${color}40`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 10, fontWeight: 600,
                            color: color,
                            flexShrink: 0,
                          }}>
                            {initials(lead.contact_name)}
                          </div>
                          <div>
                            <p style={{ fontSize: 13, color: "var(--t0)", fontWeight: 500 }}>{lead.contact_name || "—"}</p>
                            <p style={{ fontSize: 11, color: "var(--t2)" }}>{lead.contact_email}</p>
                          </div>
                        </div>
                      </td>
                      {/* Company */}
                      <td style={{ padding: "11px 14px", fontSize: 12, color: "var(--t1)" }}>
                        {lead.contact_company || "—"}
                      </td>
                      {/* Source */}
                      <td style={{ padding: "11px 14px" }}>
                        <span style={{
                          fontSize: 11,
                          padding: "2px 7px",
                          borderRadius: 4,
                          background: "var(--s3)",
                          color: "var(--t1)",
                          fontWeight: 500,
                        }}>
                          {lead.source}
                        </span>
                      </td>
                      {/* Niche */}
                      <td style={{ padding: "11px 14px", fontSize: 12, color: "var(--t1)" }}>
                        {lead.niche || "—"}
                      </td>
                      {/* Pain */}
                      <td style={{ padding: "11px 14px", maxWidth: 200 }}>
                        <p style={{
                          fontSize: 12, color: "var(--t1)",
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>
                          {lead.pain_point || "—"}
                        </p>
                      </td>
                      {/* Temp */}
                      <td style={{ padding: "11px 14px" }}>
                        <TemperatureBadge temperature={lead.temperature} />
                      </td>
                      {/* Score */}
                      <td style={{ padding: "11px 14px", width: 120 }}>
                        <ScoreBar score={lead.score || 0} temperature={lead.temperature} />
                      </td>
                      {/* Date */}
                      <td className="mono" style={{ padding: "11px 14px", fontSize: 11, color: "var(--t2)" }}>
                        {new Date(lead.created_at).toLocaleDateString("pt-BR")}
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ padding: "48px", textAlign: "center" }}>
                    <p style={{ fontSize: 13, color: "var(--t2)" }}>Nenhum lead</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer count */}
        {filtered.length > 0 && (
          <div style={{
            padding: "10px 16px",
            borderTop: "1px solid var(--b0)",
            display: "flex",
            alignItems: "center",
          }}>
            <span className="label">{filtered.length} {filtered.length === 1 ? "lead" : "leads"}</span>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selected && <LeadDetailSheet lead={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </>
  );
}
