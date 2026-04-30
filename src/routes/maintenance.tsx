import { createFileRoute } from "@tanstack/react-router";
import { HardHat, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/maintenance")({
  component: MaintenancePage,
});

function MaintenancePage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
            <HardHat className="h-5 w-5 text-vp-yellow-dark" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">M4 — Manutenção</h1>
            <p className="text-sm text-muted-foreground">Corretiva, preventiva e preditiva</p>
          </div>
        </div>
        <Button variant="vp"><Plus className="h-4 w-4 mr-2" />Nova Requisição</Button>
      </div>
      <Card className="card-hover-yellow">
        <CardContent className="p-12 text-center">
          <HardHat className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
          <p className="text-muted-foreground">Nenhuma requisição de manutenção ainda.</p>
        </CardContent>
      </Card>
    </div>
  );
}