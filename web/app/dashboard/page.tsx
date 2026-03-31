import { MetricsBar } from "./components/MetricsBar";
import { LeadCard } from "./components/LeadCard";

type Lead = {
  id: string;
  contact: { name: string; email: string; company?: string };
  source: string;
  temperature: "QUENTE" | "MORNO" | "FRIO";
  pitch: string;
  created_at: string;
};

const MOCK_LEADS: Lead[] = [
  {
    id: "1",
    contact: { name: "Ana Souza", email: "ana@techcorp.com.br", company: "TechCorp" },
    source: "hubspot", temperature: "QUENTE",
    pitch: "Olá Ana, nossa solução pode ser implementada em até 2 semanas. Temos plano anual com 20% de desconto. Posso agendar uma conversa rápida?",
    created_at: "2026-03-30T10:00:00Z",
  },
];

async function getLeads(): Promise<Lead[]> {
  try {
    const res = await fetch("http://localhost:3001/api/leads", { cache: "no-store" });
    if (!res.ok) throw new Error("API indisponível");
    const data = await res.json();
    if (!data.leads || data.leads.length === 0) return MOCK_LEADS;

    return data.leads.map((l: any) => ({
      id: l.id,
      contact: {
        name:    l.contact_name  || "Lead",
        email:   l.contact_email || `lead-${l.id.slice(0,6)}@signal.ai`,
        company: l.contact_company || undefined,
      },
      source:      l.source,
      temperature: l.temperature,
      pitch:       l.pitch,
      created_at:  l.created_at,
    }));
  } catch {
    return MOCK_LEADS;
  }
}

export default async function DashboardPage() {
  const leads = await getLeads();
  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Revenue Intelligence</h1>
          <p className="text-sm text-gray-500 mt-1">
            Leads processados pela pipeline de IA — signal-pipeline
          </p>
        </div>
        <MetricsBar total={leads.length} hot={leads.filter(l => l.temperature === "QUENTE").length} />
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-gray-700">Leads recentes</h2>
          <span className="text-xs text-gray-400">{leads.length} leads</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {leads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} />
          ))}
        </div>
      </div>
    </main>
  );
}
