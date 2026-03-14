import pkg from "whatsapp-web.js";
import QRCode from "qrcode";

const { Client, LocalAuth } = pkg;

// ====== GLOBAL STATE ======
let latestQR = null;
let whatsappStatus = "starting";

export const getWhatsappState = () => ({
  status: whatsappStatus,
  qr: latestQR
});

// ====== CLIENT SETUP ======
export const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: "./sessions"
  }),
  puppeteer: {
    headless: true,
    executablePath: puppeteer.executablePath(), // ✅ reads PUPPETEER_CACHE_DIR
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--single-process",  // ✅ needed for Render
      "--no-zygote"        // ✅ needed for Render
    ]
  }
});

// ====== EVENTS ======

client.on("qr", async qr => {
  console.log("🧾 QR RECEIVED");

  whatsappStatus = "qr";

  latestQR = await QRCode.toDataURL(qr);
});

client.on("authenticated", () => {
  console.log("✅ AUTHENTICATED");
  whatsappStatus = "authenticated";
});

client.on("ready", () => {
  console.log("🚀 READY");
  whatsappStatus = "connected";
  latestQR = null; // remove old QR
});

client.on("disconnected", reason => {
  console.log("⚠️ DISCONNECTED:", reason);
  whatsappStatus = "disconnected";
});

client.on("auth_failure", () => {
  console.log("❌ AUTH FAILURE");
  whatsappStatus = "auth_failure";
});

// ====== INITIALIZE ======
export const initializeWhatsapp = () => {
  client.initialize();
};
