import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  ScrollText,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Timer,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  User,
  FileText,
  ArrowRight,
  Download,
  Building2,
  Hourglass,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/logs")({
  head: () => ({
    meta: [
      { title: "Logs de Auditoria — VPRequisições" },
      {
        name: "description",
        content: "Trilha de auditoria imutável e métricas SLA do sistema de requisições",
      },
    ],
  }),
  component: LogsPage,
});

/* ────────────────────────────────────────────────
 *  Types (aligned with SDD §3.1)
 * ──────────────────────────────────────────────── */

interface AuditLogEntry {
  id: string;
  ticket_id: string;
  module: string; // M1-M6
  action_type: string;
  action_description: string; // pt-BR human-readable
  module_stage: string; // V1-V5
  user_name: string;
  user_role: string;
  user_department: string;
  created_at: string; // display timestamp
  metadata?: {
    from_status?: string;
    to_status?: string;
    supplier_name?: string; // name only, NO price
    approval_level?: number;
    exception_reason?: string;
    previous_assignee?: string;
    new_assignee?: string;
  };
  sla_elapsed_hours: number;
  is_sla_breach: boolean;
}

type SlaStatus = "ok" | "warning" | "breach";

/* ────────────────────────────────────────────────
 *  Mock data — NO financial data (§2.3)
 * ──────────────────────────────────────────────── */

interface SLATarget {
  module: string;
  target_v1_to_v2: number;
  target_v2_to_v3: number;
  target_v3_to_v4: number;
  target_v4_completion: number;
  target_total: number;
  business_hours_only: boolean;
}

const SLA_TARGETS: SLATarget[] = [
  {
    module: "M1",
    target_v1_to_v2: 24,
    target_v2_to_v3: 72,
    target_v3_to_v4: 48,
    target_v4_completion: 240,
    target_total: 720,
    business_hours_only: false,
  },
  {
    module: "M2",
    target_v1_to_v2: 4,
    target_v2_to_v3: 24,
    target_v3_to_v4: 24,
    target_v4_completion: 168,
    target_total: 336,
    business_hours_only: false,
  },
  {
    module: "M3",
    target_v1_to_v2: 48,
    target_v2_to_v3: 72,
    target_v3_to_v4: 48,
    target_v4_completion: 480,
    target_total: 720,
    business_hours_only: false,
  },
  {
    module: "M4",
    target_v1_to_v2: 8,
    target_v2_to_v3: 24,
    target_v3_to_v4: 24,
    target_v4_completion: 120,
    target_total: 336,
    business_hours_only: false,
  },
  {
    module: "M5",
    target_v1_to_v2: 24,
    target_v2_to_v3: 48,
    target_v3_to_v4: 48,
    target_v4_completion: 240,
    target_total: 720,
    business_hours_only: false,
  },
  {
    module: "M6",
    target_v1_to_v2: 24,
    target_v2_to_v3: 48,
    target_v3_to_v4: 48,
    target_v4_completion: 240,
    target_total: 720,
    business_hours_only: false,
  },
];

function getSlaTarget(module: string): SLATarget {
  return SLA_TARGETS.find((t) => t.module === module) ?? SLA_TARGETS[0];
}

function getStageTarget(module: string, stage: string): number {
  const t = getSlaTarget(module);
  if (stage === "V2") return t.target_v1_to_v2;
  if (stage === "V3") return t.target_v2_to_v3;
  if (stage === "V4") return t.target_v3_to_v4;
  if (stage === "V5") return t.target_v4_completion;
  return t.target_total;
}

/* Global averages for the metrics cards (mock) */
const slaMetrics: {
  label: string;
  avgHours: number;
  targetLabel: string;
  targetHours: number;
  status: SlaStatus;
}[] = [
  { label: "V1 → V2", avgHours: 12, targetLabel: "M1: 24h", targetHours: 24, status: "ok" },
  { label: "V2 → V3", avgHours: 52, targetLabel: "M1: 72h", targetHours: 72, status: "ok" },
  { label: "V3 → V4", avgHours: 55, targetLabel: "M1: 48h", targetHours: 48, status: "warning" },
  { label: "V4 → Conclusão", avgHours: 310, targetLabel: "M1: 240h", targetHours: 240, status: "breach" },
];

