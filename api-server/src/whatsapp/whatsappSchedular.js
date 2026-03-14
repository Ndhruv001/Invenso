import {
  getTodayPendingInvoicesForWhatsApp,
  updateDBForInvoiceWhatsAppStatus,
  markWhatsAppProcessing
} from "../services/invoiceAutomationServices.js";
import { getSaleInvoicePdf } from "../services/saleServices.js";
import { getSaleReturnInvoicePdf } from "../services/saleReturnServices.js";
import axios from "axios";

let isProcessing = false;

// Random delay helper (1–7 sec)
const delayRandom = async () => {
  const randomMs = Math.floor(Math.random() * (7000 - 1000 + 1)) + 1000;
  console.log(`⏳ Waiting ${randomMs}ms before next message...`);
  return new Promise(resolve => setTimeout(resolve, randomMs));
};

export const processDailyWhatsAppInvoices = async () => {
  if (isProcessing) {
    console.log("⚠ WhatsApp automation already running. Skipping...");
    return;
  }

  isProcessing = true;
  console.log("🚀 WhatsApp Invoice Automation Started...");

  // ✅ Track counts for summary
  let successCount = 0;
  let failCount = 0;
  let limitedBatch = [];

  try {
    // 1. Fetch pending invoices
    const invoices = await getTodayPendingInvoicesForWhatsApp(50);

    if (!invoices.length) {
      console.log("✅ No pending invoices for today.");
      return;
    }

    // 2. Apply global limit
    limitedBatch = invoices.slice(0, 50);
    console.log(`📦 Processing ${limitedBatch.length} invoices...`);

    // 3. Sequential processing
    for (const invoice of limitedBatch) {
      const { id, type } = invoice;
      console.log(`\n📄 Processing ${type.toUpperCase()} ID: ${id}`);

      try {
        await markWhatsAppProcessing(id, type, true);

        // 4. Route correct PDF generator
        let pdfBuffer;
        if (type === "sale") {
          pdfBuffer = await getSaleInvoicePdf(id);
        } else if (type === "saleReturn") {
          pdfBuffer = await getSaleReturnInvoicePdf(id);
        } else {
          throw new Error(`Invalid invoice type: ${type}`);
        }

        console.log("📄 PDF generated successfully.");

        // 5. Send WhatsApp
        const WHATSAPP_SERVICE_URL = process.env.WHATSAPP_SERVICE_URL;

await axios.post(
  `${WHATSAPP_SERVICE_URL}/whatsapp/send-invoice`,
  {
    invoice,
    pdfBase64: pdfBuffer.toString("base64"),
    type
  },
);

        // 6. Update DB success
        await updateDBForInvoiceWhatsAppStatus(id, type, true);

        successCount++;
        console.log(`✅ ${type} ID ${id} completed. (${successCount} done)`);

        // 7. Random delay — skip after last invoice
        const isLast = invoice === limitedBatch[limitedBatch.length - 1];
        if (!isLast) await delayRandom();
      } catch (error) {
        failCount++;
        console.error(`❌ Failed processing ${type} ID ${id}:`, error.message);
        await updateDBForInvoiceWhatsAppStatus(id, type, false);
        console.log(`🔁 Retry count updated for ${type} ID ${id}`);
      } finally {
        // ✅ Only unmark processing for THIS invoice — NOT the global lock
        await markWhatsAppProcessing(id, type, false);
      }
    }

    console.log(`\n🎯 Automation Completed. ✅ ${successCount} succeeded, ❌ ${failCount} failed.`);
  } catch (error) {
    console.error("🔥 Critical Automation Failure:", error);
  } finally {
    // ✅ Global lock released ONCE — after ALL invoices are done
    isProcessing = false;
    console.log("🔓 Global automation lock released.");
    await sendInvoiceSummaryToHost(limitedBatch?.length, successCount, failCount);
  }
};

export default processDailyWhatsAppInvoices;
