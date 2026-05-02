import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { useAuth } from "@/features/auth/auth-context";
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
import { OctagonAlert, Bell, Lightbulb, FileDown, FileJson, FileSpreadsheet, Loader2, ExternalLink, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

/* ── Export types ── */

type ExportFormat = "PDF" | "CSV" | "JSON";

interface ExportResponse {
  download_url: string;
  expires_at: string;
  file_size_bytes: number;
  generated_at: string;
}

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

/* ── Active Ticket (list API response) ── */

interface ActiveTicket {
  ticket_id: string;
  current_stage: string;
  created_at: string;
  hours_elapsed: number;
  sla_target_hours: number;
  sla_percentage_used: number;
  sla_status: "on_track" | "at_risk" | "breached";
  stage_hours_elapsed: number;
  stage_target_hours: number;
  is_stage_bottleneck: boolean;
  responsible: string;
  responsible_role: string;
}

type SlaStatus = "ok" | "warning" | "breach";

/* ── Ticket Detail types (API response schema) ── */

interface StageSummary {
  stage: string;
  status: "COMPLETED" | "IN_PROGRESS" | "PENDING";
  started_at: string;
  completed_at?: string;
  duration_hours: number;
  actor: string;
  actor_role: string;
}

interface TicketDetailResponse {
  ticket_id: string;
  module: string;
  status: string;
  lifecycle: {
    created_at: string;
    completed_at?: string;
    total_duration_hours: number;
    sla_target_hours: number;
    sla_formatted: string;
    is_within_sla: boolean;
    sla_percentage_used: number;
  };
  current_stage: string;
  stages_summary: StageSummary[];
  logs: AuditLogEntry[];
  bottleneck_analysis: BottleneckAnalysis | null;
}

/* ────────────────────────────────────────────────
 *  Mock data — NO financial data (§2.3)
 * ──────────────────────────────────────────────── */

const ticketDetails: Record<string, TicketDetailResponse> = {
  "M1-000065": {
    ticket_id: "M1-000065",
    module: "M1",
    status: "EM_APROVAÇÃO",
    lifecycle: {
      created_at: "28/04/2026 09:15",
      total_duration_hours: 22.75,
      sla_target_hours: 720,
      sla_formatted: "22h",
      is_within_sla: true,
      sla_percentage_used: 3.2,
    },
    current_stage: "V3_APROVACAO",
    stages_summary: [
      { stage: "V1_REQUISICAO", status: "COMPLETED", started_at: "28/04 09:15", completed_at: "28/04 09:15", duration_hours: 0, actor: "Carlos Silva", actor_role: "Requisitante" },
      { stage: "V2_COTACAO", status: "COMPLETED", started_at: "28/04 09:15", completed_at: "28/04 11:30", duration_hours: 2.25, actor: "Ana Oliveira", actor_role: "Cotador" },
      { stage: "V3_APROVACAO", status: "IN_PROGRESS", started_at: "29/04 08:00", duration_hours: 42, actor: "Diretor Marcos", actor_role: "Aprovador" },
      { stage: "V4_COMPRA", status: "PENDING", started_at: "", duration_hours: 0, actor: "—", actor_role: "Comprador" },
    ],
    logs: [],
    bottleneck_analysis: null,
  },
  "M4-000031": {
    ticket_id: "M4-000031",
    module: "M4",
    status: "EM_COTAÇÃO",
    lifecycle: {
      created_at: "25/04/2026 14:22",
      total_duration_hours: 68,
      sla_target_hours: 336,
      sla_formatted: "2 dias 20h",
      is_within_sla: false,
      sla_percentage_used: 20.2,
    },
    current_stage: "V2_COTACAO",
    stages_summary: [
      { stage: "V1_REQUISICAO", status: "COMPLETED", started_at: "25/04 14:22", completed_at: "25/04 14:22", duration_hours: 0, actor: "Roberto Mendes", actor_role: "Requisitante" },
      { stage: "V2_COTACAO", status: "IN_PROGRESS", started_at: "27/04 10:00", duration_hours: 68, actor: "Ana Oliveira", actor_role: "Cotador" },
      { stage: "V3_APROVACAO", status: "PENDING", started_at: "", duration_hours: 0, actor: "—", actor_role: "Aprovador" },
      { stage: "V4_COMPRA", status: "PENDING", started_at: "", duration_hours: 0, actor: "—", actor_role: "Comprador" },
    ],
    logs: [],
    bottleneck_analysis: {
      ticket_id: "M4-000031",
      current_stage: "V2",
      stuck_since: "27/04/2026 10:00",
      hours_in_current_stage: 68,
      target_hours_for_stage: 24,
      is_bottleneck: true,
      responsible_user: "Ana Oliveira",
      responsible_role: "Cotador",
      blocking_reason: "Aguardando diagnóstico técnico",
      recommendation: "Solicitar laudo técnico urgente ao requisitante",
      escalation_required: true,
    },
  },
  "M2-000042": {
    ticket_id: "M2-000042",
    module: "M2",
    status: "APROVADO",
    lifecycle: {
      created_at: "27/04/2026 07:45",
      total_duration_hours: 8.75,
      sla_target_hours: 336,
      sla_formatted: "8h",
      is_within_sla: true,
      sla_percentage_used: 2.6,
    },
    current_stage: "V3_APROVACAO",
    stages_summary: [
      { stage: "V1_REQUISICAO", status: "COMPLETED", started_at: "27/04 07:45", completed_at: "27/04 07:45", duration_hours: 0, actor: "Fernanda Costa", actor_role: "Requisitante" },
      { stage: "V3_APROVACAO", status: "COMPLETED", started_at: "27/04 07:45", completed_at: "27/04 16:30", duration_hours: 8.75, actor: "Diretor Marcos", actor_role: "Aprovador" },
    ],
    logs: [],
    bottleneck_analysis: null,
  },
  "M5-000028": {
    ticket_id: "M5-000028",
    module: "M5",
    status: "FINALIZADO",
    lifecycle: {
      created_at: "24/04/2026 11:15",
      completed_at: "30/04/2026 09:00",
      total_duration_hours: 178,
      sla_target_hours: 720,
      sla_formatted: "7 dias 10h",
      is_within_sla: true,
      sla_percentage_used: 24.7,
    },
    current_stage: "V5_RECEBIMENTO",
    stages_summary: [
      { stage: "V1_REQUISICAO", status: "COMPLETED", started_at: "24/04 11:15", completed_at: "24/04 11:15", duration_hours: 0, actor: "Paulo Ferreira", actor_role: "Comprador" },
      { stage: "V4_COMPRA", status: "COMPLETED", started_at: "24/04 11:15", completed_at: "24/04 11:15", duration_hours: 36, actor: "Paulo Ferreira", actor_role: "Comprador" },
      { stage: "V5_RECEBIMENTO", status: "COMPLETED", started_at: "30/04 09:00", completed_at: "30/04 09:00", duration_hours: 142, actor: "José Santos", actor_role: "Almoxarife" },
    ],
    logs: [],
    bottleneck_analysis: null,
  },
  "M3-000018": {
    ticket_id: "M3-000018",
    module: "M3",
    status: "EM_COTAÇÃO",
    lifecycle: {
      created_at: "28/04/2026 10:00",
      total_duration_hours: 30,
      sla_target_hours: 720,
      sla_formatted: "1 dia 6h",
      is_within_sla: true,
      sla_percentage_used: 4.2,
    },
    current_stage: "V2_COTACAO",
    stages_summary: [
      { stage: "V1_REQUISICAO", status: "COMPLETED", started_at: "28/04 10:00", completed_at: "28/04 10:00", duration_hours: 0, actor: "Ana Oliveira", actor_role: "Cotador" },
      { stage: "V2_COTACAO", status: "IN_PROGRESS", started_at: "28/04 17:00", duration_hours: 30, actor: "Ana Oliveira", actor_role: "Cotador" },
    ],
    logs: [],
    bottleneck_analysis: null,
  },
};

interface BottleneckAnalysis {
  ticket_id: string;
  current_stage: string;
  stuck_since: string;
  hours_in_current_stage: number;
  target_hours_for_stage: number;
  is_bottleneck: boolean;
  responsible_user: string;
  responsible_role: string;
  blocking_reason?: string;
  recommendation: string;
  escalation_required: boolean;
}

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
const bottlenecks: BottleneckAnalysis[] = [
  {
    ticket_id: "M3-000018",
    current_stage: "V3",
    stuck_since: "28/04/2026 10:00",
    hours_in_current_stage: 96,
    target_hours_for_stage: 72,
    is_bottleneck: true,
    responsible_user: "Roberto Mendes",
    responsible_role: "Aprovador Nível 1",
    blocking_reason: "Aguardando aprovação gerencial",
    recommendation: "Enviar lembrete ao aprovador ou escalar para gestor",
    escalation_required: true,
  },
  {
    ticket_id: "M4-000031",
    current_stage: "V2",
    stuck_since: "27/04/2026 10:00",
    hours_in_current_stage: 68,
    target_hours_for_stage: 24,
    is_bottleneck: true,
    responsible_user: "Ana Oliveira",
    responsible_role: "Cotador",
    blocking_reason: "Aguardando diagnóstico técnico",
    recommendation: "Solicitar laudo técnico urgente ao requisitante",
    escalation_required: true,
  },
  {
    ticket_id: "M1-000065",
    current_stage: "V3",
    stuck_since: "29/04/2026 08:00",
    hours_in_current_stage: 42,
    target_hours_for_stage: 48,
    is_bottleneck: false,
    responsible_user: "Diretor Marcos",
    responsible_role: "Aprovador Nível 2",
    recommendation: "Dentro do prazo — monitorar",
    escalation_required: false,
  },
];

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

const activeTickets: ActiveTicket[] = [
  {
    ticket_id: "M1-000072",
    current_stage: "V3",
    created_at: "20/04/2026",
    hours_elapsed: 264,
    sla_target_hours: 720,
    sla_percentage_used: 36.7,
    sla_status: "at_risk",
    stage_hours_elapsed: 96,
    stage_target_hours: 72,
    is_stage_bottleneck: true,
    responsible: "Roberto Mendes",
    responsible_role: "Aprovador",
  },
  {
    ticket_id: "M4-000031",
    current_stage: "V2",
    created_at: "25/04/2026",
    hours_elapsed: 68,
    sla_target_hours: 336,
    sla_percentage_used: 20.2,
    sla_status: "breached",
    stage_hours_elapsed: 68,
    stage_target_hours: 24,
    is_stage_bottleneck: true,
    responsible: "Ana Oliveira",
    responsible_role: "Cotador",
  },
  {
    ticket_id: "M1-000065",
    current_stage: "V3",
    created_at: "28/04/2026",
    hours_elapsed: 42,
    sla_target_hours: 720,
    sla_percentage_used: 5.8,
    sla_status: "on_track",
    stage_hours_elapsed: 42,
    stage_target_hours: 48,
    is_stage_bottleneck: false,
    responsible: "Diretor Marcos",
    responsible_role: "Aprovador",
  },
  {
    ticket_id: "M3-000018",
    current_stage: "V2",
    created_at: "28/04/2026",
    hours_elapsed: 30,
    sla_target_hours: 720,
    sla_percentage_used: 4.2,
    sla_status: "on_track",
    stage_hours_elapsed: 30,
    stage_target_hours: 48,
    is_stage_bottleneck: false,
    responsible: "Ana Oliveira",
    responsible_role: "Cotador",
  },
  {
    ticket_id: "M2-000042",
    current_stage: "V4",
    created_at: "27/04/2026",
    hours_elapsed: 12,
    sla_target_hours: 336,
    sla_percentage_used: 3.6,
    sla_status: "on_track",
    stage_hours_elapsed: 3,
    stage_target_hours: 24,
    is_stage_bottleneck: false,
    responsible: "Paulo Ferreira",
    responsible_role: "Comprador",
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

function mapActionToStage(action: string): string {
  if (action.startsWith("QUOTATION")) return "V2";
  if (action.startsWith("WINNER") || action.startsWith("APPROVAL")) return "V3";
  if (action.startsWith("PURCHASE")) return "V4";
  if (action.startsWith("RECEIPT")) return "V5";
  return "V1";
}

function mapActionToDescription(action: string, details: Record<string, unknown>): string {
  const map: Record<string, string> = {
    QUOTATION_STARTED: "Cotação iniciada",
    WINNER_SELECTED: "Fornecedor vencedor selecionado",
    APPROVAL_REQUESTED: "Enviado para aprovação",
    APPROVED: "Aprovado",
    REJECTED: "Rejeitado",
    PURCHASE_COMPLETED: "Compra concluída",
    RECEIPT_CONFIRMED: "Recebimento confirmado",
  };
  const base = map[action] ?? action.replace(/_/g, " ").toLowerCase();
  const suppliersCount = typeof details.suppliers_count === "number" ? ` — ${details.suppliers_count} fornecedores` : "";
  return base + suppliersCount;
}

function LogsPage() {
  const { session } = useAuth();
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("Todos");
  const [stageFilter, setStageFilter] = useState("Todos");
  const [slaFilter, setSlaFilter] = useState("Todos");
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [activeStatusFilter, setActiveStatusFilter] = useState<"all" | "on_track" | "at_risk" | "breached">("all");
  const [auditEntriesLive, setAuditEntriesLive] = useState<AuditLogEntry[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const detail = selectedTicket ? ticketDetails[selectedTicket] : null;

  useEffect(() => {
    if (!session) return;
    (async () => {
      setLogsLoading(true);
      const { data } = await supabaseBrowser
        .from("audit_logs")
        .select("id,ticket_number,action,actor_name,details,created_at")
        .order("created_at", { ascending: false })
        .limit(200);
      if (data) {
        setAuditEntriesLive(
          data.map((row) => {
            const tn = row.ticket_number ?? "??-000000";
            const mod = tn.slice(0, 2);
            const det = (row.details ?? {}) as Record<string, unknown>;
            return {
              id: row.id,
              ticket_id: tn,
              module: mod,
              action_type: row.action,
              action_description: mapActionToDescription(row.action, det),
              module_stage: mapActionToStage(row.action),
              user_name: row.actor_name ?? "Sistema",
              user_role: "—",
              user_department: "—",
              created_at: new Date(row.created_at).toLocaleString("pt-BR"),
              sla_elapsed_hours: 0,
              is_sla_breach: false,
            } satisfies AuditLogEntry;
          }),
        );
      }
      setLogsLoading(false);
    })();
  }, [session]);

  // Usa dados reais quando disponíveis, fallback para mock durante carregamento
  const auditEntries = logsLoading ? [] : auditEntriesLive;
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportTicketId, setExportTicketId] = useState<string | null>(null);
  const [exportFormat, setExportFormat] = useState<ExportFormat>("PDF");
  const [exportIncludeMetadata, setExportIncludeMetadata] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportResult, setExportResult] = useState<ExportResponse | null>(null);

  const handleOpenExport = (ticketId: string) => {
    setExportTicketId(ticketId);
    setExportFormat("PDF");
    setExportIncludeMetadata(true);
    setExportResult(null);
    setExportDialogOpen(true);
  };

  const handleExport = async () => {
    if (!exportTicketId) return;
    setExportLoading(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1500));
    const now = new Date();
    const expires = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const ext = exportFormat === "PDF" ? "pdf" : exportFormat === "CSV" ? "csv" : "json";
    setExportResult({
      download_url: `https://storage.vprequisicoes.com/exports/audit-${exportTicketId}.${ext}`,
      expires_at: expires.toISOString(),
      file_size_bytes: Math.floor(Math.random() * 300000) + 50000,
      generated_at: now.toISOString(),
    });
    setExportLoading(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const filteredActive = activeTickets.filter((t) => {
    if (activeStatusFilter !== "all" && t.sla_status !== activeStatusFilter) return false;
    if (moduleFilter !== "Todos" && !t.ticket_id.startsWith(moduleFilter)) return false;
    return true;
  });

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
      {/* Bottleneck Analysis */}
      {bottlenecks.filter((b) => b.is_bottleneck).length > 0 && (
        <Card className="border-red-200 bg-red-50/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <OctagonAlert className="h-4 w-4 text-red-500" />
              <h2 className="text-sm font-semibold text-foreground">
                Gargalos Detectados
              </h2>
              <Badge variant="outline" className="text-[10px] border-red-200 text-red-600">
                {bottlenecks.filter((b) => b.is_bottleneck).length} ticket{bottlenecks.filter((b) => b.is_bottleneck).length > 1 ? "s" : ""}
              </Badge>
            </div>
            <div className="space-y-3">
              {bottlenecks
                .filter((b) => b.is_bottleneck)
                .map((b) => {
                  const overPercent = Math.round(
                    ((b.hours_in_current_stage - b.target_hours_for_stage) /
                      b.target_hours_for_stage) *
                      100,
                  );
                  return (
                    <div
                      key={b.ticket_id}
                      className="rounded-lg border border-red-200 bg-white p-3 space-y-2"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-semibold text-foreground">
                            {b.ticket_id}
                          </span>
                          <Badge variant="outline" className="text-[10px]">
                            {b.current_stage}
                          </Badge>
                          <span className="text-[10px] text-red-600 font-semibold">
                            +{overPercent}% acima da meta
                          </span>
                        </div>
                        {b.escalation_required && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 border border-red-300 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                            <Bell className="h-3 w-3" />
                            Escalonamento necessário
                          </span>
                        )}
                      </div>

                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div
                          className="bg-red-500 h-1.5 rounded-full"
                          style={{
                            width: `${Math.min((b.hours_in_current_stage / b.target_hours_for_stage) * 100, 100)}%`,
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>{formatSla(b.hours_in_current_stage)} na etapa</span>
                        <span>Meta: {formatSla(b.target_hours_for_stage)}</span>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {b.responsible_user} ({b.responsible_role})
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Desde {b.stuck_since}
                        </span>
                      </div>

                      {b.blocking_reason && (
                        <p className="text-[11px] bg-red-50 text-red-600 px-2 py-1 rounded">
                          {b.blocking_reason}
                        </p>
                      )}

                      <div className="flex items-start gap-1.5 text-[11px] text-amber-700 bg-amber-50 px-2 py-1 rounded">
                        <Lightbulb className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                        <span>{b.recommendation}</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}

      {/* Active Tickets Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Hourglass className="h-4 w-4 text-vp-yellow-dark" />
            Tickets Ativos
            <Badge variant="outline" className="text-[10px]">
              {filteredActive.length}
            </Badge>
          </h2>
          <div className="flex gap-1">
            {(
              [
                { key: "all", label: "Todos" },
                { key: "on_track", label: "No prazo" },
                { key: "at_risk", label: "Em risco" },
                { key: "breached", label: "Excedido" },
              ] as const
            ).map((opt) => (
              <Button
                key={opt.key}
                variant={activeStatusFilter === opt.key ? "default" : "outline"}
                size="sm"
                className="text-[10px] h-7 px-2"
                onClick={() => setActiveStatusFilter(opt.key)}
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </div>

        {filteredActive.length > 0 ? (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 text-[10px] font-medium text-muted-foreground uppercase">Ticket</th>
                      <th className="text-left p-3 text-[10px] font-medium text-muted-foreground uppercase">Etapa</th>
                      <th className="text-left p-3 text-[10px] font-medium text-muted-foreground uppercase">SLA Total</th>
                      <th className="text-left p-3 text-[10px] font-medium text-muted-foreground uppercase">Etapa Atual</th>
                      <th className="text-left p-3 text-[10px] font-medium text-muted-foreground uppercase">Responsável</th>
                      <th className="text-left p-3 text-[10px] font-medium text-muted-foreground uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredActive.map((t) => (
                      <tr
                        key={t.ticket_id}
                        className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors cursor-pointer"
                        onClick={() => setSelectedTicket(t.ticket_id)}
                      >
                        <td className="p-3">
                          <span className="font-mono text-xs font-semibold text-foreground">{t.ticket_id}</span>
                          <p className="text-[10px] text-muted-foreground">{t.created_at}</p>
                        </td>
                        <td className="p-3">
                          <Badge variant="outline" className="text-[10px]">{t.current_stage}</Badge>
                        </td>
                        <td className="p-3">
                          <div className="space-y-1 min-w-[120px]">
                            <div className="flex justify-between text-[10px] text-muted-foreground">
                              <span>{formatSla(t.hours_elapsed)}</span>
                              <span>{t.sla_percentage_used.toFixed(0)}%</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full ${
                                  t.sla_status === "breached"
                                    ? "bg-red-500"
                                    : t.sla_status === "at_risk"
                                      ? "bg-amber-500"
                                      : "bg-emerald-500"
                                }`}
                                style={{ width: `${Math.min(t.sla_percentage_used, 100)}%` }}
                              />
                            </div>
                            <p className="text-[10px] text-muted-foreground">Meta: {formatSla(t.sla_target_hours)}</p>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="space-y-1 min-w-[100px]">
                            <div className="flex justify-between text-[10px] text-muted-foreground">
                              <span>{formatSla(t.stage_hours_elapsed)}</span>
                              <span>{formatSla(t.stage_target_hours)}</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full ${
                                  t.is_stage_bottleneck ? "bg-red-500" : "bg-emerald-500"
                                }`}
                                style={{
                                  width: `${Math.min((t.stage_hours_elapsed / t.stage_target_hours) * 100, 100)}%`,
                                }}
                              />
                            </div>
                            {t.is_stage_bottleneck && (
                              <span className="text-[10px] text-red-500 font-semibold">● Gargalo</span>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <p className="text-xs text-foreground">{t.responsible}</p>
                          <p className="text-[10px] text-muted-foreground">{t.responsible_role}</p>
                        </td>
                        <td className="p-3">
                          <span
                            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                              t.sla_status === "breached"
                                ? "bg-red-100 text-red-700 border-red-200"
                                : t.sla_status === "at_risk"
                                  ? "bg-amber-100 text-amber-700 border-amber-200"
                                  : "bg-emerald-100 text-emerald-700 border-emerald-200"
                            }`}
                          >
                            {t.sla_status === "breached"
                              ? "Excedido"
                              : t.sla_status === "at_risk"
                                ? "Em risco"
                                : "No prazo"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-sm text-muted-foreground">Nenhum ticket ativo com esse filtro.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Filters & Timeline */}
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
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => {
              // Export all filtered — use first ticket or generic
              const firstTicket = ticketIds[0] ?? "TODOS";
              handleOpenExport(firstTicket);
            }}>
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
                  {/* Ticket detail button */}
                  <div className="flex justify-end mt-3 mb-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs gap-1.5"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTicket(ticketId);
                      }}
                    >
                      <FileText className="h-3.5 w-3.5" />
                      Ver detalhes do ticket
                    </Button>
                  </div>
                  <div className="relative ml-6 mt-2 space-y-0">
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

      {/* Ticket Detail Sheet */}
      <Sheet open={!!selectedTicket} onOpenChange={(open) => !open && setSelectedTicket(null)}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          {detail && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <span className="font-mono">{detail.ticket_id}</span>
                  <Badge variant="outline" className="text-[10px]">
                    {detail.module}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${
                      detail.status === "FINALIZADO"
                        ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                        : "bg-blue-100 text-blue-700 border-blue-200"
                    }`}
                  >
                    {detail.status.replace(/_/g, " ")}
                  </Badge>
                </SheetTitle>
              </SheetHeader>

              <div className="space-y-5 mt-6">
                {/* Export Button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2"
                  onClick={() => handleOpenExport(detail.ticket_id)}
                >
                  <FileDown className="h-4 w-4" />
                  Exportar Histórico do Ticket
                </Button>

                {/* Lifecycle Summary */}
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Ciclo de Vida
                  </h3>
                  <Card>
                    <CardContent className="p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-[10px] text-muted-foreground">Criado em</p>
                          <p className="text-sm font-medium text-foreground">{detail.lifecycle.created_at}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground">
                            {detail.lifecycle.completed_at ? "Concluído em" : "Em andamento"}
                          </p>
                          <p className="text-sm font-medium text-foreground">
                            {detail.lifecycle.completed_at ?? "—"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground">Duração Total</p>
                          <p className="text-sm font-bold text-foreground">
                            {detail.lifecycle.sla_formatted}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground">Meta SLA</p>
                          <p className="text-sm font-medium text-foreground">
                            {formatSla(detail.lifecycle.sla_target_hours)}
                          </p>
                        </div>
                      </div>

                      {/* SLA Progress */}
                      <div>
                        <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                          <span>{detail.lifecycle.sla_percentage_used.toFixed(1)}% utilizado</span>
                          <span className={detail.lifecycle.is_within_sla ? "text-emerald-600" : "text-red-500"}>
                            {detail.lifecycle.is_within_sla ? "✓ Dentro do SLA" : "✗ SLA Excedido"}
                          </span>
                        </div>
                        <Progress
                          value={Math.min(detail.lifecycle.sla_percentage_used, 100)}
                          className="h-2"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Stages Summary */}
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Etapas
                  </h3>
                  <div className="space-y-2">
                    {detail.stages_summary.map((stage, idx) => {
                      const stageLabel = stage.stage.replace("_", " · ");
                      return (
                        <div
                          key={stage.stage}
                          className={`rounded-lg border p-3 ${
                            stage.status === "IN_PROGRESS"
                              ? "border-blue-200 bg-blue-50/50"
                              : stage.status === "COMPLETED"
                                ? "border-border bg-card"
                                : "border-dashed border-muted bg-muted/20"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div
                                className={`h-2.5 w-2.5 rounded-full ${
                                  stage.status === "COMPLETED"
                                    ? "bg-emerald-500"
                                    : stage.status === "IN_PROGRESS"
                                      ? "bg-blue-500 animate-pulse"
                                      : "bg-muted-foreground/30"
                                }`}
                              />
                              <span className="text-xs font-semibold text-foreground">
                                {stageLabel}
                              </span>
                            </div>
                            <Badge
                              variant="outline"
                              className={`text-[10px] ${
                                stage.status === "COMPLETED"
                                  ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                                  : stage.status === "IN_PROGRESS"
                                    ? "bg-blue-100 text-blue-700 border-blue-200"
                                    : "text-muted-foreground"
                              }`}
                            >
                              {stage.status === "COMPLETED"
                                ? "Concluído"
                                : stage.status === "IN_PROGRESS"
                                  ? "Em andamento"
                                  : "Pendente"}
                            </Badge>
                          </div>
                          {stage.status !== "PENDING" && (
                            <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {stage.actor} ({stage.actor_role})
                              </span>
                              {stage.duration_hours > 0 && (
                                <span className="flex items-center gap-1">
                                  <Hourglass className="h-3 w-3" />
                                  {formatSla(stage.duration_hours)}
                                </span>
                              )}
                              {stage.started_at && (
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {stage.started_at}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Bottleneck */}
                {detail.bottleneck_analysis && detail.bottleneck_analysis.is_bottleneck && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-semibold text-red-500 uppercase tracking-wider flex items-center gap-1.5">
                      <OctagonAlert className="h-3.5 w-3.5" />
                      Gargalo
                    </h3>
                    <div className="rounded-lg border border-red-200 bg-red-50/30 p-3 space-y-2">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-semibold text-foreground">
                          Parado em {detail.bottleneck_analysis.current_stage}
                        </span>
                        <span className="text-red-600 font-semibold text-[10px]">
                          {formatSla(detail.bottleneck_analysis.hours_in_current_stage)} / meta {formatSla(detail.bottleneck_analysis.target_hours_for_stage)}
                        </span>
                      </div>
                      {detail.bottleneck_analysis.blocking_reason && (
                        <p className="text-[11px] text-red-600">
                          {detail.bottleneck_analysis.blocking_reason}
                        </p>
                      )}
                      <div className="flex items-start gap-1.5 text-[11px] text-amber-700 bg-amber-50 px-2 py-1 rounded">
                        <Lightbulb className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                        <span>{detail.bottleneck_analysis.recommendation}</span>
                      </div>
                      {detail.bottleneck_analysis.escalation_required && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 border border-red-300 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                          <Bell className="h-3 w-3" />
                          Escalonamento necessário
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Audit Logs for this ticket */}
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Histórico de Ações
                  </h3>
                  <div className="relative space-y-0">
                    <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />
                    {(auditEntries.filter((e) => e.ticket_id === detail.ticket_id)).map((entry, idx, arr) => {
                      const status = deriveSlaStatus(entry);
                      return (
                        <div key={entry.id} className="relative pl-7 pb-4 last:pb-0">
                          <div
                            className={`absolute left-0 top-1 h-[14px] w-[14px] rounded-full border-2 ${
                              status === "breach"
                                ? "border-red-400 bg-red-100"
                                : status === "warning"
                                  ? "border-amber-400 bg-amber-100"
                                  : "border-emerald-400 bg-emerald-100"
                            }`}
                          />
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="outline" className="text-[10px]">
                                {entry.module_stage}
                              </Badge>
                              <span className="text-xs font-semibold text-foreground">
                                {entry.action_description}
                              </span>
                            </div>
                            {entry.metadata && (
                              <div className="flex flex-wrap gap-1.5 mt-1">
                                {entry.metadata.from_status && entry.metadata.to_status && (
                                  <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                                    {entry.metadata.from_status} → {entry.metadata.to_status}
                                  </span>
                                )}
                                {entry.metadata.supplier_name && (
                                  <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                                    {entry.metadata.supplier_name}
                                  </span>
                                )}
                              </div>
                            )}
                            <div className="flex items-center gap-2.5 mt-1 text-[10px] text-muted-foreground">
                              <span>{entry.user_name}</span>
                              <span>{entry.created_at}</span>
                              <span>SLA: {formatSla(entry.sla_elapsed_hours)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileDown className="h-5 w-5" />
              Exportar Auditoria
            </DialogTitle>
            <DialogDescription>
              Ticket: <span className="font-mono font-semibold">{exportTicketId}</span>
            </DialogDescription>
          </DialogHeader>

          {!exportResult ? (
            <div className="space-y-5 mt-2">
              {/* Format Selection */}
              <div className="space-y-3">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Formato
                </Label>
                <RadioGroup
                  value={exportFormat}
                  onValueChange={(v) => setExportFormat(v as ExportFormat)}
                  className="grid grid-cols-3 gap-3"
                >
                  {[
                    { value: "PDF" as const, icon: FileText, label: "PDF" },
                    { value: "CSV" as const, icon: FileSpreadsheet, label: "CSV" },
                    { value: "JSON" as const, icon: FileJson, label: "JSON" },
                  ].map((opt) => (
                    <Label
                      key={opt.value}
                      htmlFor={`fmt-${opt.value}`}
                      className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 cursor-pointer transition-all hover:border-[var(--vp-yellow)] ${
                        exportFormat === opt.value
                          ? "border-[var(--vp-yellow)] bg-accent"
                          : "border-border"
                      }`}
                    >
                      <RadioGroupItem value={opt.value} id={`fmt-${opt.value}`} className="sr-only" />
                      <opt.icon className="h-6 w-6 text-muted-foreground" />
                      <span className="text-sm font-medium">{opt.label}</span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>

              {/* Options */}
              <div className="flex items-center gap-2">
                <Checkbox
                  id="include-metadata"
                  checked={exportIncludeMetadata}
                  onCheckedChange={(v) => setExportIncludeMetadata(!!v)}
                />
                <Label htmlFor="include-metadata" className="text-sm cursor-pointer">
                  Incluir metadados (transições, responsáveis, motivos)
                </Label>
              </div>

              <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
                <p>🔒 Nenhum dado financeiro será incluído na exportação.</p>
                <p className="mt-1">📋 Idioma: Português (pt-BR)</p>
              </div>

              <Button
                className="w-full gap-2"
                onClick={handleExport}
                disabled={exportLoading}
              >
                {exportLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Gerando arquivo...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Gerar Exportação
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4 mt-2">
              {/* Success State */}
              <div className="flex flex-col items-center gap-3 py-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                  <Check className="h-6 w-6 text-emerald-600" />
                </div>
                <p className="text-sm font-medium text-foreground">Arquivo gerado com sucesso!</p>
              </div>

              <Card>
                <CardContent className="p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Formato</span>
                    <span className="font-medium">{exportFormat}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tamanho</span>
                    <span className="font-medium">{formatFileSize(exportResult.file_size_bytes)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Gerado em</span>
                    <span className="font-medium">
                      {new Date(exportResult.generated_at).toLocaleString("pt-BR")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Expira em</span>
                    <span className="font-medium">
                      {new Date(exportResult.expires_at).toLocaleString("pt-BR")}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-2">
                <Button className="flex-1 gap-2" asChild>
                  <a href={exportResult.download_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                    Baixar Arquivo
                  </a>
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setExportResult(null)}
                >
                  Nova Exportação
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}