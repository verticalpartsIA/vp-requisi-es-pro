import { createFileRoute } from "@tanstack/react-router";
import { Key, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TicketsTable, type TicketRow } from "@/components/tickets-table";

const sampleTickets: TicketRow[] = [
  { id: "M6-000012", title: "Guindaste 20t — Linha Produção", requester: "Pedro Santos", urgency: "HIGH", status: "APROVAÇÃO", date: "26/04" },
];

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
      <TicketsTable
        tickets={sampleTickets}
        emptyIcon={<Key className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />}
        emptyMessage="Nenhuma requisição de locação ainda."
      />
    </div>
  );
}