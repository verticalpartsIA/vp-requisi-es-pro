import { createFileRoute } from "@tanstack/react-router";
import { Wrench, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TicketsTable, type TicketRow } from "@/components/tickets-table";

const sampleTickets: TicketRow[] = [
  { id: "M3-000018", title: "Consultoria ERP Financeiro", requester: "Roberto Alves", urgency: "LOW", status: "COTAÇÃO", date: "22/04" },
  { id: "M3-000017", title: "Manutenção Ar Condicionado", requester: "Lucia Ramos", urgency: "MEDIUM", status: "COMPRA", date: "20/04" },
  { id: "M3-000016", title: "Auditoria ISO 9001", requester: "Paulo Souza", urgency: "HIGH", status: "APROVAÇÃO", date: "18/04" },
  { id: "M3-000015", title: "Limpeza Industrial Anual", requester: "Marcos Reis", urgency: "MEDIUM", status: "CONCLUÍDO", date: "15/04" },
];

export const Route = createFileRoute("/services")({
  component: ServicesPage,
});

function ServicesPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
            <Wrench className="h-5 w-5 text-vp-yellow-dark" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">M3 — Serviços</h1>
            <p className="text-sm text-muted-foreground">Consultoria, manutenção e projetos</p>
          </div>
        </div>
        <Button variant="vp"><Plus className="h-4 w-4 mr-2" />Nova Requisição</Button>
      </div>
      <TicketsTable
        tickets={sampleTickets}
        emptyIcon={<Wrench className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />}
        emptyMessage="Nenhuma requisição de serviço ainda."
      />
    </div>
  );
}