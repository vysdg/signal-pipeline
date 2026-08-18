import { unstable_noStore as noStore } from "next/cache";
import { MetricsBar } from "./components/MetricsBar";
import { LeadTable, Lead } from "./components/LeadTable";
import { VolumeChart } from "./components/VolumeChart";
import { FunnelChart } from "./components/FunnelChart";
import { NewLeadButton } from "./components/NewLeadButton";
import pool from "@/lib/db";

async function getLeads(): Promise<Lead[]> {
  noStore();
  try {
    const result = await pool.query(`
      SELECT id, raw_text, source, temperature, pitch,
             score, niche, pain_point,
             contact_name, contact_email, contact_company, created_at
      FROM leads ORDER BY created_at DESC LIMIT 100
    `);
    return result.rows;
  } catch {
    return [];
  }
}

function buildChartData(leads: Lead[]) {
  const days: Record<string, { quente: number; morno: number; frio: number }> = {};
  leads.forEach(l => {
    const d = new Date(l.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
    if (!days[d]) days[d] = { quente: 0, morno: 0, frio: 0 };
    if (l.temperature === "QUENTE") days[d].quente++;
    else if (l.temperature === "MORNO") days[d].morno++;
    else days[d].frio++;
  });
  return Object.entries(days).slice(-7).map(([date, v]) => ({ date, ...v }));
}

export default async function DashboardPage() {
  const leads     = await getLeads();
  const hot       = leads.filter(l => l.temperature === "QUENTE").length;
  const warm      = leads.filter(l => l.temperature === "MORNO" || l.temperature === "QUENTE").length;
  const avgScore  = leads.length > 0 ? Math.round(leads.reduce((s, l) => s + (l.score || 0), 0) / leads.length) : 0;
  const chartData = buildChartData(leads);

  return (
    <div style={{ minHeight: "100vh", padding: "28px 32px" }}>
      {/* Background blobs */}
      <div className="blob" style={{ width: 400, height: 400, background: "rgba(0,214,143,0.04)", top: -100, right: -100 }} />
      <div className="blob" style={{ width: 300, height: 300, background: "rgba(255,75,75,0.03)", bottom: 100, left: 50, animationDelay: "3s" }} />

      {/* Header */}
      <div className="animate-rise" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 500, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
            Revenue Intelligence
          </h1>
          <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
            signal-pipeline · {leads.length} leads processados
          </p>
        </div>
        <NewLeadButton />
      </div>

      {/* Metrics */}
      <MetricsBar total={leads.length} hot={hot} avgScore={avgScore} avgTime="1.8s" />

      {/* Charts row */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12, marginBottom: 16 }}>
        <VolumeChart data={chartData.length > 0 ? chartData : [{ date: "hoje", quente: 0, morno: 0, frio: 0 }]} />
        <FunnelChart total={leads.length} processed={leads.length} warm={warm} hot={hot} />
      </div>

      {/* Table */}
      <LeadTable leads={leads} />
    </div>
  );
}
