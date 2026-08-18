"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import { NewLeadForm } from "./NewLeadForm";
import { useRouter } from "next/navigation";

export function NewLeadButton() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "6px 12px",
          background: "var(--t0)",
          color: "var(--bg)",
          border: "none",
          borderRadius: "var(--r)",
          fontSize: 12,
          fontWeight: 600,
          cursor: "pointer",
          transition: "opacity 0.12s",
        }}
        onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.opacity = "0.85"}
        onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.opacity = "1"}
        onMouseDown={e => (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.97)"}
        onMouseUp={e => (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"}
      >
        <Plus size={12} strokeWidth={2.5} />
        Novo lead
      </button>
      {open && (
        <NewLeadForm
          onClose={() => setOpen(false)}
          onSuccess={() => setTimeout(() => router.refresh(), 2000)}
        />
      )}
    </>
  );
}
