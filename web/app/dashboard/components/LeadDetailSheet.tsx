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
  QUENTE: "var(--hot)", MORNO: "var(--warm)", FRIO: "var(--cold)",
};

export function LeadDetailSheet({ lead, onClose }: Props) {
  const [copied, setCopied] = useState(false);
  const accent = tempColor[lead.temperature] ?? "var(--t1)";

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  function copy() {
    navigator.clipboard.writeText(lead.pitch ?? "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.14 }}
      style={{
        position: "fixed", inset: 0, zIndex: 50,
        background: "rgba(28,25,23,0.18)", backdropFilter: "blur(3px)",
        display: "flex", justifyContent: "flex-end",
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 20, opacity: 0 }}
        transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
        style={{
          background: "var(--s1)",
          borderLeft: "1px solid var(--b1)",
          height: "100%", width: "100%", maxWidth: 420,
          display: "flex", flexDirection: "column",
          boxShadow: "-4px 0 24px rgba(28,25,23,0.06)",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Accent top rule */}
        <div style={{ height: 2, background: accent, flexShrink: 0 }} />

        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 20px", borderBottom: "1px solid var(--b0)", flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 30, height: 30, borderRadius: "50%",
              border: `1px solid ${accent}40`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 10, fontWeight: 700, color: accent,
            }}>
              {initials(lead.contact_name)}
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 500, color: "var(--t0)" }}>{lead.contact_name || "Lead"}</p>
              <p style={{ fontSize: 11, color: "var(--t2)" }}>{lead.contact_company || lead.contact_email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="transition"
            style={{
              width: 24, height: 24, borderRadius: 4,
              border: "1px solid var(--b1)", background: "transparent",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "var(--t2)",
            }}
            onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = "var(--b2)"; b.style.color = "var(--t0)"; }}
            onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = "var(--b1)"; b.style.color = "var(--t2)"; }}
          >
            <X size={11} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "18px 20px" }}>

          {/* Stats grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7, marginBottom: 14 }}>
            {[
              { label: "Temperatura", node: <TemperatureBadge temperature={lead.temperature} /> },
              { label: "Score IA",    node: <ScoreBar score={lead.score || 0} temperature={lead.temperature} /> },
              { label: "Origem",      node: <span style={{ fontSize: 12, color: "var(--t0)" }}>{lead.source}</span> },
              { label: "Nicho",       node: <span style={{ fontSize: 12, color: "var(--t0)" }}>{lead.niche || "—"}</span> },
            ].map(({ label, node }) => (
              <div key={label} style={{
                background: "var(--s2)", border: "1px solid var(--b0)",
                borderRadius: "var(--r)", padding: "11px 13px",
              }}>
                <p className="label" style={{ marginBottom: 7 }}>{label}</p>
                {node}
              </div>
            ))}
          </div>

          {/* Pain */}
          {lead.pain_point && (
            <div style={{
              background: `${accent}06`, border: `1px solid ${accent}20`,
              borderRadius: "var(--r)", padding: "12px 14px", marginBottom: 14,
            }}>
              <p className="label" style={{ color: accent, marginBottom: 6 }}>Dor principal</p>
              <p style={{ fontSize: 13, color: "var(--t1)", lineHeight: 1.6 }}>{lead.pain_point}</p>
            </div>
          )}

          {/* Pitch */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
              <p className="label">Pitch IA</p>
              <button
                onClick={copy}
                className="transition"
                style={{
                  display: "flex", alignItems: "center", gap: 4,
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: 11, color: copied ? "var(--warm)" : "var(--t2)",
                }}
              >
                {copied ? <Check size={10} /> : <Copy size={10} />}
                {copied ? "Copiado" : "Copiar"}
              </button>
            </div>
            <div style={{
              background: "var(--s2)", border: "1px solid var(--b0)",
              borderRadius: "var(--r)", padding: "13px 14px",
              fontSize: 13, color: "var(--t1)", lineHeight: 1.7,
              whiteSpace: "pre-wrap" as const,
            }}>
              {lead.pitch || "Aguardando processamento..."}
            </div>
          </div>

          {/* Contact info */}
          <div>
            <p className="label" style={{ marginBottom: 4 }}>Contato</p>
            {[
              { k: "Email",   v: lead.contact_email },
              { k: "Empresa", v: lead.contact_company },
              { k: "Origem",  v: lead.source },
              { k: "Data",    v: new Date(lead.created_at).toLocaleString("pt-BR") },
            ].map(({ k, v }) => (
              <div key={k} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "8px 0", borderBottom: "1px solid var(--b0)",
              }}>
                <span className="label">{k}</span>
                <span style={{ fontSize: 12, color: "var(--t0)" }}>{v || "—"}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
