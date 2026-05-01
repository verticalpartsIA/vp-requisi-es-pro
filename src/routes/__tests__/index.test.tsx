import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithRouter } from "@/test/test-utils";
import Index from "../index";

// We test the component directly since route config can't easily be tested outside the router
describe("Dashboard (Index)", () => {
  it("renders greeting", () => {
    renderWithRouter(<Index />);
    expect(screen.getByText(/Bom dia|Boa tarde|Boa noite/)).toBeInTheDocument();
  });

  it("renders KPI stats", () => {
    renderWithRouter(<Index />);
    expect(screen.getByText("Tickets Abertos")).toBeInTheDocument();
    expect(screen.getByText("Em Cotação")).toBeInTheDocument();
    expect(screen.getByText("Aprovados")).toBeInTheDocument();
    expect(screen.getByText("Concluídos (mês)")).toBeInTheDocument();
  });

  it("renders Nova Requisição section", () => {
    renderWithRouter(<Index />);
    expect(screen.getByText("Nova Requisição")).toBeInTheDocument();
  });

  it("renders all 6 module cards", () => {
    renderWithRouter(<Index />);
    expect(screen.getByText("Produtos")).toBeInTheDocument();
    expect(screen.getByText("Viagens")).toBeInTheDocument();
    expect(screen.getByText("Serviços")).toBeInTheDocument();
    expect(screen.getByText("Manutenção")).toBeInTheDocument();
    expect(screen.getByText("Frete")).toBeInTheDocument();
    expect(screen.getByText("Locação")).toBeInTheDocument();
  });

  it("renders module tags M1–M6", () => {
    renderWithRouter(<Index />);
    expect(screen.getByText("M1")).toBeInTheDocument();
    expect(screen.getByText("M2")).toBeInTheDocument();
    expect(screen.getByText("M3")).toBeInTheDocument();
    expect(screen.getByText("M4")).toBeInTheDocument();
    expect(screen.getByText("M5")).toBeInTheDocument();
    expect(screen.getByText("M6")).toBeInTheDocument();
  });

  it("renders recent tickets section", () => {
    renderWithRouter(<Index />);
    expect(screen.getByText("Tickets Recentes")).toBeInTheDocument();
    expect(screen.getByText("M1-000065")).toBeInTheDocument();
    expect(screen.getByText("M2-000042")).toBeInTheDocument();
  });

  it("displays stat values", () => {
    renderWithRouter(<Index />);
    expect(screen.getByText("24")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("47")).toBeInTheDocument();
  });
});