"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { NewLeadForm } from "./NewLeadForm";
import { useRouter } from "next/navigation";

export function NewLeadButton() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  return (
    <>
      <motion.button
        onClick={() => setOpen(true)}
        style={{
          display: "flex", alignItems: "center", gap: 5,
          padding: "6px 12px",
          background: "var(--t0)", color: "var(--bg)",
          border: "none", borderRadius: "var(--r)",
          fontSize: 12, fontWeight: 600, cursor: "pointer",
          outlineOffset: 2,
        }}
        whileHover={{ opacity: 0.82 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <Plus size={12} strokeWidth={2.5} />
        Novo lead
      </motion.button>
      {open && <NewLeadForm onClose={() => setOpen(false)} onSuccess={() => setTimeout(() => router.refresh(), 2000)} />}
    </>
  );
}
