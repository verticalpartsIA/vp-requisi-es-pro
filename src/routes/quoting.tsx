import { createFileRoute } from "@tanstack/react-router";
import { FileSearch } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/quoting")({
  component: QuotingPage,
});

const queue = [
  { id: "M1-000065", title: "Parafusos Inox 304", urgency: "HIGH", value: "R$ 2.300", deadline: "30/04", module: "M1" },
  { id: "M2-000042", title: "Viagem SP - Cliente ABC", urgency: "MEDIUM", value: "R$ 2.650", deadline: "05/05", module: "M2" },
  { id: "M3-000018", title: "Consultoria ERP Financeiro", urgency: "LOW", value: "R$ 50.000", deadline: "15/05", module: "M3" },
];

function urgBadge(u: string) {
  if (u === "HIGH") return "bg-orange-100 text-orange-700 border-orange-200";
  if (u === "MEDIUM") return "bg-yellow-100 text-yellow-700 border-yellow-200";
  return "bg-green-100 text-green-700 border-green-200";
}

function QuotingPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
          <FileSearch className="h-5 w-5 text-vp-yellow-dark" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">V2 — Cotação</h1>
          <p className="text-sm text-muted-foreground">Fila de cotação multi-fornecedor</p>
        </div>
      </div>
      <div className="space-y-3">
        {queue.map((t) => (
          <Card key={t.id} className="card-hover-yellow cursor-pointer">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="font-mono text-xs">{t.id}</Badge>
                <div>
                  <p className="font-semibold text-foreground text-sm">{t.title}</p>
                  <p className="text-xs text-muted-foreground">Prazo: {t.deadline} • Valor est.: {t.value}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold border ${urgBadge(t.urgency)}`}>
                  {t.urgency}
                </span>
                <button className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
                  Cotar
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}