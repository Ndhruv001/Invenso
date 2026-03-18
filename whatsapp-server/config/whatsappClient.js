import pkg from "whatsapp-web.js";
import QRCode from "qrcode";
import { createMongoAuthStrategy } from "../config/mongoAuth.js";
import path from "path";
import fs from "fs";

const { Client } = pkg;

let latestQR = null;
let whatsappStatus = "starting";

export const getWhatsappState = () => ({
  status: whatsappStatus,
  qr: latestQR,
});

const cacheDir =
  process.env.PUPPETEER_CACHE_DIR || "/opt/render/.cache/puppeteer";
const chromePath = path.join(cacheDir, "chrome");

function resolveChromePath() {
  if (!fs.existsSync(chromePath)) {
    throw new Error(`Chrome cache dir not found: ${chromePath}`);
  }
  const [versionDir] = fs.readdirSync(chromePath);
  const exe = path.join(chromePath, versionDir, "chrome-linux64", "chrome");
  console.log(`🔍 Resolved Chrome: ${exe}`);
  return exe;
}

let client;

export const initializeWhatsapp = async () => {
  console.log("🚀 Initializing WhatsApp client...");

  // ✅ Wait for MongoDB auth strategy to be ready
  const authStrategy = await createMongoAuthStrategy();

  client = new Client({
    authStrategy,
    puppeteer: {
      headless: true,
      executablePath: resolveChromePath(),
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--single-process",
        "--no-zygote",
      ],
    },
  });

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
    latestQR = null;
  });

  client.on("disconnected", (reason) => {
    console.log("⚠️ DISCONNECTED:", reason);
    whatsappStatus = "disconnected";
  });

  client.on("auth_failure", () => {
    console.log("❌ AUTH FAILURE");
    whatsappStatus = "auth_failure";
  });

  client.on("remote_session_saved", () => {
    console.log("💾 Session saved to MongoDB"); // ✅ fires automatically
  });

  client.initialize();
};

export { client };
