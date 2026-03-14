import app from "./app.js";
import logger from "./config/logger.js";
import axios from "axios";

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION:", err);
});

const PORT = process.env.PORT || 3000;
const PDF_SERVICE_URL = process.env.PDF_SERVICE_URL;
const WHATSAPP_SERVICE_URL = process.env.WHATSAPP_SERVICE_URL;

app.listen(PORT, "0.0.0.0", () => {
  logger.info(
    `Server running on port ${PORT} in ${process.env.NODE_ENV} mode`
  );

  // Wake services in background (non-blocking)
  wakeServices();
});

async function wakeServices() {
  try {
    if (PDF_SERVICE_URL) {
      axios
        .get(`${PDF_SERVICE_URL}/pdf/health`, { timeout: 10000 })
        .then(() => console.log("✅ PDF service awake"))
        .catch(() => console.log("⚠️ PDF service sleeping or slow"));
    }

    if (WHATSAPP_SERVICE_URL) {
      axios
        .get(`${WHATSAPP_SERVICE_URL}/whatsapp/health`, {
          timeout: 10000,
        })
        .then(() => console.log("✅ WhatsApp service awake"))
        .catch(() =>
          console.log("⚠️ WhatsApp service sleeping or slow")
        );
    }
  } catch (error) {
    console.log("Service wake attempt failed:", error.message);
  }
}