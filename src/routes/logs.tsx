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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      { name: "description", content: "Trilha de auditoria e métricas SLA do sistema de requisições" },
    ],
  }),
  component: LogsPage,
});

/* ── Mock Data ── */

interface AuditEntry {
  id: string;
  ticketId: string;
  module: string;
  action: string;
  actor: string;
  role: string;
  timestamp: string;
  detail: string;
  slaStatus: "ok" | "warning" | "breach";
}

const slaMetrics = [
  { label: "Tempo Médio V1→V2", value: "2.4h", target: "4h", status: "ok" as const },
  { label: "Tempo Médio V2→V3", value: "18h", target: "24h", status: "ok" as const },
  { label: "Tempo Médio V3→V4", value: "5.2h", target: "4h", status: "warning" as const },
  { label: "Tempo Médio V4→V5", value: "72h", target: "48h", status: "breach" as const },
];

const auditEntries: AuditEntry[] = [
  {
    id: "LOG-001",
    ticketId: "M1-000065",
    module: "M1",
    action: "Requisição Criada",
    actor: "Carlos Silva",
    role: "Requisitante",
    timestamp: "28/04/2026 09:15",
    detail: "Parafusos Inox 304 M10x50mm — Qtd: 500 un",
    slaStatus: "ok",
  },
  {
    id: "LOG-002",
    ticketId: "M1-000065",
    module: "V2",
    action: "Cotação Iniciada",
    actor: "Ana Oliveira",
    role: "Cotador",
    timestamp: "28/04/2026 11:30",
    detail: "3 fornecedores selecionados para cotação",
    slaStatus: "ok",
  },
  {
    id: "LOG-003",
    ticketId: "M1-000065",
    module: "V3",
    action: "Enviado para Aprovação",
    actor: "Ana Oliveira",
    role: "Cotador",
    timestamp: "29/04/2026 08:00",
    detail: "Melhor preço: Fornecedor ABC — R$ 1.250,00",
    slaStatus: "ok",
  },
  {
    id: "LOG-004",
    ticketId: "M4-000031",
    module: "M4",
    action: "Requisição Criada",
    actor: "Roberto Mendes",
    role: "Requisitante",
    timestamp: "25/04/2026 14:22",
    detail: "Prensa Hidráulica — Vazamento — Máquina Parada",
    slaStatus: "breach",
  },
  {
    id: "LOG-005",
    ticketId: "M4-000031",
    module: "V2",
    action: "Cotação Iniciada",
    actor: "Ana Oliveira",
    role: "Cotador",
    timestamp: "27/04/2026 10:00",
    detail: "Atraso de 44h — SLA excedido (meta: 4h para urgente)",
    slaStatus: "breach",
  },
  {
    id: "LOG-006",
    ticketId: "M2-000042",
    module: "M2",
    action: "Requisição Criada",
    actor: "Fernanda Costa",
    role: "Requisitante",
    timestamp: "27/04/2026 07:45",
    detail: "Viagem SP — Cliente ABC — 2 passagens aéreas",
    slaStatus: "ok",
  },
  {
    id: "LOG-007",
    ticketId: "M2-000042",
    module: "V3",
    action: "Aprovado",
    actor: "Diretor Marcos",
    role: "Aprovador",
    timestamp: "27/04/2026 16:30",
    detail: "Aprovado sem ressalvas",
    slaStatus: "ok",
  },
  {
    id: "LOG-008",
    ticketId: "M5-000028",
    module: "V4",
    action: "Pedido de Compra Emitido",
    actor: "Paulo Ferreira",
    role: "Comprador",
    timestamp: "24/04/2026 11:15",
    detail: "PC Omie #45210 — Frete Chapas Aço SP→CWB",
    slaStatus: "warning",
  },
  {
    id: "LOG-009",
    ticketId: "M5-000028",
    module: "V5",
    action: "Material Recebido",
    actor: "José Santos",
    role: "Almoxarife",
    timestamp: "30/04/2026 09:00",
    detail: "Recebido em ordem — 12 chapas conferidas",
    slaStatus: "ok",
  },
  {
    id: "LOG-010",
    ticketId: "M3-000018",
    module: "V2",
    action: "Cotação Recebida",
    actor: "Ana Oliveira",
    role: "Cotador",
    timestamp: "28/04/2026 17:00",
    detail: "Fornecedor XYZ — Consultoria ERP Financeiro — R$ 28.000",
    slaStatus: "warning",
  },
];

