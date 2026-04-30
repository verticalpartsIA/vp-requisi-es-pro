import { createFileRoute } from "@tanstack/react-router";
import {
  Package,
  Plane,
  Wrench,
  HardHat,
  Truck,
  Key,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — VPRequisições" },
      { name: "description", content: "Painel de controle do sistema de requisições VerticalParts" },
    ],
  }),
  component: Index,
});

const stats = [
  { label: "Tickets Abertos", value: "24", icon: Clock, trend: "+3 hoje" },
  { label: "Em Cotação", value: "8", icon: AlertTriangle, trend: "2 urgentes" },
  { label: "Aprovados", value: "12", icon: CheckCircle2, trend: "+5 semana" },
  { label: "Concluídos (mês)", value: "47", icon: TrendingUp, trend: "+12%" },
];

const modules = [
  { title: "Produtos", desc: "Materiais, insumos e equipamentos", icon: Package, url: "/products", tag: "M1", count: 6 },
  { title: "Viagens", desc: "Passagens, hotel e despesas", icon: Plane, url: "/trips", tag: "M2", count: 3 },
  { title: "Serviços", desc: "Consultoria, manutenção e projetos", icon: Wrench, url: "/services", tag: "M3", count: 4 },
  { title: "Manutenção", desc: "Corretiva, preventiva e preditiva", icon: HardHat, url: "/maintenance", tag: "M4", count: 5 },
  { title: "Frete", desc: "Transporte e logística", icon: Truck, url: "/freight", tag: "M5", count: 2 },
  { title: "Locação", desc: "Equipamentos e veículos temporários", icon: Key, url: "/rental", tag: "M6", count: 1 },
];

const recentTickets = [
  { id: "M1-000065", module: "M1", title: "Parafusos Inox 304 M10x50mm", urgency: "HIGH", status: "COTAÇÃO", date: "28/04" },
  { id: "M2-000042", module: "M2", title: "Viagem SP - Cliente ABC", urgency: "MEDIUM", status: "APROVAÇÃO", date: "27/04" },
  { id: "M4-000031", module: "M4", title: "Prensa Hidráulica - Vazamento", urgency: "URGENT", status: "ABERTO", date: "25/04" },
  { id: "M5-000028", module: "M5", title: "Frete Chapas Aço - SP→CWB", urgency: "MEDIUM", status: "COMPRA", date: "24/04" },
  { id: "M3-000018", module: "M3", title: "Consultoria ERP Financeiro", urgency: "LOW", status: "COTAÇÃO", date: "22/04" },
];

const urgencyLabel: Record<string, string> = {
  URGENT: "Urgente",
  HIGH: "Alta",
  MEDIUM: "Média",
  LOW: "Baixa",
};

function urgencyColor(u: string) {
  if (u === "URGENT") return "bg-red-100 text-red-700 border-red-200";
  if (u === "HIGH") return "bg-orange-100 text-orange-700 border-orange-200";
  if (u === "MEDIUM") return "bg-yellow-100 text-yellow-700 border-yellow-200";
  return "bg-green-100 text-green-700 border-green-200";
}

function statusColor(s: string) {
  if (s === "ABERTO") return "bg-blue-100 text-blue-700";
  if (s === "COTAÇÃO") return "bg-purple-100 text-purple-700";
  if (s === "APROVAÇÃO") return "bg-amber-100 text-amber-700";
  if (s === "COMPRA") return "bg-emerald-100 text-emerald-700";
  return "bg-muted text-muted-foreground";
}

function Index() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="animate-fade-in-up">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Bom dia! 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Acompanhe suas requisições e fluxos de compra.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
        {stats.map((s) => (
          <Card key={s.label} className="card-hover-yellow">
            <CardContent className="p-4 flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent">
                <s.icon className="h-5 w-5 text-vp-yellow-dark" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-[10px] text-vp-yellow-dark font-medium mt-0.5">{s.trend}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modules */}
      <div className="animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
        <h2 className="text-lg font-semibold text-foreground mb-3">Nova Requisição</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {modules.map((m) => (
            <Link key={m.tag} to={m.url}>
              <Card className="card-hover-yellow cursor-pointer h-full">
                <CardContent className="p-4 text-center flex flex-col items-center gap-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent">
                    <m.icon className="h-6 w-6 text-vp-yellow-dark" />
                  </div>
                  <div>
                    <Badge variant="outline" className="text-[10px] mb-1">{m.tag}</Badge>
                    <p className="text-sm font-semibold text-foreground">{m.title}</p>
                    <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">{m.desc}</p>
                  </div>
                  <span className="text-xs text-vp-yellow-dark font-medium">{m.count} abertos</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Tickets */}
      <div className="animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-foreground">Tickets Recentes</h2>
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
            Ver todos <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 text-xs font-medium text-muted-foreground">Ticket</th>
                    <th className="text-left p-3 text-xs font-medium text-muted-foreground">Descrição</th>
                    <th className="text-left p-3 text-xs font-medium text-muted-foreground">Urgência</th>
                    <th className="text-left p-3 text-xs font-medium text-muted-foreground">Status</th>
                    <th className="text-left p-3 text-xs font-medium text-muted-foreground">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTickets.map((t) => (
                    <tr key={t.id} className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors cursor-pointer">
                      <td className="p-3 font-mono text-xs font-semibold text-foreground">{t.id}</td>
                      <td className="p-3 text-foreground">{t.title}</td>
                      <td className="p-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold border ${urgencyColor(t.urgency)}`}>
                          {urgencyLabel[t.urgency] || t.urgency}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusColor(t.status)}`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="p-3 text-muted-foreground text-xs">{t.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
