import {
  getTodayPendingInvoicesForWhatsApp,
  updateDBForInvoiceWhatsAppStatus,
  markWhatsAppProcessing
} from "../services/invoiceAutomationServices.js";
import { getSaleInvoicePdf } from "../services/saleServices.js";
import { getSaleReturnInvoicePdf } from "../services/saleReturnServices.js";
import { sendInvoiceOnWhatsApp, sendInvoiceSummaryToHost } from "./whatsappSender.js";

let isProcessing = false;

// Random delay helper (1–7 sec)
const delayRandom = async () => {
  const randomMs = Math.floor(Math.random() * (7000 - 1000 + 1)) + 1000;
  console.log(`⏳ Waiting ${randomMs} ms before next message...`);
  return new Promise(resolve => setTimeout(resolve, randomMs));
};

export const processDailyWhatsAppInvoices = async () => {
  if (isProcessing) {
    console.log("⚠ WhatsApp automation already running. Skipping...");
    return;
  }

  isProcessing = true;
  console.log("🚀 WhatsApp Invoice Automation Started...");

  try {
    // 1️⃣ Fetch pending invoices
    const invoices = await getTodayPendingInvoicesForWhatsApp(50);

    if (!invoices.length) {
      console.log("✅ No pending invoices for today.");
      return;
    }

    // 3️⃣ Strict global limit (50 total)
    const limitedBatch = invoices.slice(0, 50);

    console.log(`📦 Processing ${limitedBatch.length} invoices (Global Limit Applied)`);

    // 4️⃣ Sequential processing
    for (const invoice of limitedBatch) {
      const { id, type } = invoice;

      console.log(`\n📄 Processing ${type.toUpperCase()} ID: ${id}`);

      try {
        await markWhatsAppProcessing(id, type, true);

        let pdfBuffer;

        // 5️⃣ Route correct PDF generator
        if (type === "sale") {
          pdfBuffer = await getSaleInvoicePdf(id);
        } else if (type === "saleReturn") {
          pdfBuffer = await getSaleReturnInvoicePdf(id);
        } else {
          throw new Error("Invalid invoice type");
        }

        console.log("📄 PDF generated successfully.");

        // 6️⃣ Send WhatsApp
        await sendInvoiceOnWhatsApp(invoice, pdfBuffer, type);

        // 7️⃣ Update DB success
        await updateDBForInvoiceWhatsAppStatus(id, type, true);

        console.log(`✅ ${type} ID ${id} completed successfully.`);

        // 8️⃣ Random delay (human-like)
        await delayRandom();
      } catch (error) {
        console.error(`❌ Failed processing ${type} ID ${id}:`, error.message);

        // 9️⃣ Increment retry count
        await updateDBForInvoiceWhatsAppStatus(id, type, false);

        console.log(`🔁 Retry count updated for ${type} ID ${id}`);
      } finally {
        isProcessing = false;
        await markWhatsAppProcessing(id, type, false);
        console.log("🔓 Automation lock released.");
      }
    }

    console.log("\n🎯 WhatsApp Invoice Automation Completed Successfully.");
  } catch (error) {
    console.error("🔥 Critical Automation Failure:", error);
  } finally {
    isProcessing = false;
    await sendInvoiceSummaryToHost(limitedBatch?.length);
    console.log("🔓 Automation lock released, due to end of all invoices.");
  }
};

export default processDailyWhatsAppInvoices;
