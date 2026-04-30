import { createFileRoute } from "@tanstack/react-router";
import { HardHat, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TicketsTable, type TicketRow } from "@/components/tickets-table";

const sampleTickets: TicketRow[] = [
  { id: "M4-000031", title: "Prensa Hidráulica — Vazamento", requester: "Carlos Mota", urgency: "URGENT", status: "ABERTO", date: "25/04" },
  { id: "M4-000030", title: "Esteira Transportadora — Rolamento", requester: "André Lopes", urgency: "HIGH", status: "COTAÇÃO", date: "24/04" },
  { id: "M4-000029", title: "Compressor Ar — Preventiva", requester: "Rita Gomes", urgency: "MEDIUM", status: "COMPRA", date: "22/04" },
  { id: "M4-000028", title: "CNC Torno — Troca Ferramenta", requester: "Felipe Dias", urgency: "HIGH", status: "RECEBIMENTO", date: "20/04" },
  { id: "M4-000027", title: "Ponte Rolante — Inspeção NR-11", requester: "Jorge Nunes", urgency: "LOW", status: "CONCLUÍDO", date: "18/04" },
];

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
      <TicketsTable
        tickets={sampleTickets}
        emptyIcon={<HardHat className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />}
        emptyMessage="Nenhuma requisição de manutenção ainda."
      />
    </div>
  );
}