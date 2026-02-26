// utils/logger.js
import { createLogger, format, transports } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

const isProduction = process.env.NODE_ENV === "production";

// Common format (unchanged behavior)
const logFormat = format.combine(
  format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  format.errors({ stack: true }),
  format.splat(),
  format.json()
);

// 🔥 Daily rotate for ALL logs
const combinedRotateTransport = new DailyRotateFile({
  filename: "logs/combined-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  maxSize: "20m",
  maxFiles: "14d", // keep 14 days
  zippedArchive: true
});

// 🔥 Daily rotate for ERROR logs
const errorRotateTransport = new DailyRotateFile({
  filename: "logs/error-%DATE%.log",
  level: "error",
  datePattern: "YYYY-MM-DD",
  maxSize: "20m",
  maxFiles: "30d", // keep errors longer
  zippedArchive: true
});

const logger = createLogger({
  level: "info",
  format: logFormat,
  defaultMeta: { service: "invenso" },
  transports: [
    errorRotateTransport,
    combinedRotateTransport,

    // Console only in development
    !isProduction &&
      new transports.Console({
        format: format.combine(format.colorize(), format.simple())
      })
  ].filter(Boolean)
});

export default logger;
export { logger };
