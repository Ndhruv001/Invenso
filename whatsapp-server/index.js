import app from "./app.js";
import {initializeWhatsapp} from "./config/whatsappClient.js"

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`WhatsApp Service running on port ${PORT}`);
  initializeWhatsapp();
});

// Graceful shutdown
const shutdown = signal => {
  console.log(`Received ${signal}. Shutting down...`);
  server.close(() => {
    process.exit(0);
  });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));