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
  const avgScore  = leads.length > 0
    ? Math.round(leads.reduce((s, l) => s + (l.score || 0), 0) / leads.length)
    : 0;
  const chartData = buildChartData(leads);

  return (
    <div style={{ padding: "24px 28px", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        marginBottom: 20,
      }}>
        <div>
          <h1 style={{
            fontSize: 16,
            fontWeight: 500,
            color: "var(--t0)",
            letterSpacing: "-0.02em",
            lineHeight: 1.3,
          }}>
            Revenue Intelligence
          </h1>
          <p style={{ fontSize: 12, color: "var(--t2)", marginTop: 3 }}>
            {leads.length} leads processados
          </p>
        </div>
        <NewLeadButton />
      </div>

      {/* Metrics */}
      <MetricsBar total={leads.length} hot={hot} avgScore={avgScore} avgTime="1.8s" />

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 8, marginBottom: 8 }}>
        <VolumeChart
          data={chartData.length > 0
            ? chartData
            : [{ date: "hoje", quente: 0, morno: 0, frio: 0 }]}
        />
        <FunnelChart total={leads.length} processed={leads.length} warm={warm} hot={hot} />
      </div>

      {/* Table */}
      <LeadTable leads={leads} />
    </div>
  );
}
