import pino from "pino";

export const logger = pino({
  level: process.env.LOG_LEVEL ?? (process.env.NODE_ENV === "production" ? "info" : "debug"),
  ...(process.env.NODE_ENV !== "production" && {
    transport: { target: "pino-pretty", options: { colorize: true, translateTime: "HH:MM:ss" } },
  }),
});

export function audit(userId: string, action: string, details?: Record<string, unknown>) {
  logger.info({ type: "audit", userId, action, ...details }, `[AUDIT] ${action}`);
}

export function security(event: string, details?: Record<string, unknown>) {
  logger.warn({ type: "security", event, ...details }, `[SEC] ${event}`);
}
