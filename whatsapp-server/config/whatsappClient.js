import pkg from "whatsapp-web.js";
import { MongoAuth } from "./mongoAuth";
import QRCode from "qrcode";
import fs from "fs";
import path from "path";

const { Client } = pkg;

// ====== GLOBAL STATE ======
let latestQR = null;
let whatsappStatus = "starting";

export const getWhatsappState = () => ({
  status: whatsappStatus,
  qr: latestQR,
});

// Dynamically find whatever chrome version was downloaded
const cacheDir =
  process.env.PUPPETEER_CACHE_DIR || "/opt/render/.cache/puppeteer";
const chromePath = path.join(cacheDir, "chrome");

function resolveChromePath() {
  if (!fs.existsSync(chromePath)) {
    throw new Error(`Chrome cache dir not found: ${chromePath}`);
  }
  // e.g. finds "linux-146.0.7680.76"
  const [versionDir] = fs.readdirSync(chromePath);
  const exe = path.join(chromePath, versionDir, "chrome-linux64", "chrome");
  console.log(`🔍 Resolved Chrome: ${exe}`);
  console.log(`   Exists: ${fs.existsSync(exe) ? "✅ yes" : "❌ NO"}`);
  return exe;
}

// ====== CLIENT SETUP ======
export const client = new Client({
   authStrategy: new MongoAuth({
    mongoUri: process.env.MONGO_URI,   // Add this to Render environment variables
    dbName: "whatsapp",
    collectionName: "sessions",
    clientId: "my-bot",               // Use a unique name per bot instance
  }),
  puppeteer: {
    headless: true,
    executablePath: resolveChromePath(),
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--single-process", // ✅ needed for Render
      "--no-zygote", // ✅ needed for Render
    ],
  },
});

// ====== EVENTS ======

client.on("qr", async (qr) => {
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

client.on("disconnected", (reason) => {
  console.log("⚠️ DISCONNECTED:", reason);
  whatsappStatus = "disconnected";
});

client.on("auth_failure", () => {
  console.log("❌ AUTH FAILURE");
  whatsappStatus = "auth_failure";
});

// ====== INITIALIZE ======
export const initializeWhatsapp = () => {
  console.log("🚀 Initializing WhatsApp client...");
  client.initialize();
};
