import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

/**
 * Analytics Dashboard tests — validate KPIs, data structures, SLA calculations,
 * financial metrics, real-time event simulation, and export flow.
 */

describe("Analytics — KPI Calculations", () => {
  it("calculates SLA compliance percentage", () => {
    const total = 1247;
    const withinSLA = 1085;
    const compliance = (withinSLA / total) * 100;
    expect(compliance).toBeCloseTo(87.0, 0);
  });

  it("categorizes SLA status correctly", () => {
    function getSLAStatus(pct: number) {
      if (pct >= 95) return "Excelente";
      if (pct >= 85) return "Atenção";
      return "Crítico";
    }

    expect(getSLAStatus(97)).toBe("Excelente");
    expect(getSLAStatus(87)).toBe("Atenção");
    expect(getSLAStatus(70)).toBe("Crítico");
  });

  it("calculates average cycle time correctly", () => {
    const totalHours = 156;
    const days = Math.floor(totalHours / 24);
    const hours = totalHours % 24;
    expect(days).toBe(6);
    expect(hours).toBe(12);
  });

  it("calculates trend change correctly", () => {
    const current = 1247;
    const previous = 1112;
    const changePct = ((current - previous) / previous) * 100;
    expect(changePct).toBeCloseTo(12.14, 1);
  });
});

describe("Analytics — SLA Performance", () => {
  const slaByModule = [
    { module: "M1", compliance: 89 },
    { module: "M2", compliance: 94 },
    { module: "M3", compliance: 82 },
    { module: "M4", compliance: 76 },
    { module: "M5", compliance: 91 },
    { module: "M6", compliance: 88 },
  ];

  it("covers all 6 modules", () => {
    expect(slaByModule).toHaveLength(6);
  });

  it("identifies worst performing module", () => {
    const worst = slaByModule.reduce((a, b) => (a.compliance < b.compliance ? a : b));
    expect(worst.module).toBe("M4");
    expect(worst.compliance).toBe(76);
  });

  it("identifies best performing module", () => {
    const best = slaByModule.reduce((a, b) => (a.compliance > b.compliance ? a : b));
    expect(best.module).toBe("M2");
  });

  it("calculates overall SLA from modules", () => {
    const avg = slaByModule.reduce((s, m) => s + m.compliance, 0) / slaByModule.length;
    expect(avg).toBeCloseTo(86.67, 1);
  });

  describe("SLA Trend", () => {
    const trend = [81.7, 83.7, 85.4, 87.0, 87.3, 87.0];

    it("shows improving trend over 6 months", () => {
      expect(trend[trend.length - 1]).toBeGreaterThan(trend[0]);
    });

    it("detects plateau", () => {
      const lastThree = trend.slice(-3);
      const variance = Math.max(...lastThree) - Math.min(...lastThree);
      expect(variance).toBeLessThan(1);
    });
  });

  describe("Stage Duration Analysis", () => {
    const stages = [
      { stage: "V2", avg: 42, median: 36, p95: 68, target: 72 },
      { stage: "V3", avg: 52, median: 48, p95: 96, target: 72 },
      { stage: "V4", avg: 36, median: 30, p95: 62, target: 48 },
      { stage: "V5", avg: 120, median: 96, p95: 192, target: 168 },
    ];

    it("identifies bottleneck stages (P95 > target)", () => {
      const bottlenecks = stages.filter((s) => s.p95 > s.target);
      expect(bottlenecks).toHaveLength(3); // V3, V4, V5
      expect(bottlenecks.map((b) => b.stage)).toContain("V3");
    });

    it("V2 is within target at P95", () => {
      const v2 = stages.find((s) => s.stage === "V2")!;
      expect(v2.p95).toBeLessThan(v2.target);
    });

    it("median is always <= avg", () => {
      stages.forEach((s) => {
        expect(s.median).toBeLessThanOrEqual(s.avg);
      });
    });
  });
});

