import app from "./app.js";
import logger from "./config/logger.js";
import "./whatsapp/whatsappClient.js";
import "./crons/invoiceWhatsAppCrons.js";
import "./crons/auditLogCleanupCrons.js"

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});
