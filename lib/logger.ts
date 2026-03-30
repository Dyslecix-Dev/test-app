// NOTE: structured logger for server-side code.
// Outputs JSON in production for easy parsing by log aggregators (Datadog, Axiom, etc.) and human-readable output in development.

// Usage:
// ```ts
// import { logger } from "@/lib/logger";
// logger.info("User signed up", { userId: "abc-123", email: "user@example.com" });
// logger.warn("Rate limit approaching", { ip: "1.2.3.4", remaining: 2 });
// logger.error("Failed to send email", { error: err.message, to: "user@example.com" });
// ```

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  [key: string]: unknown;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const envLevel = process.env.LOG_LEVEL;
const validLevel = envLevel && envLevel in LOG_LEVELS ? (envLevel as LogLevel) : undefined;
const MIN_LEVEL = LOG_LEVELS[validLevel ?? (process.env.NODE_ENV === "production" ? "info" : "debug")];

function log(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  if (LOG_LEVELS[level] < MIN_LEVEL) return;

  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...meta,
  };

  const isProduction = process.env.NODE_ENV === "production";
  const output = isProduction ? JSON.stringify(entry) : `[${entry.level.toUpperCase()}] ${entry.message}${meta ? " " + JSON.stringify(meta) : ""}`;

  if (level === "error") {
    console.error(output);
  } else if (level === "warn") {
    console.warn(output);
  } else {
    console.log(output);
  }
}

export const logger = {
  debug: (message: string, meta?: Record<string, unknown>) => log("debug", message, meta),
  info: (message: string, meta?: Record<string, unknown>) => log("info", message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => log("warn", message, meta),
  error: (message: string, meta?: Record<string, unknown>) => log("error", message, meta),
};