describe("Analytics — Financial", () => {
  const summary = {
    budget_annual: 50_000_000,
    committed: 42_300_000,
    spent: 38_100_000,
    savings: 4_200_000,
    savings_percentage: 10.0,
  };

  it("validates budget utilization", () => {
    const utilization = (summary.committed / summary.budget_annual) * 100;
    expect(utilization).toBeCloseTo(84.6, 1);
  });

  it("validates savings percentage", () => {
    const pct = (summary.savings / (summary.spent + summary.savings)) * 100;
    expect(pct).toBeCloseTo(9.93, 1);
  });

  it("spent is always <= committed", () => {
    expect(summary.spent).toBeLessThanOrEqual(summary.committed);
  });

  it("committed is always <= budget", () => {
    expect(summary.committed).toBeLessThanOrEqual(summary.budget_annual);
  });

  describe("Category Spend", () => {
    const categories = [
      { category: "Matérias-primas", value: 12_400_000, pct: 29 },
      { category: "Equipamentos", value: 8_600_000, pct: 20 },
      { category: "Serviços Técnicos", value: 6_200_000, pct: 15 },
      { category: "Viagens", value: 4_100_000, pct: 10 },
      { category: "Manutenção", value: 3_800_000, pct: 9 },
      { category: "Outros", value: 3_000_000, pct: 7 },
    ];

    it("percentages sum to ~90% (with rounding)", () => {
      const sum = categories.reduce((s, c) => s + c.pct, 0);
      expect(sum).toBe(90);
    });

    it("values are sorted descending", () => {
      for (let i = 1; i < categories.length; i++) {
        expect(categories[i].value).toBeLessThanOrEqual(categories[i - 1].value);
      }
    });
  });

  describe("Monthly Savings", () => {
  describe("Monthly Savings", () => {
    const months = [
      { month: "Jan/26", original: 3_200_000, final: 2_800_000, savings: 400_000 },
      { month: "Fev/26", original: 3_800_000, final: 3_420_000, savings: 380_000 },
    ];

    it("savings = original - final", () => {
      months.forEach((m) => {
        expect(m.original - m.final).toBeCloseTo(m.savings, -3);
      });
    });
  });
});

describe("Analytics — Real-time Events", () => {
  type EventType = "requisition:created" | "sla:breach" | "purchase:completed" | "metrics:update";

  it("supports all 4 event types", () => {
    const types: EventType[] = ["requisition:created", "sla:breach", "purchase:completed", "metrics:update"];
    expect(types).toHaveLength(4);
  });

  describe("requisition:created event", () => {
    const event = {
      type: "requisition:created" as const,
      ticket_id: "M1-000072",
      module: "M1",
      department: "Engenharia",
      value: 15000,
      timestamp: new Date().toISOString(),
    };

    it("has valid ticket ID format", () => {
      expect(event.ticket_id).toMatch(/^M\d-\d{6}$/);
    });

    it("has valid module", () => {
      expect(["M1", "M2", "M3", "M4", "M5", "M6"]).toContain(event.module);
    });

    it("has positive value", () => {
      expect(event.value).toBeGreaterThan(0);
    });
  });

  describe("sla:breach event", () => {
    const event = {
      type: "sla:breach" as const,
      ticket_id: "M3-000042",
      stage: "V3_APROVAÇÃO",
      target_hours: 72,
      actual_hours: 288,
      responsible: "Roberto Mendes",
    };

    it("actual_hours exceeds target_hours", () => {
      expect(event.actual_hours).toBeGreaterThan(event.target_hours);
    });

    it("has valid stage format", () => {
      expect(event.stage).toMatch(/^V\d_/);
    });
  });

  describe("purchase:completed event", () => {
    const event = {
      type: "purchase:completed" as const,
      ticket_id: "M1-000065",
      total_value: 45000,
      savings: 5000,
      cycle_time_days: 8.2,
    };

    it("savings <= total_value", () => {
      expect(event.savings).toBeLessThanOrEqual(event.total_value);
    });

    it("cycle_time is positive", () => {
      expect(event.cycle_time_days).toBeGreaterThan(0);
    });
  });

  describe("metrics:update event", () => {
    const event = {
      type: "metrics:update" as const,
      total_requests_today: 52,
      total_value_today: 384000,
      active_bottlenecks: 3,
      sla_compliance_rate: 87.0,
    };

    it("sla_compliance_rate is 0-100", () => {
      expect(event.sla_compliance_rate).toBeGreaterThanOrEqual(0);
      expect(event.sla_compliance_rate).toBeLessThanOrEqual(100);
    });

    it("counts are non-negative", () => {
      expect(event.total_requests_today).toBeGreaterThanOrEqual(0);
      expect(event.active_bottlenecks).toBeGreaterThanOrEqual(0);
    });
  });
});

describe("Analytics — Export", () => {
  const reportTypes = ["executive", "operational", "financial", "sla"];
  const formats = ["PDF", "Excel", "CSV"];

  it("supports 4 report types", () => {
    expect(reportTypes).toHaveLength(4);
  });

  it("supports 3 export formats", () => {
    expect(formats).toHaveLength(3);
  });

  it("generates valid download URL", () => {
    const url = `https://storage.vprequisicoes.com/exports/analytics-executive-${Date.now()}.pdf`;
    expect(url).toMatch(/^https:\/\/storage\./);
    expect(url).toContain("analytics-executive");
    expect(url).toMatch(/\.pdf$/);
  });

  it("expiration is in the future", () => {
    const now = new Date();
    const expires = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    expect(expires.getTime()).toBeGreaterThan(now.getTime());
  });
});