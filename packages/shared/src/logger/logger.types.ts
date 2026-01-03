export type LogLevel = "error" | "warn" | "info" | "http" | "debug";

export interface LogContext {
  userId?: string;
  requestId?: string;
  context?: string;
  [key: string]: unknown;
}

export interface Logger {
  error(message: string, meta?: LogContext): void;
  warn(message: string, meta?: LogContext): void;
  info(message: string, meta?: LogContext): void;
  http(message: string, meta?: LogContext): void;
  debug(message: string, meta?: LogContext): void;
  child(context: LogContext): Logger;
}
