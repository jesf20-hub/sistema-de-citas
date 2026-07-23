import { describe, it, expect } from "vitest";
import { formatPrice, formatTime, formatDate, getStatusColor, DAYS } from "@/lib/utils";

describe("formatPrice", () => {
  it("formatea como pesos colombianos sin decimales", () => {
    const out = formatPrice(20000);
    expect(out).toContain("20.000");
    expect(out).not.toContain(",00");
  });

  it("formatea cero", () => {
    expect(formatPrice(0)).toContain("0");
  });
});

describe("formatTime", () => {
  it("devuelve HH:MM a partir de HH:MM:SS", () => {
    expect(formatTime("09:30:00")).toBe("09:30");
  });

  it("mantiene HH:MM intacto", () => {
    expect(formatTime("14:15")).toBe("14:15");
  });
});

describe("formatDate", () => {
  it("incluye el anio y no lanza error", () => {
    const out = formatDate("2026-01-15");
    expect(out).toContain("2026");
    expect(typeof out).toBe("string");
  });

  it("interpreta la fecha en hora local sin desfase de dia", () => {
    // 2026-01-15T00:00:00 local -> debe seguir siendo dia 15
    expect(formatDate("2026-01-15")).toContain("15");
  });
});

describe("getStatusColor", () => {
  it("devuelve una clase por cada estado conocido", () => {
    expect(getStatusColor("pendiente")).toContain("yellow");
    expect(getStatusColor("confirmada")).toContain("green");
    expect(getStatusColor("cancelada")).toContain("red");
    expect(getStatusColor("completada")).toContain("blue");
  });

  it("devuelve gris para estados desconocidos", () => {
    expect(getStatusColor("cualquier-cosa")).toContain("gray");
  });
});

describe("DAYS", () => {
  it("tiene 7 dias empezando en Domingo (indice 0)", () => {
    expect(DAYS).toHaveLength(7);
    expect(DAYS[0]).toBe("Domingo");
    expect(DAYS[6]).toBe("Sábado");
  });
});
