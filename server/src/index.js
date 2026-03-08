import app from "./app.js";
import logger from "./config/logger.js";

console.log("STEP 1: Starting server");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
  console.log("STEP 2: Express started");
});

// Start background services AFTER server is alive
  await import("./whatsapp/whatsappClient.js");
  await import("./crons/invoiceWhatsAppCrons.js");
  await import("./crons/auditLogCleanupCrons.js");