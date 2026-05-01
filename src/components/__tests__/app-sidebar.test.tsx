import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithRouter } from "@/test/test-utils";
import { AppSidebar } from "../app-sidebar";

describe("AppSidebar", () => {
  it("renders the brand name", () => {
    renderWithRouter(<AppSidebar />);
    expect(screen.getByText("VerticalParts")).toBeInTheDocument();
  });

  it("renders all module links (M1–M6)", () => {
    renderWithRouter(<AppSidebar />);

    expect(screen.getByText("M1 - Produtos")).toBeInTheDocument();
    expect(screen.getByText("M2 - Viagens")).toBeInTheDocument();
    expect(screen.getByText("M3 - Serviços")).toBeInTheDocument();
    expect(screen.getByText("M4 - Manutenção")).toBeInTheDocument();
    expect(screen.getByText("M5 - Frete")).toBeInTheDocument();
    expect(screen.getByText("M6 - Locação")).toBeInTheDocument();
  });

  it("renders all workflow links (V2–V5)", () => {
    renderWithRouter(<AppSidebar />);

    expect(screen.getByText("V2 - Cotação")).toBeInTheDocument();
    expect(screen.getByText("V3 - Aprovação")).toBeInTheDocument();
    expect(screen.getByText("V4 - Compra")).toBeInTheDocument();
    expect(screen.getByText("V5 - Recebimento")).toBeInTheDocument();
  });

  it("renders system links (Dashboard, Analytics, Logs)", () => {
    renderWithRouter(<AppSidebar />);

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Analytics")).toBeInTheDocument();
    expect(screen.getByText("Logs")).toBeInTheDocument();
  });

  it("renders version footer", () => {
    renderWithRouter(<AppSidebar />);
    expect(screen.getByText("VPRequisições v1.0")).toBeInTheDocument();
  });

  it("renders section labels", () => {
    renderWithRouter(<AppSidebar />);
    expect(screen.getByText("Sistema")).toBeInTheDocument();
    expect(screen.getByText("Requisições")).toBeInTheDocument();
    expect(screen.getByText("Fluxos")).toBeInTheDocument();
  });
});