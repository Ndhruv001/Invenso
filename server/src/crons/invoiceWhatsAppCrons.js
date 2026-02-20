import cron from "node-cron";
import { processDailyWhatsAppInvoices } from "../services/invoiceAutomationServices.js";

console.log("🕒 WhatsApp Invoice Cron Initialized...");

// Runs every day at 08:00 PM
cron.schedule("0 20 * * *", async () => {
  console.log("\n⏰ Cron Triggered: WhatsApp Invoice Automation");

  try {
    await processDailyWhatsAppInvoices();
  } catch (error) {
    console.error("🔥 Cron execution failed:", error);
  }
});