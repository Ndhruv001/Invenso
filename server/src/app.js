/**
 * Main Express Application
 * Security, logging, validation, consistent responses, performance.
 */
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from 'cookie-parser'
import corsOptions from "./config/corsOptions.js";
import helmetConfig from "./config/helmetConfig.js";
import { globalLimiter } from "./config/limiter.js";
import compressionConfig from "./config/compressionConfig.js";
import morganConfig from "./config/morganConfig.js";
import logger from "./config/logger.js";

import requestContext from "./middlewares/requestContext.js";
import { successResponse, errorResponse } from "./utils/responseUtils.js";
import prisma from "./config/prisma.js";

dotenv.config();

const app = express();

// Behind reverse proxies (nginx, load balancer)
app.set("trust proxy", process.env.TRUST_PROXY === "true");

// ── Security
app.use(helmetConfig());
app.use(cors(corsOptions));
app.use(globalLimiter);
app.use(cookieParser());

// ── Performance
app.use(compressionConfig);

// ── Body Parsers
app.use(express.json({
  limit: process.env.JSON_LIMIT || "10mb",
  verify: (req, res, buf) => { req.rawBody = buf; }
}));
app.use(express.urlencoded({
  extended: true,
  limit: process.env.URL_ENCODED_LIMIT || "10mb"
}));

// ── Access Logs
app.use(morganConfig);

// ── Request Context (logger, requestId, prisma, trace headers)
app.use(requestContext);

// ── Favicon noise avoidance
app.get("/favicon.ico", (req, res) => res.status(204).set("Cache-Control", "public, max-age=86400").end());

const BASE = `${process.env.BASE_URL}/${process.env.API_VERSION}`;

// Routes
import  authRoutes  from "./routes/authRoutes.js";
import  productRoutes  from "./routes/productRoutes.js";

import  categoryRoutes  from "./routes/categoryRoutes.js";
import  partyRoutes  from "./routes/partyRoutes.js";
import  paymentRoutes  from "./routes/paymentRoutes.js";
import  expenseRoutes  from "./routes/expenseRoutes.js";
import  transportRoutes  from "./routes/transportRoutes.js";
import  adjustStockRoutes  from "./routes/adjustStockRoutes.js";

import  saleRoutes  from "./routes/saleRoutes.js";
import  saleReturnRoutes  from "./routes/saleReturnRoutes.js";
import  purchaseRoutes  from "./routes/purchaseRoutes.js";
import  purchaseReturnRoutes  from "./routes/purchaseReturnRoutes.js";

import  inventoryRoutes  from "./routes/inventoryRoutes.js";
import  auditRoutes  from "./routes/auditRoutes.js";

app.use(`${BASE}/auth`, authRoutes);
app.use(`${BASE}/products`, productRoutes);

app.use(`${BASE}/categories`, categoryRoutes);
app.use(`${BASE}/parties`, partyRoutes);
app.use(`${BASE}/payments`, paymentRoutes);
app.use(`${BASE}/expenses`, expenseRoutes);
app.use(`${BASE}/transports`, transportRoutes);
app.use(`${BASE}/adjustments`, adjustStockRoutes);
app.use(`${BASE}/sales`, saleRoutes);
app.use(`${BASE}/sale-returns`, saleReturnRoutes);
app.use(`${BASE}/purchases`, purchaseRoutes);
app.use(`${BASE}/purchase-returns`, purchaseReturnRoutes);
app.use(`${BASE}/inventories`, inventoryRoutes);
app.use(`${BASE}/audits`, auditRoutes);


// ── Health Check (uses successResponse)
app.get("/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return successResponse(res, "healthy", {
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.NPM_PACKAGE_VERSION || "1.0.0",
      database: "connected"
    }, 200);
  } catch (error) {
    req.logger.error("Health check failed:", { error: error.message });
    return errorResponse(res, "SERVICE_UNAVAILABLE", "Database connection failed", error.stack, null, 503);
  }
});

// ── Root (uses successResponse)
app.get("/", (req, res) => {
  return successResponse(res, "API Server is running", {
    version: process.env.NPM_PACKAGE_VERSION || "1.0.0",
    environment: process.env.NODE_ENV
  }, 200);
});

// ── 404 Handler (forward to error handler)
app.use((req, res, next) => {
  const err = new Error(`The requested resource ${req.originalUrl} was not found on this server.`);
  err.status = 404;
  err.code = "NOT_FOUND";
  next(err);
});

// ── Global Error Handler (ALWAYS uses errorResponse)
app.use((error, req, res, next) => {
  const statusCode = error.status || error.statusCode || 500;

  req.logger.error("Unhandled error", {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    ua: req.get("User-Agent")
  });

  return errorResponse(
    res,
    error.code || "INTERNAL_SERVER_ERROR",
    process.env.NODE_ENV === "development" ? error.message : "Something went wrong",
    process.env.NODE_ENV === "development" ? error.stack : null,
    error.fields || null,
    statusCode
  );
});

// ── Graceful Shutdown
const gracefulShutdown = async signal => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  try {
    await prisma.$disconnect();
    logger.info("Database connection closed.");
    process.exit(0);
  } catch (error) {
    logger.error("Error during shutdown:", { error: error.message });
    process.exit(1);
  }
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("uncaughtException", error => {
  logger.error("Uncaught Exception:", { error: error.message, stack: error.stack });
  gracefulShutdown("uncaughtException");
});
process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection", { reason, promise });
  gracefulShutdown("unhandledRejection");
});

export default app;
export { app };
