import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { createServerFn } from "@tanstack/react-start";
import {
  MODULE_LABELS,
  OPEN_STATUSES,
  type DashboardModuleCard,
  type DashboardRecentTicket,
  type DashboardStat,
  type RequisitionModule,
  type RequisitionRecord,
} from "@/lib/requisitions";
import { supabaseRest } from "@/lib/supabase-rest";

function buildCountQuery(filters: Record<string, string>) {
  const params = new URLSearchParams({ select: "id" });

  Object.entries(filters).forEach(([key, value]) => {
    params.set(key, value);
  });

  return `requisitions?${params.toString()}`;
}

async function getCount(filters: Record<string, string>) {
  const result = await supabaseRest<null>(buildCountQuery(filters), {
    method: "HEAD",
    headers: {
      Prefer: "count=exact",
    },
  });

  return result.count;
}

function buildModuleCards(openCountsByModule: Record<RequisitionModule, number>): DashboardModuleCard[] {
  return [
    {
      title: "Produtos",
      desc: "Materiais, insumos e equipamentos",
      url: "/products",
      tag: "M1",
      count: openCountsByModule.M1,
    },
    {
      title: "Viagens",
      desc: "Passagens, hotel e despesas",
      url: "/trips",
      tag: "M2",
      count: openCountsByModule.M2,
    },
    {
      title: "Serviços",
      desc: "Consultoria, manutenção e projetos",
      url: "/services",
      tag: "M3",
      count: openCountsByModule.M3,
    },
    {
      title: "Manutenção",
      desc: "Corretiva, preventiva e preditiva",
      url: "/maintenance",
      tag: "M4",
      count: openCountsByModule.M4,
    },
    {
      title: "Frete",
      desc: "Transporte e logística",
      url: "/freight",
      tag: "M5",
      count: openCountsByModule.M5,
    },
    {
      title: "Locação",
      desc: "Equipamentos e veículos temporários",
      url: "/rental",
      tag: "M6",
      count: openCountsByModule.M6,
    },
  ];
}

function mapRecentTickets(items: RequisitionRecord[]): DashboardRecentTicket[] {
  return items.map((ticket) => ({
    id: ticket.ticket_number,
    module: ticket.module,
    title: ticket.title,
    urgency: ticket.urgency,
    status: ticket.status,
    date: format(new Date(ticket.created_at), "dd/MM", { locale: ptBR }),
  }));
}

export const getDashboardData = createServerFn({ method: "GET" }).handler(async () => {
  const firstDayOfMonth = new Date();
  firstDayOfMonth.setDate(1);
  firstDayOfMonth.setHours(0, 0, 0, 0);

  const openStatuses = `in.(${OPEN_STATUSES.join(",")})`;

  const [
    openCount,
    quotingCount,
    approvalCount,
    completedThisMonth,
    recentTicketsResponse,
    m1Open,
    m2Open,
    m3Open,
    m4Open,
    m5Open,
    m6Open,
  ] = await Promise.all([
    getCount({ status: openStatuses }),
    getCount({ status: "eq.COTAÇÃO" }),
    getCount({ status: "eq.APROVAÇÃO" }),
    getCount({
      status: "eq.CONCLUÍDO",
      completed_at: `gte.${firstDayOfMonth.toISOString()}`,
    }),
    supabaseRest<RequisitionRecord[]>(
      "requisitions?select=id,ticket_number,module,title,urgency,status,created_at&order=created_at.desc&limit=5",
    ),
    getCount({ module: "eq.M1", status: openStatuses }),
    getCount({ module: "eq.M2", status: openStatuses }),
    getCount({ module: "eq.M3", status: openStatuses }),
    getCount({ module: "eq.M4", status: openStatuses }),
    getCount({ module: "eq.M5", status: openStatuses }),
    getCount({ module: "eq.M6", status: openStatuses }),
  ]);

  const stats: DashboardStat[] = [
    { label: "Tickets Abertos", value: String(openCount), trend: "Dados reais" },
    { label: "Em Cotação", value: String(quotingCount), trend: "Fila V2" },
    { label: "Em Aprovação", value: String(approvalCount), trend: "Fila V3" },
    { label: "Concluídos (mês)", value: String(completedThisMonth), trend: "Mês atual" },
  ];

  const modules = buildModuleCards({
    M1: m1Open,
    M2: m2Open,
    M3: m3Open,
    M4: m4Open,
    M5: m5Open,
    M6: m6Open,
  });

  return {
    stats,
    modules,
    recentTickets: mapRecentTickets(recentTicketsResponse.data),
    moduleLabels: MODULE_LABELS,
  };
});