const moduleOptions = ["Todos", "M1", "M2", "M3", "M4", "M5", "M6", "V2", "V3", "V4", "V5"];
const slaOptions = ["Todos", "ok", "warning", "breach"];

/* ── Helpers ── */

function slaIcon(status: AuditEntry["slaStatus"]) {
  if (status === "ok") return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
  if (status === "warning") return <AlertTriangle className="h-4 w-4 text-amber-500" />;
  return <AlertTriangle className="h-4 w-4 text-red-500" />;
}

function slaBadge(status: AuditEntry["slaStatus"]) {
  const map = {
    ok: { label: "No prazo", cls: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    warning: { label: "Atenção", cls: "bg-amber-100 text-amber-700 border-amber-200" },
    breach: { label: "SLA Excedido", cls: "bg-red-100 text-red-700 border-red-200" },
  };
  const m = map[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${m.cls}`}>
      {slaIcon(status)}
      {m.label}
    </span>
  );
}

function metricColor(status: "ok" | "warning" | "breach") {
  if (status === "ok") return "text-emerald-600";
  if (status === "warning") return "text-amber-500";
  return "text-red-500";
}

/* ── Page Component ── */

function LogsPage() {
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("Todos");
  const [slaFilter, setSlaFilter] = useState("Todos");
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);

  const filtered = auditEntries.filter((e) => {
    if (moduleFilter !== "Todos" && e.module !== moduleFilter) return false;
    if (slaFilter !== "Todos" && e.slaStatus !== slaFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        e.ticketId.toLowerCase().includes(q) ||
        e.action.toLowerCase().includes(q) ||
        e.actor.toLowerCase().includes(q) ||
        e.detail.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Group by ticketId for timeline view
  const grouped = filtered.reduce<Record<string, AuditEntry[]>>((acc, entry) => {
    if (!acc[entry.ticketId]) acc[entry.ticketId] = [];
    acc[entry.ticketId].push(entry);
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
            Trilha imutável de ações e métricas SLA
          </p>
        </div>
      </div>

      {/* SLA Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {slaMetrics.map((m) => (
          <Card key={m.label} className="card-hover-yellow">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Timer className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">{m.label}</p>
              </div>
              <p className={`text-2xl font-bold ${metricColor(m.status)}`}>{m.value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Meta: {m.target}
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
                placeholder="Buscar por ticket, ação, ator..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={moduleFilter} onValueChange={setModuleFilter}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Módulo" />
              </SelectTrigger>
              <SelectContent>
                {moduleOptions.map((o) => (
                  <SelectItem key={o} value={o}>
                    {o === "Todos" ? "Todos Módulos" : o}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={slaFilter} onValueChange={setSlaFilter}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="SLA" />
              </SelectTrigger>
              <SelectContent>
                {slaOptions.map((o) => (
                  <SelectItem key={o} value={o}>
                    {o === "Todos" ? "Todos SLA" : o === "ok" ? "No prazo" : o === "warning" ? "Atenção" : "Excedido"}
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
          const worstSla = entries.some((e) => e.slaStatus === "breach")
            ? "breach"
            : entries.some((e) => e.slaStatus === "warning")
              ? "warning"
              : "ok";
          const lastEntry = entries[entries.length - 1];

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
                        {entries.length} {entries.length === 1 ? "ação" : "ações"}
                      </Badge>
                      {slaBadge(worstSla)}
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      Última: {lastEntry.action} — {lastEntry.timestamp}
                    </p>
                  </div>
                </CardContent>
              </button>

              {isExpanded && (
                <div className="border-t border-border px-4 pb-4">
                  <div className="relative ml-6 mt-4 space-y-0">
                    {/* Vertical timeline line */}
                    <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />

                    {entries.map((entry, idx) => (
                      <div key={entry.id} className="relative pl-8 pb-5 last:pb-0">
                        {/* Timeline dot */}
                        <div
                          className={`absolute left-0 top-1.5 h-[15px] w-[15px] rounded-full border-2 ${
                            entry.slaStatus === "breach"
                              ? "border-red-400 bg-red-100"
                              : entry.slaStatus === "warning"
                                ? "border-amber-400 bg-amber-100"
                                : "border-emerald-400 bg-emerald-100"
                          }`}
                        />

                        <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="outline" className="text-[10px]">
                                {entry.module}
                              </Badge>
                              <span className="text-sm font-semibold text-foreground">
                                {entry.action}
                              </span>
                              {slaBadge(entry.slaStatus)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {entry.detail}
                            </p>
                            <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {entry.actor} ({entry.role})
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {entry.timestamp}
                              </span>
                            </div>
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
                    ))}
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