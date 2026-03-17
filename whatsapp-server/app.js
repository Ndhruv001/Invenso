/**
 * PDF Service Express App
 * Lightweight, secure, memory-aware
 */

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import compression from "compression";

import helmetConfig from "./config/helmetConfig.js";
import corsOptions from "./config/corsOptions.js";
import { globalLimiter } from "./config/limiter.js";
import { getWhatsappState } from "./config/whatsappClient.js";
import { sendInvoiceOnWhatsApp, sendInvoiceSummaryToHost } from "./whatsappServices.js";

dotenv.config();

const app = express();

// ── Trust proxy (Render)
app.set("trust proxy", 1);

// ── Security
app.use(helmetConfig());
app.use(cors(corsOptions));
app.use(globalLimiter);

// ── Performance
app.use(compression());

// ── Body Parser
app.use(
  express.json({
    limit: process.env.JSON_LIMIT || "10mb",
  }),
);

// ── Health check
app.get("/whatsapp/health", (req, res) => {
  res.status(200).json({
    status: "WhatsApp service healthy",
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

app.get("/whatsapp/status", (req, res) => {
  const state = getWhatsappState();

  if (state.status === "connected") {
    return res.json({ status: "connected" });
  }

  if (state.status === "qr") {
    return res.json({
      status: "qr",
      qr: state.qr
    });
  }

  return res.json({ status: state.status });
});

app.post("/whatsapp/send-invoice", async (req, res) => {
  try {
    const result = await sendInvoiceOnWhatsApp(req.body);
    return res.json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
});
app.post("/whatsapp/send-summary-to-host", async (req, res) => {
  try {
    const result = await sendInvoiceSummaryToHost(req.body);
    return res.json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
});



// ── 404
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
  });
});

// ── Global Error
app.use((error, req, res, next) => {
  console.error("Unhandled error:", error.message);

  res.status(500).json({
    error: "Internal server error",
  });
});

export default app;
