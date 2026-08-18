"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lead } from "./LeadTable";
import { TemperatureBadge, Temperature } from "./TemperatureBadge";
import { ScoreBar } from "./ScoreBar";
import { LeadDetailSheet } from "./LeadDetailSheet";

type Stage = { key: Temperature; label: string; color: string; bg: string };

const STAGES: Stage[] = [
  { key: "FRIO",   label: "Frio",   color: "var(--cold)", bg: "var(--cold10)" },
  { key: "MORNO",  label: "Morno",  color: "var(--warm)", bg: "var(--warm10)" },
  { key: "QUENTE", label: "Quente", color: "var(--hot)",  bg: "var(--hot10)"  },
];

function initials(name: string) {
  return name.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase() || "?";
}

const clr: Record<Temperature, string> = {
  FRIO:   "var(--cold)",
  MORNO:  "var(--warm)",
  QUENTE: "var(--hot)",
};

function KanbanCard({ lead, onClick }: { lead: Lead; onClick: () => void }) {
  const color = clr[lead.temperature];
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      onClick={onClick}
      className="surface transition"
      style={{ padding: "12px 14px", cursor: "pointer", userSelect: "none" as const }}
      whileHover={{ backgroundColor: "var(--s2)" } as never}
    >
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
          <div style={{
            width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
            border: `1px solid ${color}50`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 9, fontWeight: 700, color: color,
          }}>
            {initials(lead.contact_name)}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{
              fontSize: 12, fontWeight: 500, color: "var(--t0)",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {lead.contact_name || "—"}
            </p>
            <p style={{
              fontSize: 11, color: "var(--t2)",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {lead.contact_company || lead.contact_email}
            </p>
          </div>
        </div>
        <TemperatureBadge temperature={lead.temperature} />
      </div>

      {/* Score bar */}
      {lead.score > 0 && (
        <ScoreBar score={lead.score} temperature={lead.temperature} />
      )}

      {/* Pain point teaser */}
      {lead.pain_point && (
        <p style={{
          fontSize: 11, color: "var(--t2)", marginTop: 8,
          overflow: "hidden", textOverflow: "ellipsis",
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as never,
          lineHeight: 1.5,
        }}>
          {lead.pain_point}
        </p>
      )}
    </motion.div>
  );
}

export function PipelineKanban({ leads }: { leads: Lead[] }) {
  const [selected, setSelected] = useState<Lead | null>(null);

  const byStage = (key: Temperature) => leads.filter(l => l.temperature === key);
  const avgScore = (arr: Lead[]) =>
    arr.length > 0 ? Math.round(arr.reduce((s, l) => s + (l.score || 0), 0) / arr.length) : 0;

  return (
    <>
      <div style={{ marginBottom: 28 }}>
        <p className="label" style={{ marginBottom: 12 }}>Pipeline por etapa</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, alignItems: "start" }}>
          {STAGES.map(stage => {
            const stageLeads = byStage(stage.key);
            const avg = avgScore(stageLeads);

            return (
              <div key={stage.key}>
                {/* Column header */}
                <div style={{
                  borderTop: `2px solid ${stage.color}`,
                  paddingTop: 10,
                  marginBottom: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <span className="label" style={{ color: stage.color }}>
                      {stage.label}
                    </span>
                    <span style={{
                      fontSize: 10, fontWeight: 600,
                      background: stage.bg, color: stage.color,
                      padding: "1px 6px", borderRadius: 99,
                    }}>
                      {stageLeads.length}
                    </span>
                  </div>
                  {avg > 0 && (
                    <span className="label">score {avg}</span>
                  )}
                </div>

                {/* Cards */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <AnimatePresence mode="popLayout">
                    {stageLeads.map(lead => (
                      <KanbanCard
                        key={lead.id}
                        lead={lead}
                        onClick={() => setSelected(lead)}
                      />
                    ))}
                  </AnimatePresence>

                  {stageLeads.length === 0 && (
                    <div style={{
                      padding: "24px 16px",
                      border: "1px dashed var(--b1)",
                      borderRadius: "var(--r)",
                      textAlign: "center",
                    }}>
                      <p style={{ fontSize: 11, color: "var(--t2)" }}>Nenhum lead nesta etapa</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {selected && <LeadDetailSheet lead={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </>
  );
}
