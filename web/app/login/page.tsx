"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";

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

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Não foi possível entrar.");
        setLoading(false);
        return;
      }
      router.push(params.get("next") || "/dashboard");
      router.refresh();
    } catch {
      setError("Falha de conexão. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "var(--bg)", padding: 24,
    }}>
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className="surface"
        style={{ width: "100%", maxWidth: 340, padding: "28px 26px" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <div style={{
            width: 16, height: 16, background: "var(--t0)", borderRadius: 3, flexShrink: 0,
          }} />
          <span className="mono" style={{ fontSize: 13, color: "var(--t0)", fontWeight: 500 }}>signal</span>
        </div>
        <p style={{ fontSize: 12, color: "var(--t2)", marginBottom: 22 }}>
          Entre com a senha do dashboard.
        </p>

        <label className="label" htmlFor="password" style={{ display: "block", marginBottom: 5 }}>
          Senha
        </label>
        <div style={{ position: "relative", marginBottom: error ? 8 : 18 }}>
          <Lock
            size={13}
            style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--t2)" }}
          />
          <input
            id="password"
            type="password"
            autoFocus
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ ...field, paddingLeft: 30 }}
            placeholder="••••••••"
          />
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
            style={{ fontSize: 12, color: "var(--hot)", marginBottom: 18 }}
          >
            {error}
          </motion.p>
        )}

        <motion.button
          type="submit"
          disabled={loading}
          whileHover={loading ? {} : { opacity: 0.85 }}
          whileTap={loading ? {} : { scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          style={{
            width: "100%", padding: "9px 0", borderRadius: "var(--r)", border: "none",
            background: "var(--t0)", color: "var(--bg)", fontSize: 13, fontWeight: 600,
            cursor: loading ? "default" : "pointer", opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "Entrando..." : "Entrar"}
        </motion.button>
      </motion.form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
