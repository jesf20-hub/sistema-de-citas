import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { checkRateLimit } from "@/lib/rate-limit";

describe("checkRateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("permite las peticiones dentro del limite", () => {
    const key = `t-${Math.random()}`;
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit(key, 5, 60).success).toBe(true);
    }
  });

  it("bloquea al superar el limite", () => {
    const key = `t-${Math.random()}`;
    for (let i = 0; i < 3; i++) checkRateLimit(key, 3, 60);
    expect(checkRateLimit(key, 3, 60).success).toBe(false);
  });

  it("decrementa el contador de remaining", () => {
    const key = `t-${Math.random()}`;
    expect(checkRateLimit(key, 3, 60).remaining).toBe(2);
    expect(checkRateLimit(key, 3, 60).remaining).toBe(1);
    expect(checkRateLimit(key, 3, 60).remaining).toBe(0);
  });

  it("reinicia la ventana cuando expira el tiempo", () => {
    const key = `t-${Math.random()}`;
    for (let i = 0; i < 3; i++) checkRateLimit(key, 3, 60);
    expect(checkRateLimit(key, 3, 60).success).toBe(false);

    vi.advanceTimersByTime(61_000);
    expect(checkRateLimit(key, 3, 60).success).toBe(true);
  });

  it("mantiene contadores independientes por clave (ej. por IP)", () => {
    const a = `ip-a-${Math.random()}`;
    const b = `ip-b-${Math.random()}`;
    for (let i = 0; i < 3; i++) checkRateLimit(a, 3, 60);
    expect(checkRateLimit(a, 3, 60).success).toBe(false);
    expect(checkRateLimit(b, 3, 60).success).toBe(true);
  });
});
