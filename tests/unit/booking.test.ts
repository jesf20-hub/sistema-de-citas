import { describe, it, expect } from "vitest";
import {
  timeToMinutes,
  dayOfWeek,
  isFutureOrToday,
  durationMinutes,
  isWithinSchedule,
} from "@/lib/booking";

describe("timeToMinutes", () => {
  it("convierte HH:MM a minutos", () => {
    expect(timeToMinutes("00:00")).toBe(0);
    expect(timeToMinutes("01:30")).toBe(90);
    expect(timeToMinutes("23:59")).toBe(1439);
  });

  it("acepta HH:MM:SS ignorando los segundos", () => {
    expect(timeToMinutes("09:15:00")).toBe(555);
  });
});

describe("dayOfWeek", () => {
  it("devuelve 0 para domingo y 4 para jueves", () => {
    // 2026-01-15 es jueves; 2026-01-18 es domingo
    expect(dayOfWeek("2026-01-18")).toBe(0);
    expect(dayOfWeek("2026-01-15")).toBe(4);
  });
});

describe("isFutureOrToday", () => {
  const now = new Date("2026-01-15T12:00:00");

  it("acepta hoy", () => {
    expect(isFutureOrToday("2026-01-15", now)).toBe(true);
  });

  it("acepta una fecha futura", () => {
    expect(isFutureOrToday("2026-01-16", now)).toBe(true);
  });

  it("rechaza una fecha pasada", () => {
    expect(isFutureOrToday("2026-01-14", now)).toBe(false);
  });
});

describe("durationMinutes", () => {
  it("calcula la diferencia en minutos", () => {
    expect(durationMinutes("10:00", "11:00")).toBe(60);
    expect(durationMinutes("10:00", "10:30")).toBe(30);
  });

  it("es <= 0 cuando el fin no es posterior al inicio", () => {
    expect(durationMinutes("11:00", "11:00")).toBe(0);
    expect(durationMinutes("11:00", "10:00")).toBeLessThan(0);
  });
});

describe("isWithinSchedule", () => {
  it("acepta una cita dentro del horario", () => {
    expect(isWithinSchedule("10:00", "11:00", "09:00:00", "17:00:00")).toBe(true);
  });

  it("acepta cita que toca los limites exactos", () => {
    expect(isWithinSchedule("09:00", "17:00", "09:00:00", "17:00:00")).toBe(true);
  });

  it("rechaza cita que empieza antes de abrir", () => {
    expect(isWithinSchedule("08:30", "09:30", "09:00:00", "17:00:00")).toBe(false);
  });

  it("rechaza cita que termina despues de cerrar", () => {
    expect(isWithinSchedule("16:30", "17:30", "09:00:00", "17:00:00")).toBe(false);
  });
});
