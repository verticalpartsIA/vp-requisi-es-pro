import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Package,
  Plane,
  Wrench,
  Truck,
  Key,
  Settings,
  Target,
  Timer,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Users,
  Zap,
  RotateCcw,
} from "lucide-react";
import { Download, FileText, FileSpreadsheet, Image, GitCompareArrows, Filter, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  RadialBar,
  RadialBarChart,
  XAxis,
  YAxis,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — VPRequisições" },
      {
        name: "description",
        content: "Métricas, SLA e indicadores de desempenho do sistema de requisições",
      },
    ],
  }),
  component: AnalyticsPage,
});

/* ────────────────────────────────────────────────
 *  Mock data
 * ──────────────────────────────────────────────── */

const volumeTrendData = [
  { month: "Jun/25", M1: 980, M2: 120, M3: 85, M4: 65, M5: 42, M6: 28 },
  { month: "Jul/25", M1: 1020, M2: 135, M3: 90, M4: 70, M5: 45, M6: 30 },
  { month: "Ago/25", M1: 1050, M2: 142, M3: 88, M4: 72, M5: 48, M6: 32 },
  { month: "Set/25", M1: 1100, M2: 138, M3: 95, M4: 68, M5: 50, M6: 35 },
  { month: "Out/25", M1: 1080, M2: 145, M3: 92, M4: 75, M5: 47, M6: 33 },
  { month: "Nov/25", M1: 1150, M2: 150, M3: 98, M4: 78, M5: 52, M6: 36 },
  { month: "Dez/25", M1: 1200, M2: 148, M3: 102, M4: 80, M5: 55, M6: 38 },
  { month: "Jan/26", M1: 1180, M2: 155, M3: 100, M4: 82, M5: 53, M6: 37 },
  { month: "Fev/26", M1: 1220, M2: 160, M3: 105, M4: 85, M5: 56, M6: 40 },
  { month: "Mar/26", M1: 1250, M2: 158, M3: 108, M4: 88, M5: 58, M6: 42 },
  { month: "Abr/26", M1: 1280, M2: 162, M3: 110, M4: 90, M5: 60, M6: 44 },
  { month: "Mai/26", M1: 1247, M2: 156, M3: 112, M4: 92, M5: 62, M6: 45 },
];

const volumeChartConfig: ChartConfig = {
  M1: { label: "Produtos", color: "#3B82F6" },
  M2: { label: "Viagens", color: "#10B981" },
  M3: { label: "Serviços", color: "#8B5CF6" },
  M4: { label: "Manutenção", color: "#F59E0B" },
  M5: { label: "Frete", color: "#EF4444" },
  M6: { label: "Locação", color: "#06B6D4" },
};

const moduleDistData = [
  { name: "Produtos", value: 1247, fill: "#3B82F6" },
  { name: "Viagens", value: 156, fill: "#10B981" },
  { name: "Serviços", value: 112, fill: "#8B5CF6" },
  { name: "Manutenção", value: 92, fill: "#F59E0B" },
  { name: "Frete", value: 62, fill: "#EF4444" },
  { name: "Locação", value: 45, fill: "#06B6D4" },
];

const pieChartConfig: ChartConfig = {
  Produtos: { label: "Produtos", color: "#3B82F6" },
  Viagens: { label: "Viagens", color: "#10B981" },
  Serviços: { label: "Serviços", color: "#8B5CF6" },
  Manutenção: { label: "Manutenção", color: "#F59E0B" },
  Frete: { label: "Frete", color: "#EF4444" },
  Locação: { label: "Locação", color: "#06B6D4" },
};

const stageDurationData = [
  { stage: "V1", label: "Requisição", avg: 0.5, target: 1 },
  { stage: "V2", label: "Cotação", avg: 18.2, target: 24 },
  { stage: "V3", label: "Aprovação", avg: 52.4, target: 72 },
  { stage: "V4", label: "Compra", avg: 36.8, target: 48 },
  { stage: "V5", label: "Recebimento", avg: 120.5, target: 168 },
];

