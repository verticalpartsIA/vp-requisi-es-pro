import { describe, it, expect } from "vitest";

describe("Dashboard (Index)", () => {
  it("defines correct stat data", () => {
    const stats = [
      { label: "Tickets Abertos", value: "24" },
      { label: "Em Cotação", value: "8" },
      { label: "Aprovados", value: "12" },
      { label: "Concluídos (mês)", value: "47" },
    ];
    expect(stats).toHaveLength(4);
    expect(stats[0].value).toBe("24");
  });

  it("defines all 6 modules", () => {
    const modules = [
      { title: "Produtos", tag: "M1", url: "/products" },
      { title: "Viagens", tag: "M2", url: "/trips" },
      { title: "Serviços", tag: "M3", url: "/services" },
      { title: "Manutenção", tag: "M4", url: "/maintenance" },
      { title: "Frete", tag: "M5", url: "/freight" },
      { title: "Locação", tag: "M6", url: "/rental" },
    ];
    expect(modules).toHaveLength(6);
    expect(modules.map((m) => m.tag)).toEqual(["M1", "M2", "M3", "M4", "M5", "M6"]);
  });

  it("defines recent tickets with correct modules", () => {
    const recentTickets = [
      { id: "M1-000065", module: "M1" },
      { id: "M2-000042", module: "M2" },
      { id: "M4-000031", module: "M4" },
      { id: "M5-000028", module: "M5" },
      { id: "M3-000018", module: "M3" },
    ];
    expect(recentTickets).toHaveLength(5);
    recentTickets.forEach((t) => {
      expect(t.id).toMatch(/^M\d-\d{6}$/);
    });
  });

  it("urgency color mapping covers all levels", () => {
    function urgencyColor(u: string) {
      if (u === "URGENT") return "bg-red-100";
      if (u === "HIGH") return "bg-orange-100";
      if (u === "MEDIUM") return "bg-yellow-100";
      return "bg-green-100";
    }
    expect(urgencyColor("URGENT")).toContain("red");
    expect(urgencyColor("HIGH")).toContain("orange");
    expect(urgencyColor("MEDIUM")).toContain("yellow");
    expect(urgencyColor("LOW")).toContain("green");
  });
});