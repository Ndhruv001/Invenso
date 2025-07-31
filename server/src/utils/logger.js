// utils/logger.js
import { createLogger, format, transports } from 'winston'; 

const logger = createLogger({
  level: 'info', // Minimum log level to capture
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }), // Capture error stack traces
    format.splat(),
    format.json()
  ),
  defaultMeta: { service: 'invenso-api' },
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple()
      )
    }),
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' })
  ]
});

export default logger;
