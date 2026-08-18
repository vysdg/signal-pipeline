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

const avatarAccent: Record<Temperature, { bg: string; color: string }> = {
  QUENTE: { bg: "rgba(255,75,75,0.12)",   color: "#ff7070" },
  MORNO:  { bg: "rgba(245,158,11,0.12)",  color: "#fbbf24" },
  FRIO:   { bg: "rgba(59,130,246,0.12)",  color: "#60a5fa" },
};

const filterLabel: Record<string, string> = {
  Todos: "Todos", QUENTE: "Quente", MORNO: "Morno", FRIO: "Frio",
};

export function LeadTable({ leads }: Props) {
  const [filter, setFilter] = useState<string>("Todos");
  const [selected, setSelected] = useState<Lead | null>(null);

  const filtered = filter === "Todos" ? leads : leads.filter(l => l.temperature === filter);

  return (
    <>
      <div className="glass animate-rise s5" style={{ overflow: "hidden" }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 20px",
          borderBottom: "1px solid var(--border)",
        }}>
          <p style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Leads recentes
          </p>
          <div style={{ display: "flex", gap: 4 }}>
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: "4px 10px", borderRadius: 99, fontSize: 11,
                  cursor: "pointer", border: "none",
                  background: filter === f ? "var(--green)" : "transparent",
                  color: filter === f ? "#09090c" : "var(--text-muted)",
                  fontWeight: filter === f ? 600 : 400,
                  transition: "background 0.15s, color 0.15s",
                }}
              >
                {filterLabel[f]}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Contato", "Origem", "Nicho", "Dor principal", "Temperatura", "Score IA", "Data", ""].map(h => (
                  <th key={h} style={{
                    textAlign: "left", padding: "10px 16px",
                    fontSize: 10, color: "var(--text-muted)",
                    fontWeight: 400, textTransform: "uppercase", letterSpacing: "0.06em",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead, i) => {
                const av = avatarAccent[lead.temperature];
                return (
                  <tr
                    key={lead.id}
                    className="animate-rise"
                    style={{
                      borderBottom: "1px solid var(--border)",
                      cursor: "pointer",
                      animationDelay: `${i * 35}ms`,
                      transition: "background 0.12s",
                    }}
                    onClick={() => setSelected(lead)}
                    onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = "var(--bg-hover)"}
                    onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = "transparent"}
                  >
                    {/* Contact */}
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                          width: 30, height: 30, borderRadius: "50%",
                          background: av.bg, color: av.color,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 11, fontWeight: 600, flexShrink: 0,
                        }}>
                          {initials(lead.contact_name)}
                        </div>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>
                            {lead.contact_name || "—"}
                          </p>
                          <p style={{ fontSize: 11, color: "var(--text-muted)" }}>{lead.contact_email}</p>
                        </div>
                      </div>
                    </td>
                    {/* Source */}
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{
                        fontSize: 10, padding: "3px 8px", borderRadius: 6,
                        background: "var(--bg-elevated)", color: "var(--text-secondary)",
                        fontWeight: 500,
                      }}>
                        {lead.source}
                      </span>
                    </td>
                    {/* Niche */}
                    <td style={{ padding: "14px 16px", fontSize: 12, color: "var(--text-secondary)" }}>
                      {lead.niche || "—"}
                    </td>
                    {/* Pain */}
                    <td style={{ padding: "14px 16px", fontSize: 12, color: "var(--text-secondary)", maxWidth: 180 }}>
                      <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {lead.pain_point || "—"}
                      </span>
                    </td>
                    {/* Badge */}
                    <td style={{ padding: "14px 16px" }}>
                      <TemperatureBadge temperature={lead.temperature} />
                    </td>
                    {/* Score */}
                    <td style={{ padding: "14px 16px", width: 130 }}>
                      <ScoreBar score={lead.score || 0} temperature={lead.temperature} />
                    </td>
                    {/* Date */}
                    <td style={{ padding: "14px 16px", fontSize: 11, color: "var(--text-muted)" }}>
                      {new Date(lead.created_at).toLocaleDateString("pt-BR")}
                    </td>
                    {/* Arrow */}
                    <td style={{ padding: "14px 16px", color: "var(--text-muted)", fontSize: 14 }}>›</td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ padding: "48px", textAlign: "center", fontSize: 13, color: "var(--text-muted)" }}>
                    Nenhum lead encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected && <LeadDetailSheet lead={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
