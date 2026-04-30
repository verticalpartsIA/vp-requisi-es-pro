import { createFileRoute } from "@tanstack/react-router";
import { Key, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/rental")({
  component: RentalPage,
});

function RentalPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
            <Key className="h-5 w-5 text-vp-yellow-dark" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">M6 — Locação</h1>
            <p className="text-sm text-muted-foreground">Equipamentos e veículos temporários</p>
          </div>
        </div>
        <Button variant="vp"><Plus className="h-4 w-4 mr-2" />Nova Requisição</Button>
      </div>
      <Card className="card-hover-yellow">
        <CardContent className="p-12 text-center">
          <Key className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
          <p className="text-muted-foreground">Nenhuma requisição de locação ainda.</p>
        </CardContent>
      </Card>
    </div>
  );
}