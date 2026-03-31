"use client";
import { useState } from "react";
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
        className="bg-gray-900 text-white text-sm px-4 py-2 rounded-xl hover:bg-gray-700 transition-colors"
      >
        + Novo lead
      </button>
      {open && <NewLeadForm onClose={() => setOpen(false)} onSuccess={handleSuccess} />}
    </>
  );
}
