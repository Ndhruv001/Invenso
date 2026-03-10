import crypto from "crypto";
import logger from "../config/logger.js";

function requestContext(req, res, next) {
  req.startTime = process.hrtime.bigint();

  const requestId = crypto.randomUUID();
  req.requestId = requestId;

  res.locals.requestId = requestId;

  req.logger = logger.child({ requestId });

  res.setHeader("X-Request-ID", requestId);

  // Auto log on start
  req.logger.info(
    {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      ua: req.get("User-Agent")
    },
    "Incoming request"
  );

  // Auto log on finish with duration
  res.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - req.startTime) / 1_000_000;
    req.logger.info(
      {
        statusCode: res.statusCode,
        durationMs: +durationMs.toFixed(2)
      },
      "Request completed"
    );
  });

  next();
}

export default requestContext;
export { requestContext };
