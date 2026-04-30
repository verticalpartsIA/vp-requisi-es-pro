import { createFileRoute } from "@tanstack/react-router";
import { Package, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/products")({
  head: () => ({
    meta: [
      { title: "M1 Produtos — VPRequisições" },
      { name: "description", content: "Requisição de produtos, materiais e equipamentos" },
    ],
  }),
  component: ProductsPage,
});

function ProductsPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
            <Package className="h-5 w-5 text-vp-yellow-dark" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">M1 — Produtos</h1>
            <p className="text-sm text-muted-foreground">Materiais, insumos e equipamentos</p>
          </div>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nova Requisição
        </Button>
      </div>
      <Card className="card-hover-yellow">
        <CardContent className="p-12 text-center">
          <Package className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
          <p className="text-muted-foreground">Nenhuma requisição de produto ainda.</p>
          <p className="text-sm text-muted-foreground/60 mt-1">Clique em "Nova Requisição" para começar.</p>
        </CardContent>
      </Card>
    </div>
  );
}