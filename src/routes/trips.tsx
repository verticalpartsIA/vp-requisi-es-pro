import { createFileRoute } from "@tanstack/react-router";
import { Plane, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TicketsTable, type TicketRow } from "@/components/tickets-table";

const sampleTickets: TicketRow[] = [
  { id: "M2-000042", title: "Viagem SP — Cliente ABC Ltda", requester: "João Silva", urgency: "HIGH", status: "APROVAÇÃO", date: "27/04" },
  { id: "M2-000041", title: "Treinamento RJ — NR-12", requester: "Ana Costa", urgency: "MEDIUM", status: "COTAÇÃO", date: "25/04" },
  { id: "M2-000040", title: "Feira Industrial Hannover", requester: "Carlos Lima", urgency: "LOW", status: "ABERTO", date: "23/04" },
];

export const Route = createFileRoute("/trips")({
  head: () => ({
    meta: [
      { title: "M2 Viagens — VPRequisições" },
    ],
  }),
  component: TripsPage,
});

function TripsPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
            <Plane className="h-5 w-5 text-vp-yellow-dark" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">M2 — Viagens</h1>
            <p className="text-sm text-muted-foreground">Passagens, hotel e despesas</p>
          </div>
        </div>
        <Button variant="vp"><Plus className="h-4 w-4 mr-2" />Nova Requisição</Button>
      </div>
      <TicketsTable
        tickets={sampleTickets}
        emptyIcon={<Plane className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />}
        emptyMessage="Nenhuma requisição de viagem ainda."
      />
    </div>
  );
}