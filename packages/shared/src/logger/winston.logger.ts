import winston from "winston";
import { Logger, LogContext } from "./logger.types";

const logLevel = process.env.LOG_LEVEL || "info";

class WinstonLogger implements Logger {
  private logger: winston.Logger;
  private defaultContext: LogContext;

  constructor(defaultContext: LogContext = {}) {
    this.defaultContext = defaultContext;
    this.logger = winston.createLogger({
      level: logLevel,
      defaultMeta: defaultContext,
      format: winston.format.combine(
        winston.format.timestamp({ format: "HH:mm:ss" }),
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : "";
          return `${timestamp} [${level}]: ${message}${metaStr}`;
        })
      ),
      transports: [
        new winston.transports.Console(),
      ],
    });
  }

  error(message: string, meta?: LogContext): void {
    this.logger.error(message, meta);
  }

  warn(message: string, meta?: LogContext): void {
    this.logger.warn(message, meta);
  }

  info(message: string, meta?: LogContext): void {
    this.logger.info(message, meta);
  }

  http(message: string, meta?: LogContext): void {
    this.logger.http(message, meta);
  }

  debug(message: string, meta?: LogContext): void {
    this.logger.debug(message, meta);
  }

  child(context: LogContext): Logger {
    const mergedContext = { ...this.defaultContext, ...context };
    return new WinstonLogger(mergedContext);
  }
}

export const createLogger = (defaultContext?: LogContext): Logger => {
  return new WinstonLogger(defaultContext);
};

export const logger = createLogger({ service: "booking-app" });