const auditEntries: AuditLogEntry[] = [
  {
    id: "a1",
    ticket_id: "M1-000065",
    module: "M1",
    action_type: "REQUISITION_CREATED",
    action_description: "Requisição criada",
    module_stage: "V1",
    user_name: "Carlos Silva",
    user_role: "Requisitante",
    user_department: "Engenharia",
    created_at: "28/04/2026 09:15",
    sla_elapsed_hours: 0,
    is_sla_breach: false,
  },
  {
    id: "a2",
    ticket_id: "M1-000065",
    module: "M1",
    action_type: "QUOTATION_STARTED",
    action_description: "Cotação iniciada — 3 fornecedores selecionados",
    module_stage: "V2",
    user_name: "Ana Oliveira",
    user_role: "Cotador",
    user_department: "Compras",
    created_at: "28/04/2026 11:30",
    sla_elapsed_hours: 2.25,
    is_sla_breach: false,
  },
  {
    id: "a3",
    ticket_id: "M1-000065",
    module: "M1",
    action_type: "SENT_FOR_APPROVAL",
    action_description: "Enviado para aprovação",
    module_stage: "V3",
    user_name: "Ana Oliveira",
    user_role: "Cotador",
    user_department: "Compras",
    created_at: "29/04/2026 08:00",
    metadata: { supplier_name: "Fornecedor ABC" },
    sla_elapsed_hours: 22.75,
    is_sla_breach: false,
  },
  {
    id: "a4",
    ticket_id: "M4-000031",
    module: "M4",
    action_type: "REQUISITION_CREATED",
    action_description: "Requisição criada — Prensa Hidráulica, Vazamento, Máquina Parada",
    module_stage: "V1",
    user_name: "Roberto Mendes",
    user_role: "Requisitante",
    user_department: "Produção",
    created_at: "25/04/2026 14:22",
    sla_elapsed_hours: 0,
    is_sla_breach: false,
  },
  {
    id: "a5",
    ticket_id: "M4-000031",
    module: "M4",
    action_type: "QUOTATION_STARTED",
    action_description: "Cotação iniciada — atraso de 44h",
    module_stage: "V2",
    user_name: "Ana Oliveira",
    user_role: "Cotador",
    user_department: "Compras",
    created_at: "27/04/2026 10:00",
    sla_elapsed_hours: 44,
    is_sla_breach: true,
    metadata: { exception_reason: "Aguardando diagnóstico técnico" },
  },
  {
    id: "a6",
    ticket_id: "M2-000042",
    module: "M2",
    action_type: "REQUISITION_CREATED",
    action_description: "Requisição criada — Viagem SP, Cliente ABC",
    module_stage: "V1",
    user_name: "Fernanda Costa",
    user_role: "Requisitante",
    user_department: "Comercial",
    created_at: "27/04/2026 07:45",
    sla_elapsed_hours: 0,
    is_sla_breach: false,
  },
  {
    id: "a7",
    ticket_id: "M2-000042",
    module: "M2",
    action_type: "APPROVED",
    action_description: "Aprovado sem ressalvas",
    module_stage: "V3",
    user_name: "Diretor Marcos",
    user_role: "Aprovador",
    user_department: "Diretoria",
    created_at: "27/04/2026 16:30",
    metadata: { approval_level: 2 },
    sla_elapsed_hours: 8.75,
    is_sla_breach: false,
  },
  {
    id: "a8",
    ticket_id: "M5-000028",
    module: "M5",
    action_type: "PURCHASE_ORDER_ISSUED",
    action_description: "Pedido de compra emitido — Frete Chapas Aço SP→CWB",
    module_stage: "V4",
    user_name: "Paulo Ferreira",
    user_role: "Comprador",
    user_department: "Compras",
    created_at: "24/04/2026 11:15",
    sla_elapsed_hours: 36,
    is_sla_breach: false,
  },
  {
    id: "a9",
    ticket_id: "M5-000028",
    module: "M5",
    action_type: "MATERIAL_RECEIVED",
    action_description: "Material recebido em ordem — 12 chapas conferidas",
    module_stage: "V5",
    user_name: "José Santos",
    user_role: "Almoxarife",
    user_department: "Almoxarifado",
    created_at: "30/04/2026 09:00",
    sla_elapsed_hours: 178,
    is_sla_breach: true,
  },
  {
    id: "a10",
    ticket_id: "M3-000018",
    module: "M3",
    action_type: "QUOTATION_RECEIVED",
    action_description: "Cotação recebida — Fornecedor XYZ selecionado",
    module_stage: "V2",
    user_name: "Ana Oliveira",
    user_role: "Cotador",
    user_department: "Compras",
    created_at: "28/04/2026 17:00",
    metadata: { supplier_name: "Fornecedor XYZ" },
    sla_elapsed_hours: 30,
    is_sla_breach: false,
  },
];

const moduleOptions = ["Todos", "M1", "M2", "M3", "M4", "M5", "M6"];
const stageOptions = ["Todos", "V1", "V2", "V3", "V4", "V5"];
const slaOptions = ["Todos", "ok", "warning", "breach"];

/* ────────────────────────────────────────────────
 *  Helpers
 * ──────────────────────────────────────────────── */