const stageBarConfig: ChartConfig = {
  avg: { label: "Média (h)", color: "#3B82F6" },
  target: { label: "Meta (h)", color: "#E5E7EB" },
};

const slaByModuleData = [
  { module: "M1", compliance: 89, label: "Produtos" },
  { module: "M2", compliance: 94, label: "Viagens" },
  { module: "M3", compliance: 82, label: "Serviços" },
  { module: "M4", compliance: 76, label: "Manutenção" },
  { module: "M5", compliance: 91, label: "Frete" },
  { module: "M6", compliance: 88, label: "Locação" },
];

const radarData = [
  { metric: "Volume", value: 85, fullMark: 100 },
  { metric: "SLA", value: 87, fullMark: 100 },
  { metric: "Qualidade", value: 92, fullMark: 100 },
  { metric: "Eficiência", value: 78, fullMark: 100 },
  { metric: "Economia", value: 81, fullMark: 100 },
  { metric: "Automação", value: 65, fullMark: 100 },
];

const radarConfig: ChartConfig = {
  value: { label: "Score", color: "#F5A623" },
};

const qualityMetrics = [
  { label: "Taxa de Aprovação", value: 94.2, trend: 1.3, icon: CheckCircle2 },
  { label: "Taxa de Exceção", value: 3.8, trend: -0.5, icon: AlertTriangle },
  { label: "Taxa de Retrabalho", value: 2.1, trend: -0.8, icon: RotateCcw },
];

const efficiencyMetrics = [
  { label: "Requisições/Comprador", value: 42, unit: "/mês", trend: 3 },
  { label: "Taxa de Automação", value: 34, unit: "%", trend: 5 },
  { label: "Touchless Rate", value: 18, unit: "%", trend: 2 },
];

const topBuyers = [
  { name: "Maria Oliveira", tickets: 68, sla: 96 },
  { name: "Ana Costa", tickets: 55, sla: 92 },
  { name: "João Pereira", tickets: 48, sla: 89 },
  { name: "Fernanda Lima", tickets: 42, sla: 94 },
  { name: "Carlos Souza", tickets: 38, sla: 87 },
];

/* ────────────────────────────────────────────────
 *  Helpers
 * ──────────────────────────────────────────────── */

