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
    format.timestamp(),
    format.colorize(),
    format.printf(({ level, message, timestamp, stack, ...meta }) => {
      let log = stack || message;

      // If message is object, stringify it
      if (typeof message === "object") {
        log = JSON.stringify(message, null, 2);
      }

      // If extra metadata exists, stringify it too
      if (Object.keys(meta).length) {
        log += "\n" + JSON.stringify(meta, null, 2);
      }

      return `${timestamp} [${level}]: ${log}`;
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