/** Format hours as "X dias Yh" per spec §2.2 */
function formatSla(hours: number): string {
  if (hours === 0) return "0h";
  const days = Math.floor(hours / 24);
  const h = Math.round(hours % 24);
  if (days === 0) return `${h}h`;
  if (h === 0) return `${days} dia${days > 1 ? "s" : ""}`;
  return `${days} dia${days > 1 ? "s" : ""} ${h}h`;
}

function formatMetricAvg(hours: number): string {
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  const h = Math.round(hours % 24);
  if (h === 0) return `${days}d`;
  return `${days}d ${h}h`;
}

function deriveSlaStatus(entry: AuditLogEntry): SlaStatus {
  if (entry.is_sla_breach) return "breach";
  if (entry.sla_elapsed_hours > 0) {
    const target = getStageTarget(entry.module, entry.module_stage);
    if (entry.sla_elapsed_hours >= target) return "breach";
    if (entry.sla_elapsed_hours >= target * 0.75) return "warning";
  }
  return "ok";
}

function slaIcon(status: SlaStatus) {
  if (status === "ok") return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
  if (status === "warning") return <AlertTriangle className="h-4 w-4 text-amber-500" />;
  return <AlertTriangle className="h-4 w-4 text-red-500" />;
}

function slaBadge(status: SlaStatus) {
  const map = {
    ok: { label: "No prazo", cls: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    warning: { label: "Atenção", cls: "bg-amber-100 text-amber-700 border-amber-200" },
    breach: { label: "SLA Excedido", cls: "bg-red-100 text-red-700 border-red-200" },
  };
  const m = map[status];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${m.cls}`}
    >
      {slaIcon(status)}
      {m.label}
    </span>
  );
}

function metricColor(status: SlaStatus) {
  if (status === "ok") return "text-emerald-600";
  if (status === "warning") return "text-amber-500";
  return "text-red-500";
}

/* ────────────────────────────────────────────────
 *  Page Component
 * ──────────────────────────────────────────────── */

function LogsPage() {
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("Todos");
  const [stageFilter, setStageFilter] = useState("Todos");
  const [slaFilter, setSlaFilter] = useState("Todos");
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);

  const filtered = auditEntries.filter((e) => {
    if (moduleFilter !== "Todos" && e.module !== moduleFilter) return false;
    if (stageFilter !== "Todos" && e.module_stage !== stageFilter) return false;
    if (slaFilter !== "Todos") {
      const s = deriveSlaStatus(e);
      if (s !== slaFilter) return false;
    }
    if (search) {
      const q = search.toLowerCase();
      return (
        e.ticket_id.toLowerCase().includes(q) ||
        e.action_description.toLowerCase().includes(q) ||
        e.user_name.toLowerCase().includes(q) ||
        e.user_department.toLowerCase().includes(q) ||
        e.action_type.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Group by ticket_id for timeline view
  const grouped = filtered.reduce<Record<string, AuditLogEntry[]>>((acc, entry) => {
    if (!acc[entry.ticket_id]) acc[entry.ticket_id] = [];
    acc[entry.ticket_id].push(entry);
    return acc;
  }, {});

  const ticketIds = Object.keys(grouped);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
          <ScrollText className="h-5 w-5 text-vp-yellow-dark" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">Logs de Auditoria</h1>
          <p className="text-sm text-muted-foreground">
            Trilha imutável · Sem dados financeiros · SLA em tempo real
          </p>
        </div>
      </div>

      {/* SLA Metrics — §2.2 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {slaMetrics.map((m) => (
          <Card key={m.label} className="card-hover-yellow">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Timer className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Média {m.label}</p>
              </div>
              <p className={`text-2xl font-bold ${metricColor(m.status)}`}>
                {formatMetricAvg(m.avgHours)}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Meta: {m.targetLabel}
                {m.status === "breach" && (
                  <span className="text-red-500 font-semibold ml-1">● Excedido</span>
                )}
                {m.status === "warning" && (
                  <span className="text-amber-500 font-semibold ml-1">● Atenção</span>
                )}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por ticket, ação, ator, departamento..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={moduleFilter} onValueChange={setModuleFilter}>
              <SelectTrigger className="w-full sm:w-[130px]">
                <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Módulo" />
              </SelectTrigger>
              <SelectContent>
                {moduleOptions.map((o) => (
                  <SelectItem key={o} value={o}>
                    {o === "Todos" ? "Módulo" : o}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={stageFilter} onValueChange={setStageFilter}>
              <SelectTrigger className="w-full sm:w-[130px]">
                <ArrowRight className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Etapa" />
              </SelectTrigger>
              <SelectContent>
                {stageOptions.map((o) => (
                  <SelectItem key={o} value={o}>
                    {o === "Todos" ? "Etapa" : o}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={slaFilter} onValueChange={setSlaFilter}>
              <SelectTrigger className="w-full sm:w-[130px]">
                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="SLA" />
              </SelectTrigger>
              <SelectContent>
                {slaOptions.map((o) => (
                  <SelectItem key={o} value={o}>
                    {o === "Todos"
                      ? "SLA"
                      : o === "ok"
                        ? "No prazo"
                        : o === "warning"
                          ? "Atenção"
                          : "Excedido"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Exportar</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Timeline grouped by ticket */}
      <div className="space-y-3">
        {ticketIds.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <ScrollText className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
              <p className="text-muted-foreground">Nenhum registro encontrado.</p>
            </CardContent>
          </Card>
        )}

        {ticketIds.map((ticketId) => {
          const entries = grouped[ticketId];
          const isExpanded = expandedTicket === ticketId;
          const worstSla: SlaStatus = entries.some((e) => e.is_sla_breach)
            ? "breach"
            : entries.some((e) => deriveSlaStatus(e) === "warning")
              ? "warning"
              : "ok";
          const lastEntry = entries[entries.length - 1];
          const totalSla = lastEntry.sla_elapsed_hours;

          return (
            <Card key={ticketId} className="card-hover-yellow">
              <button
                type="button"
                className="w-full text-left"
                onClick={() => setExpandedTicket(isExpanded ? null : ticketId)}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent shrink-0">
                    <FileText className="h-4 w-4 text-vp-yellow-dark" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-sm font-semibold text-foreground">
                        {ticketId}
                      </span>
                      <Badge variant="outline" className="text-[10px]">
                        {lastEntry.module_stage}
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">
                        {entries.length} {entries.length === 1 ? "ação" : "ações"}
                      </Badge>
                      {slaBadge(worstSla)}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <p className="text-xs text-muted-foreground truncate">
                        {lastEntry.action_description}
                      </p>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1 shrink-0">
                        <Hourglass className="h-3 w-3" />
                        SLA: {formatSla(totalSla)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </button>

              {isExpanded && (
                <div className="border-t border-border px-4 pb-4">
                  <div className="relative ml-6 mt-4 space-y-0">
                    {/* Vertical timeline line */}
                    <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />

                    {entries.map((entry, idx) => {
                      const status = deriveSlaStatus(entry);
                      return (
                        <div key={entry.id} className="relative pl-8 pb-5 last:pb-0">
                          {/* Timeline dot */}
                          <div
                            className={`absolute left-0 top-1.5 h-[15px] w-[15px] rounded-full border-2 ${
                              status === "breach"
                                ? "border-red-400 bg-red-100"
                                : status === "warning"
                                  ? "border-amber-400 bg-amber-100"
                                  : "border-emerald-400 bg-emerald-100"
                            }`}
                          />

                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="outline" className="text-[10px]">
                                {entry.module_stage}
                              </Badge>
                              <span className="text-sm font-semibold text-foreground">
                                {entry.action_description}
                              </span>
                              {slaBadge(status)}
                            </div>

                            {/* Metadata context */}
                            {entry.metadata && (
                              <div className="flex flex-wrap gap-2 mt-1">
                                {entry.metadata.supplier_name && (
                                  <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                                    Fornecedor: {entry.metadata.supplier_name}
                                  </span>
                                )}
                                {entry.metadata.from_status && entry.metadata.to_status && (
                                  <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                                    {entry.metadata.from_status} → {entry.metadata.to_status}
                                  </span>
                                )}
                                {entry.metadata.approval_level && (
                                  <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                                    Nível {entry.metadata.approval_level}
                                  </span>
                                )}
                                {entry.metadata.exception_reason && (
                                  <span className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded">
                                    {entry.metadata.exception_reason}
                                  </span>
                                )}
                                {entry.metadata.new_assignee && (
                                  <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                                    → {entry.metadata.new_assignee}
                                  </span>
                                )}
                              </div>
                            )}

                            <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground flex-wrap">
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {entry.user_name} ({entry.user_role})
                              </span>
                              <span className="flex items-center gap-1">
                                <Building2 className="h-3 w-3" />
                                {entry.user_department}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {entry.created_at}
                              </span>
                              <span className="flex items-center gap-1">
                                <Hourglass className="h-3 w-3" />
                                SLA: {formatSla(entry.sla_elapsed_hours)}
                              </span>
                            </div>
                          </div>

                          {/* Flow arrow between entries */}
                          {idx < entries.length - 1 && (
                            <div className="flex items-center gap-1 mt-2 ml-0 text-[10px] text-muted-foreground">
                              <ArrowRight className="h-3 w-3" />
                              <span>Próxima etapa</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}