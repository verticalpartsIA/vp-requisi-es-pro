import { describe, it, expect } from "vitest";

describe("AppSidebar — Navigation Structure", () => {
  const modules = [
    { title: "M1 - Produtos", url: "/products" },
    { title: "M2 - Viagens", url: "/trips" },
    { title: "M3 - Serviços", url: "/services" },
    { title: "M4 - Manutenção", url: "/maintenance" },
    { title: "M5 - Frete", url: "/freight" },
    { title: "M6 - Locação", url: "/rental" },
  ];

  const workflows = [
    { title: "V2 - Cotação", url: "/quoting" },
    { title: "V3 - Aprovação", url: "/approval" },
    { title: "V4 - Compra", url: "/purchasing" },
    { title: "V5 - Recebimento", url: "/receipt" },
  ];

  const system = [
    { title: "Dashboard", url: "/" },
    { title: "Analytics", url: "/analytics" },
    { title: "Logs", url: "/logs" },
  ];

  it("defines all 6 module links (M1–M6)", () => {
    expect(modules).toHaveLength(6);
    expect(modules.map((m) => m.url)).toEqual([
      "/products", "/trips", "/services", "/maintenance", "/freight", "/rental",
    ]);
  });

  it("defines all 4 workflow links (V2–V5)", () => {
    expect(workflows).toHaveLength(4);
    expect(workflows.map((w) => w.url)).toEqual([
      "/quoting", "/approval", "/purchasing", "/receipt",
    ]);
  });

  it("defines 3 system links", () => {
    expect(system).toHaveLength(3);
    expect(system.map((s) => s.url)).toContain("/");
    expect(system.map((s) => s.url)).toContain("/analytics");
    expect(system.map((s) => s.url)).toContain("/logs");
  });

  it("all URLs are unique", () => {
    const allUrls = [...modules, ...workflows, ...system].map((i) => i.url);
    expect(new Set(allUrls).size).toBe(allUrls.length);
  });

  it("module titles follow M{n} - Name pattern", () => {
    modules.forEach((m) => {
      expect(m.title).toMatch(/^M\d - .+$/);
    });
  });

  it("workflow titles follow V{n} - Name pattern", () => {
    workflows.forEach((w) => {
      expect(w.title).toMatch(/^V\d - .+$/);
    });
  });
});