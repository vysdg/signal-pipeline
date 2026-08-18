"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X, Copy, Check } from "lucide-react";
import { Lead } from "./LeadTable";
import { TemperatureBadge } from "./TemperatureBadge";
import { ScoreBar } from "./ScoreBar";

type Props = { lead: Lead; onClose: () => void };

function initials(name: string) {
  return name.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase() || "?";
}

const tempColor: Record<string, string> = {
  QUENTE: "var(--hot)",
  MORNO:  "var(--warm)",
  FRIO:   "var(--cold)",
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "9px 0",
      borderBottom: "1px solid var(--b0)",
    }}>
      <span className="label">{label}</span>
      <span style={{ fontSize: 12, color: "var(--t0)" }}>{value || "—"}</span>
    </div>
  );
}

export function LeadDetailSheet({ lead, onClose }: Props) {
  const [copied, setCopied] = useState(false);
  const accent = tempColor[lead.temperature] ?? "var(--t1)";

  useEffect(() => {
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      style={{
        position: "fixed", inset: 0, zIndex: 50,
        background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(4px)",
        display: "flex",
        justifyContent: "flex-end",
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ x: 32, opacity: 0 }}
        animate={{ x: 0,  opacity: 1 }}
        exit={{ x: 32, opacity: 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        style={{
          background: "var(--s1)",
          borderLeft: "1px solid var(--b1)",
          height: "100%",
          width: "100%",
          maxWidth: 420,
          display: "flex",
          flexDirection: "column",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Top accent line */}
        <div style={{ height: 2, background: accent, flexShrink: 0 }} />

        {/* Header */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 20px",
          borderBottom: "1px solid var(--b0)",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 32, height: 32,
              borderRadius: "50%",
              border: `1px solid ${accent}40`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 600,
              color: accent,
            }}>
              {initials(lead.contact_name)}
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 500, color: "var(--t0)" }}>
                {lead.contact_name || "Lead"}
              </p>
              <p style={{ fontSize: 11, color: "var(--t2)" }}>
                {lead.contact_company || lead.contact_email}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              width: 26, height: 26,
              borderRadius: 4,
              border: "1px solid var(--b1)",
              background: "transparent",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
              color: "var(--t2)",
              transition: "border-color 0.12s, color 0.12s",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--b2)";
              (e.currentTarget as HTMLButtonElement).style.color = "var(--t0)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--b1)";
              (e.currentTarget as HTMLButtonElement).style.color = "var(--t2)";
            }}
          >
            <X size={12} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
          {/* Stat grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
            {[
              { label: "Temperatura", content: <TemperatureBadge temperature={lead.temperature} /> },
              { label: "Score IA",    content: <ScoreBar score={lead.score || 0} temperature={lead.temperature} /> },
              { label: "Origem",      content: <span style={{ fontSize: 12, color: "var(--t0)" }}>{lead.source}</span> },
              { label: "Nicho",       content: <span style={{ fontSize: 12, color: "var(--t0)" }}>{lead.niche || "—"}</span> },
            ].map(({ label, content }) => (
              <div key={label} style={{
                background: "var(--s2)",
                border: "1px solid var(--b0)",
                borderRadius: 6, padding: "12px 14px",
              }}>
                <p className="label" style={{ marginBottom: 8 }}>{label}</p>
                {content}
              </div>
            ))}
          </div>

          {/* Pain point */}
          <div style={{
            background: `${accent}08`,
            border: `1px solid ${accent}20`,
            borderRadius: 6, padding: "14px",
            marginBottom: 20,
          }}>
            <p className="label" style={{ color: accent, marginBottom: 6 }}>Dor principal</p>
            <p style={{ fontSize: 13, color: "var(--t1)", lineHeight: 1.6 }}>
              {lead.pain_point || "—"}
            </p>
          </div>

          {/* Pitch */}
          <div style={{ marginBottom: 20 }}>
            <div style={{
              display: "flex", alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 8,
            }}>
              <p className="label">Pitch IA</p>
              <button
                onClick={copy}
                style={{
                  display: "flex", alignItems: "center", gap: 5,
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: 11,
                  color: copied ? "var(--a)" : "var(--t2)",
                  transition: "color 0.15s",
                }}
              >
                {copied ? <Check size={11} /> : <Copy size={11} />}
                {copied ? "Copiado" : "Copiar"}
              </button>
            </div>
            <div style={{
              background: "var(--s2)",
              border: "1px solid var(--b0)",
              borderRadius: 6, padding: "14px",
              fontSize: 13, color: "var(--t1)",
              lineHeight: 1.7,
              whiteSpace: "pre-wrap" as const,
            }}>
              {lead.pitch || "Aguardando processamento..."}
            </div>
          </div>

          {/* Contact */}
          <div>
            <p className="label" style={{ marginBottom: 4 }}>Contato</p>
            <Row label="Email"   value={lead.contact_email} />
            <Row label="Empresa" value={lead.contact_company} />
            <Row label="Data"    value={new Date(lead.created_at).toLocaleString("pt-BR")} />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
