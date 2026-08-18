"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import { NewLeadForm } from "./NewLeadForm";
import { useRouter } from "next/navigation";

export function NewLeadButton() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  function handleSuccess() {
    setTimeout(() => router.refresh(), 2000);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          background: "var(--green)", color: "#09090c",
          border: "none", borderRadius: 10,
          padding: "8px 14px", fontSize: 12, fontWeight: 600,
          cursor: "pointer",
          transition: "opacity 0.15s, transform 0.15s",
          boxShadow: "0 0 16px rgba(0,214,143,0.25)",
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = "0.88"; (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.97)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
      >
        <Plus size={13} strokeWidth={2.5} />
        Novo lead
      </button>
      {open && <NewLeadForm onClose={() => setOpen(false)} onSuccess={handleSuccess} />}
    </>
  );
}
