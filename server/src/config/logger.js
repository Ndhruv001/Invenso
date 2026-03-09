// utils/logger.js
import { createLogger, format, transports } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

const logFormat = format.combine(
  format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  format.errors({ stack: true }),
  format.splat(),
  format.json()
);

// 🔥 Daily rotate for ALL logs (local backup only)
const combinedRotateTransport = new DailyRotateFile({
  filename: "logs/combined-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  maxSize: "20m",
  maxFiles: "14d",
  zippedArchive: true
});

// 🔥 Daily rotate for ERROR logs
const errorRotateTransport = new DailyRotateFile({
  filename: "logs/error-%DATE%.log",
  level: "error",
  datePattern: "YYYY-MM-DD",
  maxSize: "20m",
  maxFiles: "30d",
  zippedArchive: true
});

// ✅ ALWAYS log to console (important for Render)
const consoleTransport = new transports.Console({
  format: format.combine(
    format.colorize(),
    format.printf(({ level, message, timestamp, stack }) => {
      return `${timestamp} [${level}]: ${stack || message}`;
    })
  )
});

const logger = createLogger({
  level: "info",
  format: logFormat,
  defaultMeta: { service: "invenso" },
  transports: [
    consoleTransport, // 🔥 Required for Render logs
    errorRotateTransport, // Optional local file logs
    combinedRotateTransport
  ]
});

export default logger;
export { logger };
