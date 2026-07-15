/**
 * Logging utilities for server-side monitoring
 * Provides structured logging for debugging and monitoring
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogContext {
  timestamp: string;
  level: LogLevel;
  message: string;
  route?: string;
  userId?: string;
  ip?: string;
  data?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

/**
 * Convert error to structured format
 */
function formatError(error: unknown): LogContext["error"] {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }
  if (error && typeof error === "object") {
    // Supabase/PostgREST errors (and similar plain-object errors) are not
    // Error instances — String(error) collapses them to "[object Object]"
    // and throws away the actual code/details/hint. Serialize instead.
    try {
      return { name: "Unknown", message: JSON.stringify(error) };
    } catch {
      return { name: "Unknown", message: String(error) };
    }
  }
  return {
    name: "Unknown",
    message: String(error),
  };
}

/**
 * Log to console with structured format
 */
function logToConsole(context: LogContext): void {
  const { timestamp, level, message, route, userId, ip, data, error } = context;

  const prefix = `[${timestamp}] [${level.toUpperCase()}]${route ? ` [${route}]` : ""}`;

  if (level === "error") {
    console.error(prefix, message, { userId, ip, data, error });
  } else if (level === "warn") {
    console.warn(prefix, message, { userId, ip, data });
  } else if (level === "info") {
    console.log(prefix, message, { userId, ip, ...(data && { data }) });
  } else {
    if (process.env.DEBUG === "true") {
      console.debug(prefix, message, { userId, ip, data });
    }
  }
}

/**
 * Log a message with context
 */
export function log(
  level: LogLevel,
  message: string,
  context?: {
    route?: string;
    userId?: string;
    ip?: string;
    data?: Record<string, unknown>;
    error?: unknown;
  },
): void {
  const logContext: LogContext = {
    timestamp: new Date().toISOString(),
    level,
    message,
    route: context?.route,
    userId: context?.userId,
    ip: context?.ip,
    data: context?.data,
    error: context?.error ? formatError(context.error) : undefined,
  };

  logToConsole(logContext);

  // TODO: Send to external logging service (Sentry, LogRocket, etc.)
  // if (process.env.EXTERNAL_LOG_URL) {
  //   sendToExternalLogger(logContext);
  // }
}

export const logger = {
  debug: (message: string, context?: Parameters<typeof log>[2]) =>
    log("debug", message, context),
  info: (message: string, context?: Parameters<typeof log>[2]) => log("info", message, context),
  warn: (message: string, context?: Parameters<typeof log>[2]) => log("warn", message, context),
  error: (message: string, context?: Parameters<typeof log>[2]) => log("error", message, context),
};
