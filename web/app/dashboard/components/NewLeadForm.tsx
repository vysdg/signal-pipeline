"use client";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Loader2 } from "lucide-react";

type Props = { onClose: () => void; onSuccess: () => void };

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--bg-base)",
  border: "1px solid var(--border-strong)",
  borderRadius: 8, padding: "9px 12px",
  fontSize: 13, color: "var(--text-primary)",
  outline: "none",
  transition: "border-color 0.15s",
};

function Modal({ onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", company: "", source: "manual", raw_text: "" });

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", handler); document.body.style.overflow = ""; };
  }, [onClose]);

  async function handleSubmit() {
    if (!form.raw_text || !form.email) return;
    setLoading(true);
    try {
      await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: form.source, contact: { name: form.name, email: form.email, company: form.company }, raw_text: form.raw_text }),
      });
      onSuccess();
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
      onClick={onClose}
    >
      <div
        style={{ width: "100%", maxWidth: 520, background: "var(--bg-surface)", border: "1px solid var(--border-strong)", borderRadius: 16, padding: "24px", boxShadow: "0 32px 80px rgba(0,0,0,0.5)", animation: "rise 0.35s cubic-bezier(0.16,1,0.3,1) both" }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <p style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)" }}>Novo lead</p>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { key: "name",  label: "Nome",  placeholder: "Ana Souza",        type: "text" },
              { key: "email", label: "Email", placeholder: "ana@empresa.com",  type: "email" },
            ].map(({ key, label, placeholder, type }) => (
              <div key={key}>
                <p style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>{label}</p>
                <input
                  type={type}
                  style={inputStyle}
                  placeholder={placeholder}
                  value={form[key as keyof typeof form]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                />
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <p style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>Empresa</p>
              <input style={inputStyle} placeholder="TechCorp" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} />
            </div>
            <div>
              <p style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>Origem</p>
              <select
                style={{ ...inputStyle, appearance: "none" as const }}
                value={form.source}
                onChange={e => setForm(f => ({ ...f, source: e.target.value }))}
              >
                <option value="manual">Manual</option>
                <option value="hubspot">HubSpot</option>
                <option value="rdstation">RD Station</option>
              </select>
            </div>
          </div>

          <div>
            <p style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>Texto da interação</p>
            <textarea
              style={{ ...inputStyle, resize: "none" as const, lineHeight: 1.6 }}
              rows={5}
              placeholder="Cole aqui o e-mail, transcrição ou mensagem do lead..."
              value={form.raw_text}
              onChange={e => setForm(f => ({ ...f, raw_text: e.target.value }))}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || !form.raw_text || !form.email}
            style={{
              width: "100%", padding: "10px",
              background: loading || !form.raw_text || !form.email ? "var(--bg-elevated)" : "var(--green)",
              color: loading || !form.raw_text || !form.email ? "var(--text-muted)" : "#09090c",
              border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600,
              cursor: loading || !form.raw_text || !form.email ? "not-allowed" : "pointer",
              transition: "background 0.2s, color 0.2s",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            {loading && <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} />}
            {loading ? "Enviando para IA..." : "Processar lead"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function NewLeadForm({ onClose, onSuccess }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(<Modal onClose={onClose} onSuccess={onSuccess} />, document.body);
}
