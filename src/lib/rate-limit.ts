/**
 * Rate limit en memoria con respaldo opcional en archivo JSON.
 *
 * Producción: reemplazar por Redis (ver docs abajo).
 * Mientras tanto, usar archivo ayuda en reinicios de serverless.
 *
 * @example Redis (solo como referencia):
 *  const redis = new Redis(process.env.REDIS_URL!);
 *  export async function checkRateLimitRedis(key, limit, windowSec) {
 *    const count = await redis.incr(`rl:${key}`);
 *    if (count === 1) await redis.expire(`rl:${key}`, windowSec);
 *    return { success: count <= limit, remaining: Math.max(0, limit - count) };
 *  }
 */

import { logger } from "@/lib/logger";
import { writeFileSync, readFileSync, existsSync } from "node:fs";

const store = new Map<string, { count: number; resetAt: number }>();

// Persistencia opcional en archivo para serverless (se pierde entre deploys
// fríos, pero sobrevive a reinicios en caliente del mismo contenedor).
const DUMP_PATH = process.env.RATE_LIMIT_DUMP ?? "";

let cleanupTimer: ReturnType<typeof setInterval> | null = null;
const CLEANUP_MS = 5 * 60 * 1000; // cada 5 minutos

function scheduleCleanup() {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    let cleaned = 0;
    for (const [key, entry] of store) {
      if (now > entry.resetAt) {
        store.delete(key);
        cleaned++;
      }
    }
    if (cleaned > 0) {
      logger.debug({ cleaned }, "rate_limit_cleanup");
    }
    saveDump();
  }, CLEANUP_MS);
  // No bloquea el process exit.
  if (cleanupTimer && typeof cleanupTimer === "object") {
    cleanupTimer.unref();
  }
}

function saveDump() {
  if (!DUMP_PATH) return;
  try {
    const obj: Record<string, { count: number; resetAt: number }> = {};
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now <= entry.resetAt) {
        obj[key] = entry;
      }
    }
    writeFileSync(DUMP_PATH, JSON.stringify(obj), "utf-8");
  } catch {
    // No interrumpir la app si falla el dump.
  }
}

function loadDump() {
  if (!DUMP_PATH || !existsSync(DUMP_PATH)) return;
  try {
    const raw = readFileSync(DUMP_PATH, "utf-8");
    const obj = JSON.parse(raw);
    const now = Date.now();
    for (const [key, entry] of Object.entries(obj)) {
      const e = entry as { count: number; resetAt: number };
      if (now <= e.resetAt) {
        store.set(key, e);
      }
    }
    logger.info({ entries: store.size }, "rate_limit_dump_loaded");
  } catch {
    // Archivo corrupto; arrancar limpio.
  }
}

// Carga inicial
loadDump();
scheduleCleanup();

export function checkRateLimit(
  key: string,
  limit: number,
  windowSec: number
): { success: boolean; remaining: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowSec * 1000 });
    return { success: true, remaining: limit - 1 };
  }

  if (entry.count >= limit) {
    // Evento de seguridad: rate limit alcanzado.
    logger.warn(
      { key, limit, windowSec, count: entry.count },
      "rate_limit_exceeded"
    );
    return { success: false, remaining: 0 };
  }

  entry.count++;
  return { success: true, remaining: limit - entry.count };
}
