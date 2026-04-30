import { createFileRoute } from "@tanstack/react-router";
import { BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/analytics")({
  component: AnalyticsPage,
});

function AnalyticsPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
          <BarChart3 className="h-5 w-5 text-vp-yellow-dark" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">Analytics</h1>
          <p className="text-sm text-muted-foreground">Métricas, SLA e indicadores</p>
        </div>
      </div>
      <Card className="card-hover-yellow">
        <CardContent className="p-12 text-center">
          <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
          <p className="text-muted-foreground">Analytics em breve.</p>
        </CardContent>
      </Card>
    </div>
  );
}