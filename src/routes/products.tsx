import { createFileRoute } from "@tanstack/react-router";
import { Package, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TicketsTable, type TicketRow } from "@/components/tickets-table";

const sampleTickets: TicketRow[] = [
  { id: "M1-000065", title: "Parafusos Inox 304 M10x50mm", requester: "Carlos Silva", urgency: "HIGH", status: "COTAÇÃO", date: "28/04" },
  { id: "M1-000064", title: "Luvas Nitrílicas Caixa c/100", requester: "Ana Souza", urgency: "MEDIUM", status: "APROVAÇÃO", date: "27/04" },
  { id: "M1-000063", title: "Óleo Hidráulico ISO 68 20L", requester: "João Lima", urgency: "URGENT", status: "ABERTO", date: "26/04" },
  { id: "M1-000062", title: "Disco de Corte 7\" Inox", requester: "Maria Costa", urgency: "LOW", status: "CONCLUÍDO", date: "24/04" },
  { id: "M1-000061", title: "Rolamento 6205 ZZ", requester: "Pedro Santos", urgency: "MEDIUM", status: "COMPRA", date: "22/04" },
];

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
        <Button variant="vp">
          <Plus className="h-4 w-4 mr-2" />
          Nova Requisição
        </Button>
      </div>
      <TicketsTable
        tickets={sampleTickets}
        emptyIcon={<Package className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />}
        emptyMessage="Nenhuma requisição de produto ainda."
      />
    </div>
  );
}