"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { KeyRound, LogOut, ShieldCheck } from "lucide-react";

const field: React.CSSProperties = {
  width: "100%",
  background: "var(--s2)",
  border: "1px solid var(--b1)",
  borderRadius: "var(--r)",
  padding: "9px 11px",
  fontSize: 13, color: "var(--t0)",
  outline: "none",
  fontFamily: "inherit",
  transition: "border-color 0.12s",
};

const card: React.CSSProperties = {
  background: "var(--s1)",
  border: "1px solid var(--b0)",
  borderRadius: "var(--r)",
  padding: "20px 22px",
  maxWidth: 420,
};

function ChangePasswordCard() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setError("A confirmação não bate com a nova senha.");
      return;
    }
    if (newPassword.length < 8) {
      setError("A nova senha precisa ter pelo menos 8 caracteres.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/settings/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Não foi possível trocar a senha.");
        setLoading(false);
        return;
      }
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setError("Falha de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={card}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <KeyRound size={14} style={{ color: "var(--t1)" }} />
        <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--t0)" }}>Trocar senha</h2>
      </div>
      <p style={{ fontSize: 12, color: "var(--t2)", marginBottom: 18, lineHeight: 1.5 }}>
        O app é single-tenant — uma senha compartilhada pra todo mundo que acessa o dashboard,
        não uma conta por usuário. A troca fica salva com hash no banco.
      </p>

      <form onSubmit={handleSubmit}>
        <label className="label" htmlFor="current" style={{ display: "block", marginBottom: 5 }}>
          Senha atual
        </label>
        <input
          id="current" type="password" required autoComplete="current-password"
          value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
          style={{ ...field, marginBottom: 14 }}
        />

        <label className="label" htmlFor="new" style={{ display: "block", marginBottom: 5 }}>
          Nova senha
        </label>
        <input
          id="new" type="password" required autoComplete="new-password" minLength={8}
          value={newPassword} onChange={e => setNewPassword(e.target.value)}
          style={{ ...field, marginBottom: 14 }}
        />

        <label className="label" htmlFor="confirm" style={{ display: "block", marginBottom: 5 }}>
          Confirmar nova senha
        </label>
        <input
          id="confirm" type="password" required autoComplete="new-password" minLength={8}
          value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
          style={{ ...field, marginBottom: 16 }}
        />

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
            style={{ fontSize: 12, color: "var(--hot)", marginBottom: 14 }}
          >
            {error}
          </motion.p>
        )}
        {success && (
          <motion.p
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
            style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#16A34A", marginBottom: 14 }}
          >
            <ShieldCheck size={13} /> Senha atualizada com sucesso.
          </motion.p>
        )}

        <motion.button
          type="submit"
          disabled={loading}
          whileHover={loading ? {} : { opacity: 0.85 }}
          whileTap={loading ? {} : { scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          style={{
            padding: "8px 16px", borderRadius: "var(--r)", border: "none",
            background: "var(--t0)", color: "var(--bg)", fontSize: 13, fontWeight: 600,
            cursor: loading ? "default" : "pointer", opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "Salvando..." : "Salvar nova senha"}
        </motion.button>
      </form>
    </div>
  );
}

function SessionCard() {
  const router = useRouter();
  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div style={{ ...card, marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <ShieldCheck size={14} style={{ color: "var(--t1)" }} />
        <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--t0)" }}>Sessão</h2>
      </div>
      <p style={{ fontSize: 12, color: "var(--t2)", marginBottom: 16, lineHeight: 1.5 }}>
        Sua sessão dura 12h a partir do login e é renovada a cada nova entrada.
        Encerrar agora invalida o acesso deste navegador.
      </p>
      <motion.button
        onClick={handleLogout}
        whileHover={{ opacity: 0.85 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "8px 16px", borderRadius: "var(--r)", border: "1px solid var(--b1)",
          background: "transparent", color: "var(--t1)", fontSize: 13, fontWeight: 500,
          cursor: "pointer",
        }}
      >
        <LogOut size={13} /> Sair
      </motion.button>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <div style={{ padding: "24px 28px 40px", minHeight: "100vh" }}>
      <div style={{ marginBottom: 22 }}>
        <h1 style={{
          fontSize: 18, fontWeight: 500,
          color: "var(--t0)", letterSpacing: "-0.01em",
          lineHeight: 1.2, marginBottom: 3,
        }}>
          Settings
        </h1>
        <p style={{ fontSize: 11, color: "var(--t2)" }}>Conta e segurança do dashboard</p>
      </div>

      <SessionCard />
      <ChangePasswordCard />
    </div>
  );
}
