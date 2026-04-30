import { createFileRoute } from "@tanstack/react-router";
import { ShoppingCart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/purchasing")({
  component: PurchasingPage,
});

function PurchasingPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
          <ShoppingCart className="h-5 w-5 text-vp-yellow-dark" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">V4 — Compra</h1>
          <p className="text-sm text-muted-foreground">Pedidos de compra e integração Omie</p>
        </div>
      </div>
      <Card className="card-hover-yellow">
        <CardContent className="p-12 text-center">
          <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
          <p className="text-muted-foreground">Nenhum pedido de compra pendente.</p>
        </CardContent>
      </Card>
    </div>
  );
}