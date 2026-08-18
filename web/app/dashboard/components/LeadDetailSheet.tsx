"use client";
import { useEffect, useState } from "react";
import { X, Copy, Check, Mail, Building2, Clock } from "lucide-react";
import { Lead } from "./LeadTable";
import { TemperatureBadge } from "./TemperatureBadge";
import { ScoreBar } from "./ScoreBar";

type Props = { lead: Lead; onClose: () => void };

function initials(name: string) {
  return name.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase() || "?";
}

const tempAccent: Record<string, string> = {
  QUENTE: "#ff4b4b", MORNO: "#f59e0b", FRIO: "#3b82f6",
};

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

  const accent = tempAccent[lead.temperature] ?? "#7c7c99";

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 50,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(6px)",
        display: "flex", justifyContent: "flex-end",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--bg-surface)",
          borderLeft: "1px solid var(--border-strong)",
          height: "100%", width: "100%", maxWidth: 460,
          display: "flex", flexDirection: "column",
          transform: visible ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.35s cubic-bezier(0.16,1,0.3,1)",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Accent top bar */}
        <div style={{ height: 3, background: accent, opacity: 0.8, flexShrink: 0 }} />

        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "20px 24px",
          borderBottom: "1px solid var(--border)",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 38, height: 38, borderRadius: "50%",
              background: `${accent}20`, color: accent,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, fontWeight: 600, flexShrink: 0,
            }}>
              {initials(lead.contact_name)}
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)" }}>
                {lead.contact_name || "Lead"}
              </p>
              <p style={{ fontSize: 11, color: "var(--text-muted)" }}>
                {lead.contact_company || lead.contact_email}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 28, height: 28, borderRadius: 8,
              background: "var(--bg-elevated)", border: "none",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "var(--text-secondary)",
              transition: "background 0.15s",
            }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Stats grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { label: "Temperatura", content: <TemperatureBadge temperature={lead.temperature} /> },
              { label: "Score IA",    content: <ScoreBar score={lead.score || 0} temperature={lead.temperature} /> },
              { label: "Origem",      content: <span style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 500 }}>{lead.source}</span> },
              { label: "Nicho",       content: <span style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 500 }}>{lead.niche || "—"}</span> },
            ].map(({ label, content }) => (
              <div key={label} style={{
                background: "var(--bg-elevated)", borderRadius: 10, padding: "14px 16px",
                border: "1px solid var(--border)",
              }}>
                <p style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>
                  {label}
                </p>
                {content}
              </div>
            ))}
          </div>

          {/* Pain point */}
          <div style={{
            background: `${accent}10`,
            border: `1px solid ${accent}30`,
            borderRadius: 10, padding: "16px",
          }}>
            <p style={{ fontSize: 10, color: accent, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, marginBottom: 8 }}>
              Dor principal
            </p>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
              {lead.pain_point || "—"}
            </p>
          </div>

          {/* Pitch */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <p style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                Pitch gerado pela IA
              </p>
              <button
                onClick={copy}
                style={{
                  display: "flex", alignItems: "center", gap: 5,
                  fontSize: 11, color: copied ? "var(--green)" : "var(--text-secondary)",
                  background: "none", border: "none", cursor: "pointer",
                  transition: "color 0.2s",
                }}
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? "Copiado" : "Copiar"}
              </button>
            </div>
            <div style={{
              background: "var(--bg-elevated)", border: "1px solid var(--border)",
              borderRadius: 10, padding: "16px",
              fontSize: 13, color: "var(--text-secondary)",
              lineHeight: 1.7, whiteSpace: "pre-wrap",
            }}>
              {lead.pitch || "Aguardando processamento..."}
            </div>
          </div>

          {/* Contact info */}
          <div style={{
            background: "var(--bg-elevated)", border: "1px solid var(--border)",
            borderRadius: 10, padding: "16px",
          }}>
            <p style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 14 }}>
              Contato
            </p>
            {[
              { icon: Mail,      label: "Email",   value: lead.contact_email },
              { icon: Building2, label: "Empresa", value: lead.contact_company },
              { icon: Clock,     label: "Data",    value: new Date(lead.created_at).toLocaleString("pt-BR") },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "8px 0",
                borderBottom: "1px solid var(--border)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Icon size={12} color="var(--text-muted)" />
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{label}</span>
                </div>
                <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{value || "—"}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
