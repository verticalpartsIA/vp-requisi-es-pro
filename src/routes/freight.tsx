import { createFileRoute } from "@tanstack/react-router";
import { Truck, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/freight")({
  component: FreightPage,
});

function FreightPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
            <Truck className="h-5 w-5 text-vp-yellow-dark" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">M5 — Frete</h1>
            <p className="text-sm text-muted-foreground">Transporte e logística</p>
          </div>
        </div>
        <Button variant="vp"><Plus className="h-4 w-4 mr-2" />Nova Requisição</Button>
      </div>
      <Card className="card-hover-yellow">
        <CardContent className="p-12 text-center">
          <Truck className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
          <p className="text-muted-foreground">Nenhuma requisição de frete ainda.</p>
        </CardContent>
      </Card>
    </div>
  );
}