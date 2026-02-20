import pkg from "whatsapp-web.js";
import qrcode from 'qrcode-terminal';

const { Client, LocalAuth } = pkg;

console.log("📲 Initializing WhatsApp Client...");

export const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: './sessions'
  }),
  puppeteer: {
    headless: true
  }
});

client.on('qr', (qr) => {
  console.log("🧾 QR RECEIVED — Scan this to login");
  qrcode.generate(qr, { small: true });
});

client.on('authenticated', () => {
  console.log("✅ WhatsApp Authenticated Successfully");
});

client.on('ready', () => {
  console.log("🚀 WhatsApp Client is READY to send messages");
});

client.on('auth_failure', (msg) => {
  console.error("❌ Authentication Failed:", msg);
});

client.on('disconnected', (reason) => {
  console.log("⚠️ WhatsApp Disconnected:", reason);
});

client.initialize();
