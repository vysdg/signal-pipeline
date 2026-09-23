"use client";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
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

function CardContent({ lead }: { lead: Lead }) {
  const color = clr[lead.temperature];
  return (
    <>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
          <div style={{
            width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
            border: `1px solid ${color}50`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 9, fontWeight: 700, color,
          }}>
            {initials(lead.contact_name)}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 12, fontWeight: 500, color: "var(--t0)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {lead.contact_name || "—"}
            </p>
            <p style={{ fontSize: 11, color: "var(--t2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {lead.contact_company || lead.contact_email}
            </p>
          </div>
        </div>
        <TemperatureBadge temperature={lead.temperature} />
      </div>
      {lead.score > 0 && <ScoreBar score={lead.score} temperature={lead.temperature} />}
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
    </>
  );
}

function DraggableCard({ lead, onClick }: { lead: Lead; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: lead.id });
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.35 : 1,
        transition: isDragging ? undefined : "opacity 0.15s",
      }}
      {...attributes}
      {...listeners}
    >
      <motion.div
        layout
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97 }}
        onClick={onClick}
        className="surface transition"
        style={{ padding: "12px 14px", cursor: "grab", userSelect: "none" as const }}
        whileHover={{
          backgroundColor: "var(--s2)",
          y: -2,
          boxShadow: "0 6px 16px rgba(28,25,23,0.08)",
        } as never}
        whileTap={{ scale: 0.98, cursor: "grabbing" } as never}
        transition={{ type: "spring", stiffness: 350, damping: 26 }}
      >
        <CardContent lead={lead} />
      </motion.div>
    </div>
  );
}

function DroppableColumn({ id, isOver, children }: { id: string; isOver: boolean; children: React.ReactNode }) {
  const { setNodeRef } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      style={{
        display: "flex", flexDirection: "column", gap: 6,
        minHeight: 60,
        padding: isOver ? "4px" : "0",
        borderRadius: "var(--r)",
        background: isOver ? "var(--s3)" : "transparent",
        transition: "background 0.15s, padding 0.15s",
      }}
    >
      {children}
    </div>
  );
}

export function PipelineKanban({ leads: initialLeads }: { leads: Lead[] }) {
  const [leads, setLeads]       = useState<Lead[]>(initialLeads);
  const [selected, setSelected] = useState<Lead | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overId, setOverId]     = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const byStage  = (key: Temperature) => leads.filter(l => l.temperature === key);
  const avgScore = (arr: Lead[]) =>
    arr.length > 0 ? Math.round(arr.reduce((s, l) => s + (l.score || 0), 0) / arr.length) : 0;

  const draggingLead = draggingId ? leads.find(l => l.id === draggingId) ?? null : null;

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setDraggingId(String(event.active.id));
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    setOverId(event.over ? String(event.over.id) : null);
  }, []);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    setDraggingId(null);
    setOverId(null);
    const { active, over } = event;
    if (!over) return;

    const leadId  = String(active.id);
    const newTemp = String(over.id) as Temperature;
    const lead    = leads.find(l => l.id === leadId);
    if (!lead || lead.temperature === newTemp || !["QUENTE","MORNO","FRIO"].includes(newTemp)) return;

    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, temperature: newTemp } : l));

    try {
      await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ temperature: newTemp }),
      });
    } catch {
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, temperature: lead.temperature } : l));
    }
  }, [leads]);

  return (
    <>
      <div style={{ marginBottom: 28 }}>
        <p className="label" style={{ marginBottom: 12 }}>Pipeline por etapa</p>

        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, alignItems: "start" }}>
            {STAGES.map(stage => {
              const stageLeads = byStage(stage.key);
              const avg        = avgScore(stageLeads);
              const isOver     = overId === stage.key;

              return (
                <div key={stage.key}>
                  <div style={{
                    borderTop: `2px solid ${stage.color}`,
                    paddingTop: 10, marginBottom: 8,
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <span className="label" style={{ color: stage.color }}>{stage.label}</span>
                      <span style={{
                        fontSize: 10, fontWeight: 600,
                        background: stage.bg, color: stage.color,
                        padding: "1px 6px", borderRadius: 99,
                      }}>
                        {stageLeads.length}
                      </span>
                    </div>
                    {avg > 0 && <span className="label">score {avg}</span>}
                  </div>

                  <DroppableColumn id={stage.key} isOver={isOver}>
                    <AnimatePresence mode="popLayout">
                      {stageLeads.map(lead => (
                        <DraggableCard
                          key={lead.id}
                          lead={lead}
                          onClick={() => setSelected(lead)}
                        />
                      ))}
                    </AnimatePresence>

                    {stageLeads.length === 0 && (
                      <div style={{
                        padding: "24px 16px",
                        border: `1px dashed ${isOver ? stage.color : "var(--b1)"}`,
                        borderRadius: "var(--r)", textAlign: "center",
                        transition: "border-color 0.15s",
                      }}>
                        <p style={{ fontSize: 11, color: isOver ? stage.color : "var(--t2)" }}>
                          {isOver ? "Soltar aqui" : "Nenhum lead nesta etapa"}
                        </p>
                      </div>
                    )}
                  </DroppableColumn>
                </div>
              );
            })}
          </div>

          <DragOverlay dropAnimation={{ duration: 180, easing: "ease" }}>
            {draggingLead && (
              <div className="surface" style={{ padding: "12px 14px", opacity: 0.95, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", cursor: "grabbing" }}>
                <CardContent lead={draggingLead} />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>

      <AnimatePresence>
        {selected && <LeadDetailSheet lead={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </>
  );
}
