"use client";
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";

type StatusData = {
  ok: boolean;
  db: { status: "ok" | "error"; latencyMs?: number; error?: string };
  leads: {
    total: number; today: number;
    hotToday: number; warmToday: number; coldToday: number;
    withPitch: number; avgScore: number; lastAt: string | null;
  };
};

function timeAgo(iso: string | null) {
  if (!iso) return "nunca";
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60)   return `${diff}s atrás`;
  if (diff < 3600) return `${Math.floor(diff / 60)}min atrás`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`;
  return `${Math.floor(diff / 86400)}d atrás`;
}

function StatusDot({ ok }: { ok: boolean }) {
  return (
    <div style={{
      width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
      background: ok ? "#16A34A" : "#DC2626",
    }} />
  );
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div className="surface" style={{ padding: "18px 20px", ...style }}>
      {children}
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div>
      <p style={{
        fontFamily: "var(--font-display), sans-serif",
        fontSize: 36, fontWeight: 400, color: "var(--t0)", lineHeight: 1, marginBottom: 5,
      }}>
        {value}
      </p>
      <p className="label" style={{ marginBottom: 2 }}>{label}</p>
      {sub && <p style={{ fontSize: 11, color: "var(--t2)" }}>{sub}</p>}
    </div>
  );
}

export default function MonitorPage() {
  const [data, setData]       = useState<StatusData | null>(null);
  const [error, setError]     = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastAt, setLastAt]   = useState<Date>(new Date());

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/status", { cache: "no-store" });
      const json = await res.json() as StatusData;
      setData(json);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setLastAt(new Date());
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 15000);
    return () => clearInterval(id);
  }, [refresh]);

  const leads = data?.leads;

  return (
    <div style={{ padding: "24px 28px 40px", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "flex-end", justifyContent: "space-between",
        marginBottom: 28,
      }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 500, color: "var(--t0)", letterSpacing: "-0.01em", lineHeight: 1.2, marginBottom: 3 }}>
            Monitor
          </h1>
          <p style={{ fontSize: 11, color: "var(--t2)" }}>
            Atualizado {timeAgo(lastAt.toISOString())} · polling a cada 15s
          </p>
        </div>
        <button
          onClick={refresh}
          className="transition"
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "6px 12px", borderRadius: 4,
            border: "1px solid var(--b1)", background: "transparent",
            fontSize: 12, fontWeight: 500, color: "var(--t1)", cursor: "pointer", fontFamily: "inherit",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "var(--t0)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "var(--t1)"; }}
        >
          <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
          Atualizar
        </button>
      </div>

      {loading && (
        <p style={{ fontSize: 13, color: "var(--t2)" }}>Carregando…</p>
      )}

      {!loading && (error || !data?.ok) && (
        <Card style={{ borderLeft: "3px solid var(--hot)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <StatusDot ok={false} />
            <p style={{ fontSize: 13, fontWeight: 500, color: "var(--t0)" }}>Sistema com falha</p>
          </div>
          <p style={{ fontSize: 12, color: "var(--t1)", marginTop: 6 }}>
            {data?.db.error ?? "Não foi possível conectar à API"}
          </p>
        </Card>
      )}

      {!loading && data?.ok && leads && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {/* Services */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
              <Card>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <StatusDot ok={data.db.status === "ok"} />
                  <p className="label">PostgreSQL</p>
                </div>
                <p style={{ fontSize: 13, fontWeight: 500, color: "var(--t0)" }}>
                  {data.db.status === "ok" ? "Conectado" : "Erro"}
                </p>
                {data.db.latencyMs != null && (
                  <p style={{ fontSize: 11, color: "var(--t2)", marginTop: 3 }}>
                    latência {data.db.latencyMs}ms
                  </p>
                )}
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.05 }}>
              <Card>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <StatusDot ok={leads.lastAt !== null} />
                  <p className="label">Worker</p>
                </div>
                <p style={{ fontSize: 13, fontWeight: 500, color: "var(--t0)" }}>
                  {leads.lastAt ? "Ativo" : "Sem atividade"}
                </p>
                <p style={{ fontSize: 11, color: "var(--t2)", marginTop: 3 }}>
                  último lead {timeAgo(leads.lastAt)}
                </p>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.1 }}>
              <Card>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <StatusDot ok />
                  <p className="label">API Web</p>
                </div>
                <p style={{ fontSize: 13, fontWeight: 500, color: "var(--t0)" }}>Online</p>
                <p style={{ fontSize: 11, color: "var(--t2)", marginTop: 3 }}>Next.js 16 · App Router</p>
              </Card>
            </motion.div>
          </div>

          {/* Stats hoje */}
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.15 }}>
            <Card>
              <p className="label" style={{ marginBottom: 18 }}>Últimas 24 horas</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 24 }}>
                <Stat label="Leads recebidos" value={leads.today} sub={`${leads.total} no total`} />
                <Stat label="Leads quentes" value={leads.hotToday}
                  sub={leads.today > 0 ? `${Math.round((leads.hotToday / leads.today) * 100)}% do dia` : "—"} />
                <Stat label="Leads mornos" value={leads.warmToday}
                  sub={leads.today > 0 ? `${Math.round((leads.warmToday / leads.today) * 100)}% do dia` : "—"} />
                <Stat label="Com pitch" value={leads.withPitch}
                  sub={`score médio ${leads.avgScore}`} />
              </div>
            </Card>
          </motion.div>

          {/* Temperature breakdown bar */}
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.2 }}>
            <Card>
              <p className="label" style={{ marginBottom: 14 }}>Distribuição de temperatura (24h)</p>
              {leads.today > 0 ? (
                <div>
                  <div style={{ display: "flex", height: 8, borderRadius: 4, overflow: "hidden", gap: 2, marginBottom: 12 }}>
                    {leads.hotToday > 0 && (
                      <div style={{
                        flex: leads.hotToday, background: "var(--hot)", borderRadius: 4,
                        transition: "flex 0.4s ease",
                      }} />
                    )}
                    {leads.warmToday > 0 && (
                      <div style={{
                        flex: leads.warmToday, background: "var(--warm)", borderRadius: 4,
                        transition: "flex 0.4s ease",
                      }} />
                    )}
                    {leads.coldToday > 0 && (
                      <div style={{
                        flex: leads.coldToday, background: "var(--cold)", borderRadius: 4,
                        transition: "flex 0.4s ease",
                      }} />
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 16 }}>
                    {[
                      { label: "Quente", count: leads.hotToday,  color: "var(--hot)"  },
                      { label: "Morno",  count: leads.warmToday, color: "var(--warm)" },
                      { label: "Frio",   count: leads.coldToday, color: "var(--cold)" },
                    ].map(({ label, count, color }) => (
                      <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 8, height: 8, borderRadius: 2, background: color, flexShrink: 0 }} />
                        <span style={{ fontSize: 12, color: "var(--t1)" }}>
                          {label} <span style={{ fontWeight: 600, color: "var(--t0)" }}>{count}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p style={{ fontSize: 12, color: "var(--t2)" }}>Nenhum lead nas últimas 24h</p>
              )}
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
}
