// utils/logger.js
import { createLogger, format, transports } from "winston";

const isProduction = process.env.NODE_ENV === "production";

const logger = createLogger({
  level: "info", // Minimum log level to capture
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.errors({ stack: true }), // Include stack trace for errors
    format.splat(),
    format.json()
  ),
  defaultMeta: { service: "invenso" },
  transports: [
    // Always log errors to a file
    new transports.File({ filename: "logs/error.log", level: "error" }),
    // Log all levels to a combined file
    new transports.File({ filename: "logs/combined.log" }),
    // Console output in development
    !isProduction &&
      new transports.Console({
        format: format.combine(format.colorize(), format.simple())
      })
  ].filter(Boolean) // Remove false/null entries
});

export default logger;
export { logger };
