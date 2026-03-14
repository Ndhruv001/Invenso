import rateLimit from "express-rate-limit";
import { errorResponse } from "../helpers/responseHelpers.js";

const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000;

const globalLimiter = rateLimit({
  windowMs: WINDOW_MS, // 15 minutes
  max: parseInt(process.env.GLOBAL_RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for certain routes (like health checks)
  skip: req => req.originalUrl.includes("/health"),

  handler: (req, res) => {
    return errorResponse(
      res,
      "RATE_LIMIT_EXCEEDED",
      "Too many requests from this IP, please try again later.",
      null,
      {
        retryAfter: Math.ceil(WINDOW_MS / 1000)
      },
      429
    );
  }
});


export default globalLimiter;
export {globalLimiter};