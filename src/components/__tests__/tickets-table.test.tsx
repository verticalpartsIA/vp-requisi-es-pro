import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TicketsTable, type TicketRow } from "../tickets-table";

const sampleTickets: TicketRow[] = [
  { id: "M1-000065", title: "Parafusos Inox 304", requester: "Carlos Silva", urgency: "HIGH", status: "COTAÇÃO", date: "28/04" },
  { id: "M1-000064", title: "Luvas Nitrílicas", requester: "Ana Souza", urgency: "LOW", status: "CONCLUÍDO", date: "27/04" },
  { id: "M1-000063", title: "Óleo Hidráulico", requester: "João Lima", urgency: "URGENT", status: "ABERTO", date: "26/04" },
];

describe("TicketsTable", () => {
  it("renders table headers when tickets are provided", () => {
    render(
      <TicketsTable
        tickets={sampleTickets}
        emptyIcon={<span>🔍</span>}
        emptyMessage="Nenhum ticket"
      />
    );

    expect(screen.getByText("Ticket")).toBeInTheDocument();
    expect(screen.getByText("Descrição")).toBeInTheDocument();
    expect(screen.getByText("Solicitante")).toBeInTheDocument();
    expect(screen.getByText("Urgência")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("Data")).toBeInTheDocument();
  });

  it("renders all ticket rows", () => {
    render(
      <TicketsTable
        tickets={sampleTickets}
        emptyIcon={<span>🔍</span>}
        emptyMessage="Nenhum ticket"
      />
    );

    expect(screen.getByText("M1-000065")).toBeInTheDocument();
    expect(screen.getByText("M1-000064")).toBeInTheDocument();
    expect(screen.getByText("M1-000063")).toBeInTheDocument();
    expect(screen.getByText("Parafusos Inox 304")).toBeInTheDocument();
    expect(screen.getByText("Carlos Silva")).toBeInTheDocument();
  });

  it("renders urgency labels correctly", () => {
    render(
      <TicketsTable
        tickets={sampleTickets}
        emptyIcon={<span>🔍</span>}
        emptyMessage="Nenhum ticket"
      />
    );

    expect(screen.getByText("Alta")).toBeInTheDocument();
    expect(screen.getByText("Baixa")).toBeInTheDocument();
    expect(screen.getByText("Urgente")).toBeInTheDocument();
  });

  it("renders status badges correctly", () => {
    render(
      <TicketsTable
        tickets={sampleTickets}
        emptyIcon={<span>🔍</span>}
        emptyMessage="Nenhum ticket"
      />
    );

    expect(screen.getByText("COTAÇÃO")).toBeInTheDocument();
    expect(screen.getByText("CONCLUÍDO")).toBeInTheDocument();
    expect(screen.getByText("ABERTO")).toBeInTheDocument();
  });

  it("renders empty state when no tickets provided", () => {
    render(
      <TicketsTable
        tickets={[]}
        emptyIcon={<span data-testid="empty-icon">🔍</span>}
        emptyMessage="Nenhum ticket encontrado"
      />
    );

    expect(screen.getByText("Nenhum ticket encontrado")).toBeInTheDocument();
    expect(screen.getByTestId("empty-icon")).toBeInTheDocument();
    expect(screen.getByText(/Nova Requisição/)).toBeInTheDocument();
  });

  it("renders correct number of rows", () => {
    render(
      <TicketsTable
        tickets={sampleTickets}
        emptyIcon={<span>🔍</span>}
        emptyMessage="Nenhum ticket"
      />
    );

    const rows = screen.getAllByRole("row");
    // 1 header row + 3 data rows
    expect(rows).toHaveLength(4);
  });

  it("displays dates correctly", () => {
    render(
      <TicketsTable
        tickets={sampleTickets}
        emptyIcon={<span>🔍</span>}
        emptyMessage="Nenhum ticket"
      />
    );

    expect(screen.getByText("28/04")).toBeInTheDocument();
    expect(screen.getByText("27/04")).toBeInTheDocument();
    expect(screen.getByText("26/04")).toBeInTheDocument();
  });

  it("handles all urgency levels", () => {
    const allUrgencies: TicketRow[] = [
      { id: "T1", title: "Test1", requester: "User", urgency: "LOW", status: "ABERTO", date: "01/01" },
      { id: "T2", title: "Test2", requester: "User", urgency: "MEDIUM", status: "ABERTO", date: "01/01" },
      { id: "T3", title: "Test3", requester: "User", urgency: "HIGH", status: "ABERTO", date: "01/01" },
      { id: "T4", title: "Test4", requester: "User", urgency: "URGENT", status: "ABERTO", date: "01/01" },
    ];

    render(
      <TicketsTable tickets={allUrgencies} emptyIcon={<span />} emptyMessage="" />
    );

    expect(screen.getByText("Baixa")).toBeInTheDocument();
    expect(screen.getByText("Média")).toBeInTheDocument();
    expect(screen.getByText("Alta")).toBeInTheDocument();
    expect(screen.getByText("Urgente")).toBeInTheDocument();
  });

  it("handles all status values", () => {
    const allStatuses: TicketRow[] = [
      { id: "T1", title: "T", requester: "U", urgency: "LOW", status: "RASCUNHO", date: "01/01" },
      { id: "T2", title: "T", requester: "U", urgency: "LOW", status: "ABERTO", date: "01/01" },
      { id: "T3", title: "T", requester: "U", urgency: "LOW", status: "COTAÇÃO", date: "01/01" },
      { id: "T4", title: "T", requester: "U", urgency: "LOW", status: "APROVAÇÃO", date: "01/01" },
      { id: "T5", title: "T", requester: "U", urgency: "LOW", status: "COMPRA", date: "01/01" },
      { id: "T6", title: "T", requester: "U", urgency: "LOW", status: "RECEBIMENTO", date: "01/01" },
      { id: "T7", title: "T", requester: "U", urgency: "LOW", status: "CONCLUÍDO", date: "01/01" },
    ];

    render(
      <TicketsTable tickets={allStatuses} emptyIcon={<span />} emptyMessage="" />
    );

    expect(screen.getByText("RASCUNHO")).toBeInTheDocument();
    expect(screen.getByText("ABERTO")).toBeInTheDocument();
    expect(screen.getByText("COTAÇÃO")).toBeInTheDocument();
    expect(screen.getByText("APROVAÇÃO")).toBeInTheDocument();
    expect(screen.getByText("COMPRA")).toBeInTheDocument();
    expect(screen.getByText("RECEBIMENTO")).toBeInTheDocument();
    expect(screen.getByText("CONCLUÍDO")).toBeInTheDocument();
  });
});