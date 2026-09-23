import { PipelineKanban } from "../components/PipelineKanban";
import { NewLeadButton } from "../components/NewLeadButton";
import { AutoRefresh } from "../components/AutoRefresh";
import { getLeads } from "@/lib/leads";

export default async function PipelinePage() {
  const leads = await getLeads();

  return (
    <div style={{ padding: "24px 28px 40px", minHeight: "100vh" }}>
      <div style={{
        display: "flex", alignItems: "flex-end", justifyContent: "space-between",
        marginBottom: 22,
      }}>
        <div>
          <h1 style={{
            fontSize: 18, fontWeight: 500,
            color: "var(--t0)", letterSpacing: "-0.01em",
            lineHeight: 1.2, marginBottom: 3,
          }}>
            Pipeline
          </h1>
          <p style={{ fontSize: 11, color: "var(--t2)" }}>
            Arraste um card entre as colunas pra reclassificar a temperatura
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <AutoRefresh intervalMs={30000} />
          <NewLeadButton />
        </div>
      </div>

      <PipelineKanban leads={leads} />
    </div>
  );
}
