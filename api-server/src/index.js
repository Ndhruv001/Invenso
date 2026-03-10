import app from "./app.js";
import logger from "./config/logger.js";

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION:", err);
});

console.log("STEP 1: Starting server");

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", async () => {
  logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
  console.log("STEP 2: Express started");

  try {
    console.log("Loading WhatsApp Client...");
    // await import("./whatsapp/whatsappClient.js");

    console.log("Loading Invoice Cron...");
    await import("./crons/invoiceWhatsAppCrons.js");

    console.log("Loading Audit Cron...");
    await import("./crons/auditLogCleanupCrons.js");

    console.log("All background services started successfully");
  } catch (err) {
    console.error("BACKGROUND SERVICE FAILED:", err);
  }
});