function SLAGauge({ value }: { value: number }) {
  const color =
    value >= 95 ? "#10B981" : value >= 85 ? "#F59E0B" : "#EF4444";
  const label =
    value >= 95 ? "Excelente" : value >= 85 ? "Atenção" : "Crítico";
  const gaugeData = [{ value, fill: color }];
  const gaugeConfig: ChartConfig = { value: { label: "SLA", color } };

  return (
    <div className="flex flex-col items-center">
      <ChartContainer config={gaugeConfig} className="h-[160px] w-[160px] aspect-square">
        <RadialBarChart
          innerRadius={55}
          outerRadius={75}
          startAngle={180}
          endAngle={180 - (value / 100) * 360}
          data={gaugeData}
          cx="50%"
          cy="50%"
        >
          <RadialBar dataKey="value" cornerRadius={8} background />
        </RadialBarChart>
      </ChartContainer>
      <div className="text-center -mt-20">
        <span className="text-3xl font-bold text-foreground">{value}%</span>
        <Badge
          variant="outline"
          className="ml-2 text-[10px]"
          style={{ borderColor: color, color }}
        >
          {label}
        </Badge>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────
 *  Page Component
 * ──────────────────────────────────────────────── */

function AnalyticsPage() {
  const [period, setPeriod] = useState("12m");
  const [moduleFilter, setModuleFilter] = useState("Todos");
  const [compareMode, setCompareMode] = useState<"none" | "previous_period" | "same_period_last_year">("none");
  const [highlightModule, setHighlightModule] = useState<string | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [drillPath, setDrillPath] = useState<string[]>([]);

  const totalTickets = 1714;
  const avgCycleHours = 156;
  const slaCompliance = 87;
  const approvalRate = 94.2;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
            <BarChart3 className="h-5 w-5 text-vp-yellow-dark" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Analytics</h1>
            <p className="text-sm text-muted-foreground">
              Métricas, SLA e indicadores de desempenho
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Module filter */}
          <Select value={moduleFilter} onValueChange={setModuleFilter}>
            <SelectTrigger className="w-[120px]">
              <Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["Todos", "M1", "M2", "M3", "M4", "M5", "M6"].map((m) => (
                <SelectItem key={m} value={m}>{m === "Todos" ? "Todos Módulos" : m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {/* Period */}
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="3m">Últimos 3 meses</SelectItem>
              <SelectItem value="6m">Últimos 6 meses</SelectItem>
              <SelectItem value="12m">Últimos 12 meses</SelectItem>
            </SelectContent>
          </Select>
          {/* Time comparison */}
          <Select value={compareMode} onValueChange={(v) => setCompareMode(v as typeof compareMode)}>
            <SelectTrigger className="w-[160px]">
              <GitCompareArrows className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
              <SelectValue placeholder="Comparar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sem comparação</SelectItem>
              <SelectItem value="previous_period">Período anterior</SelectItem>
              <SelectItem value="same_period_last_year">Mesmo período ano anterior</SelectItem>
            </SelectContent>
          </Select>
          {/* Export */}
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setExportOpen(true)}>
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Exportar</span>
          </Button>
        </div>
      </div>

      {/* Drill-down breadcrumb */}
      {drillPath.length > 0 && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <button className="hover:text-foreground transition-colors" onClick={() => setDrillPath([])}>
            Dashboard
          </button>
          {drillPath.map((p, i) => (
            <span key={p} className="flex items-center gap-1">
              <ChevronRight className="h-3 w-3" />
              <button
                className="hover:text-foreground transition-colors"
                onClick={() => setDrillPath(drillPath.slice(0, i + 1))}
              >
                {p}
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Comparison banner */}
      {compareMode !== "none" && (
        <Card className="border-dashed border-[var(--vp-yellow)]">
          <CardContent className="p-3 flex items-center gap-3">
            <GitCompareArrows className="h-4 w-4 text-vp-yellow-dark shrink-0" />
            <p className="text-xs text-muted-foreground">
              Comparando com{" "}
              <span className="font-medium text-foreground">
                {compareMode === "previous_period" ? "período anterior" : "mesmo período do ano anterior"}
              </span>
              {" · "}Variações exibidas em valores absolutos e percentuais.
            </p>
            <button className="ml-auto text-xs text-muted-foreground hover:text-foreground" onClick={() => setCompareMode("none")}>
              Remover
            </button>
          </CardContent>
        </Card>
      )}

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-hover-yellow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground font-medium">Total Requisições</p>
              <Package className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold text-foreground mt-1">
              {totalTickets.toLocaleString("pt-BR")}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <ArrowUpRight className="h-3 w-3 text-emerald-500" />
              <span className="text-xs text-emerald-600 font-medium">+8.2%</span>
              <span className="text-xs text-muted-foreground">vs mês anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover-yellow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground font-medium">Tempo Médio Ciclo</p>
              <Timer className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold text-foreground mt-1">
              {Math.floor(avgCycleHours / 24)}d {avgCycleHours % 24}h
            </p>
            <div className="flex items-center gap-1 mt-1">
              <ArrowDownRight className="h-3 w-3 text-emerald-500" />
              <span className="text-xs text-emerald-600 font-medium">-12h</span>
              <span className="text-xs text-muted-foreground">vs mês anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover-yellow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground font-medium">Compliance SLA</p>
              <Target className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold text-foreground mt-1">{slaCompliance}%</p>
            <div className="flex items-center gap-1 mt-1">
              <ArrowUpRight className="h-3 w-3 text-emerald-500" />
              <span className="text-xs text-emerald-600 font-medium">+2.1%</span>
              <span className="text-xs text-muted-foreground">vs mês anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover-yellow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground font-medium">Taxa Aprovação</p>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold text-foreground mt-1">{approvalRate}%</p>
            <div className="flex items-center gap-1 mt-1">
              <ArrowUpRight className="h-3 w-3 text-emerald-500" />
              <span className="text-xs text-emerald-600 font-medium">+1.3%</span>
              <span className="text-xs text-muted-foreground">vs mês anterior</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Volume Trend + SLA Gauge */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 card-hover-yellow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Volume de Requisições</CardTitle>
            <p className="text-xs text-muted-foreground">Últimos 12 meses por módulo</p>
          </CardHeader>
          <CardContent>
            <ChartContainer config={volumeChartConfig} className="h-[280px] w-full">
              <AreaChart data={volumeTrendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                <YAxis tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                <ChartTooltip content={<ChartTooltipContent />} />
                {(["M1", "M2", "M3", "M4", "M5", "M6"] as const).map((key) => (
                  <Area
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stackId="1"
                    stroke={volumeChartConfig[key].color}
                    fill={volumeChartConfig[key].color}
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                ))}
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="card-hover-yellow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Compliance SLA Geral</CardTitle>
            <p className="text-xs text-muted-foreground">Meta: ≥ 95%</p>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center pt-4">
            <SLAGauge value={slaCompliance} />
            <div className="w-full mt-6 space-y-2">
              {[
                { label: "No prazo", value: 1491, pct: 87, color: "#10B981" },
                { label: "Em risco", value: 137, pct: 8, color: "#F59E0B" },
                { label: "Excedido", value: 86, pct: 5, color: "#EF4444" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-xs">
                  <div className="h-2 w-2 rounded-full" style={{ background: item.color }} />
                  <span className="text-muted-foreground flex-1">{item.label}</span>
                  <span className="font-medium text-foreground">{item.value}</span>
                  <span className="text-muted-foreground">({item.pct}%)</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Module Distribution + Stage Duration */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="card-hover-yellow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Distribuição por Módulo</CardTitle>
            <p className="text-xs text-muted-foreground">Maio/2026</p>
          </CardHeader>
          <CardContent>
            <ChartContainer config={pieChartConfig} className="h-[250px] w-full">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Pie
                  data={moduleDistData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {moduleDistData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="card-hover-yellow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Duração por Estágio</CardTitle>
            <p className="text-xs text-muted-foreground">Média vs Meta (horas)</p>
          </CardHeader>
          <CardContent>
            <ChartContainer config={stageBarConfig} className="h-[250px] w-full">
              <BarChart
                data={stageDurationData}
                layout="vertical"
                margin={{ top: 5, right: 10, left: 10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                <YAxis
                  dataKey="label"
                  type="category"
                  tick={{ fontSize: 10 }}
                  width={80}
                  className="fill-muted-foreground"
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="target" fill="#E5E7EB" radius={[0, 4, 4, 0]} barSize={14} />
                <Bar dataKey="avg" fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={14} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* SLA by Module + Performance Radar */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="card-hover-yellow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">SLA por Módulo</CardTitle>
            <p className="text-xs text-muted-foreground">Compliance % por módulo</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {slaByModuleData.map((mod) => {
              const color =
                mod.compliance >= 90
                  ? "text-emerald-600"
                  : mod.compliance >= 80
                    ? "text-amber-600"
                    : "text-red-600";
              const bg =
                mod.compliance >= 90
                  ? "[&>div]:bg-emerald-500"
                  : mod.compliance >= 80
                    ? "[&>div]:bg-amber-500"
                    : "[&>div]:bg-red-500";
              return (
                <div key={mod.module} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {mod.module} — {mod.label}
                    </span>
                    <span className={`font-semibold ${color}`}>{mod.compliance}%</span>
                  </div>
                  <Progress value={mod.compliance} className={`h-2 ${bg}`} />
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="card-hover-yellow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Radar de Performance</CardTitle>
            <p className="text-xs text-muted-foreground">Visão multidimensional</p>
          </CardHeader>
          <CardContent>
            <ChartContainer config={radarConfig} className="h-[250px] w-full">
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                <PolarGrid className="stroke-border" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                <PolarRadiusAxis tick={{ fontSize: 8 }} domain={[0, 100]} className="fill-muted-foreground" />
                <Radar
                  name="Score"
                  dataKey="value"
                  stroke="#F5A623"
                  fill="#F5A623"
                  fillOpacity={0.25}
                  strokeWidth={2}
                />
              </RadarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Quality + Efficiency + Top Buyers */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Quality */}
        <Card className="card-hover-yellow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Qualidade</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {qualityMetrics.map((m) => {
              const isPositive =
                m.label === "Taxa de Aprovação" ? m.trend > 0 : m.trend < 0;
              return (
                <div key={m.label} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent">
                    <m.icon className="h-4 w-4 text-vp-yellow-dark" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">{m.label}</p>
                    <p className="text-sm font-bold text-foreground">{m.value}%</p>
                  </div>
                  <span
                    className={`text-xs font-medium ${isPositive ? "text-emerald-600" : "text-red-500"}`}
                  >
                    {m.trend > 0 ? "+" : ""}
                    {m.trend}%
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Efficiency */}
        <Card className="card-hover-yellow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Eficiência</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {efficiencyMetrics.map((m) => (
              <div key={m.label} className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent">
                  <Zap className="h-4 w-4 text-vp-yellow-dark" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">{m.label}</p>
                  <p className="text-sm font-bold text-foreground">
                    {m.value}
                    <span className="text-xs font-normal text-muted-foreground ml-0.5">
                      {m.unit}
                    </span>
                  </p>
                </div>
                <span className="text-xs font-medium text-emerald-600">
                  +{m.trend}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Top Buyers */}
        <Card className="card-hover-yellow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Top Compradores</CardTitle>
            <p className="text-xs text-muted-foreground">Por volume mensal</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {topBuyers.map((b, i) => (
              <div key={b.name} className="flex items-center gap-3">
                <span className="text-xs font-bold text-muted-foreground w-4">
                  {i + 1}.
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{b.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {b.tickets} tickets · SLA {b.sla}%
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={`text-[10px] ${
                    b.sla >= 90
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}
                >
                  {b.sla}%
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>

    {/* Export Dialog */}
    <Dialog open={exportOpen} onOpenChange={setExportOpen}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Exportar Dashboard
          </DialogTitle>
          <DialogDescription>
            Selecione o formato de exportação
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 mt-2">
          {[
            { label: "PDF", desc: "Relatório completo com gráficos", icon: FileText },
            { label: "Excel", desc: "Dados brutos + tabelas dinâmicas", icon: FileSpreadsheet },
            { label: "CSV", desc: "Dados tabulares simples", icon: FileSpreadsheet },
            { label: "PNG", desc: "Imagem do dashboard", icon: Image },
          ].map((opt) => (
            <button
              key={opt.label}
              className="flex flex-col items-center gap-2 rounded-lg border-2 border-border p-4 hover:border-[var(--vp-yellow)] transition-colors cursor-pointer"
              onClick={() => {
                setExportOpen(false);
              }}
            >
              <opt.icon className="h-6 w-6 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">{opt.label}</span>
              <span className="text-[10px] text-muted-foreground text-center leading-tight">
                {opt.desc}
              </span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
          <input type="checkbox" id="include-raw" className="rounded" />
          <label htmlFor="include-raw">Incluir dados brutos</label>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}