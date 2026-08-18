"use client";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

type Props = { onClose: () => void; onSuccess: () => void };

const field: React.CSSProperties = {
  width: "100%",
  background: "var(--s2)",
  border: "1px solid var(--b1)",
  borderRadius: "var(--r)",
  padding: "8px 11px",
  fontSize: 13,
  color: "var(--t0)",
  outline: "none",
  transition: "border-color 0.12s",
};

function Modal({ onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", company: "", source: "manual", raw_text: "" });

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", h); document.body.style.overflow = ""; };
  }, [onClose]);

  async function submit() {
    if (!form.raw_text || !form.email) return;
    setLoading(true);
    try {
      await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: form.source,
          contact: { name: form.name, email: form.email, company: form.company },
          raw_text: form.raw_text,
        }),
      });
      onSuccess();
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const disabled = loading || !form.raw_text || !form.email;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24,
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 8, opacity: 0 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: "100%", maxWidth: 480,
          background: "var(--s1)",
          border: "1px solid var(--b1)",
          borderRadius: 8,
          padding: 24,
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
        }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: "var(--t0)" }}>Novo lead</p>
          <button
            onClick={onClose}
            style={{
              width: 24, height: 24,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "none", border: "1px solid var(--b1)",
              borderRadius: 4, cursor: "pointer",
              color: "var(--t2)",
            }}
          >
            <X size={11} />
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { key: "name",  label: "Nome",  placeholder: "Ana Souza",       type: "text"  },
              { key: "email", label: "Email", placeholder: "ana@empresa.com", type: "email" },
            ].map(({ key, label, placeholder, type }) => (
              <div key={key}>
                <p className="label" style={{ marginBottom: 5 }}>{label}</p>
                <input
                  type={type}
                  style={field}
                  placeholder={placeholder}
                  value={form[key as keyof typeof form]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  onFocus={e => (e.currentTarget as HTMLInputElement).style.borderColor = "var(--b2)"}
                  onBlur={e => (e.currentTarget as HTMLInputElement).style.borderColor = "var(--b1)"}
                />
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <p className="label" style={{ marginBottom: 5 }}>Empresa</p>
              <input
                style={field}
                placeholder="TechCorp"
                value={form.company}
                onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                onFocus={e => (e.currentTarget as HTMLInputElement).style.borderColor = "var(--b2)"}
                onBlur={e => (e.currentTarget as HTMLInputElement).style.borderColor = "var(--b1)"}
              />
            </div>
            <div>
              <p className="label" style={{ marginBottom: 5 }}>Origem</p>
              <select
                style={{ ...field, cursor: "pointer" }}
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
            <p className="label" style={{ marginBottom: 5 }}>Texto da interação</p>
            <textarea
              style={{ ...field, resize: "none" as const, lineHeight: 1.6 }}
              rows={5}
              placeholder="Cole aqui o e-mail, transcrição ou mensagem do lead..."
              value={form.raw_text}
              onChange={e => setForm(f => ({ ...f, raw_text: e.target.value }))}
              onFocus={e => (e.currentTarget as HTMLTextAreaElement).style.borderColor = "var(--b2)"}
              onBlur={e => (e.currentTarget as HTMLTextAreaElement).style.borderColor = "var(--b1)"}
            />
          </div>

          <button
            onClick={submit}
            disabled={disabled}
            style={{
              padding: "9px 0",
              background: disabled ? "var(--s3)" : "var(--t0)",
              color: disabled ? "var(--t2)" : "var(--bg)",
              border: "none",
              borderRadius: "var(--r)",
              fontSize: 13, fontWeight: 600,
              cursor: disabled ? "not-allowed" : "pointer",
              transition: "background 0.15s, color 0.15s, opacity 0.12s",
            }}
            onMouseEnter={e => { if (!disabled) (e.currentTarget as HTMLButtonElement).style.opacity = "0.85"; }}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.opacity = "1"}
          >
            {loading ? "Enviando..." : "Processar lead"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function NewLeadForm({ onClose, onSuccess }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(
    <AnimatePresence>
      <Modal onClose={onClose} onSuccess={onSuccess} />
    </AnimatePresence>,
    document.body,
  );
}
