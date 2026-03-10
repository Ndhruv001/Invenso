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

import { generatePdfFromTemplate } from "./pdfServices.js";

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
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "PDF service healthy",
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

// ── PDF Route
app.post("/generate-pdf", async (req, res) => {
  let pdfBuffer;

  try {
    const { templateName, data } = req.body;

    if (!templateName) {
      return res.status(400).json({
        error: "templateName is required",
      });
    }

    console.log("Generating PDF...");
    pdfBuffer = await generatePdfFromTemplate(templateName, data);
     console.log("PDF GENERATED SUCCESSFULLY");

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=document.pdf",
      "Content-Length": pdfBuffer.length,
    });

    return res.send(pdfBuffer);
  } catch (error) {
    console.error("PDF generation failed:", error.message);

    return res.status(500).json({
      error: "PDF generation failed",
    });
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
