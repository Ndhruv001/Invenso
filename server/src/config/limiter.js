import rateLimit from "express-rate-limit";

const globalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.GLOBAL_RATE_LIMIT_MAX_REQUESTS) || 50, // limit each IP to 100 requests per windowMs
  message: {
    error: "Too many requests from this IP, please try again later.",
    retryAfter: Math.ceil((parseInt(process.env.GLOBAL_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000) / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for certain routes (like health checks)
  skip: req => {
    const skipPaths = ["/health", "/api/health"];
    return skipPaths.includes(req.path);
  }
});

const loginLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, 
  max: parseInt(process.env.LOCAL_RATE_LIMIT_MAX_REQUESTS) || 3,
  message: {
    error: "Too many login attempts. Try again later.",
    retryAfter: Math.ceil((parseInt(process.env.LOCAL_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000) / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
})

export default {globalLimiter, loginLimiter};
export { globalLimiter, loginLimiter };
