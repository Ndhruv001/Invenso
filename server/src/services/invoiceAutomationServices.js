import prisma from "../config/prisma.js";
import {
  updateDBForInvoiceWhatsAppStatus,
  sendInvoiceOnWhatsApp,
  markInvoiceAsProcessing
} from "../whatsapp/whatsappSender.js";
import { getSaleInvoicePdf } from "./saleServices.js";
import { getSaleReturnInvoicePdf } from "./saleReturnServices.js";

export const getTodayPendingInvoicesForWhatsApp = async limit => {
  console.log("🔍 Starting WhatsApp Invoice Selection...");

  const now = new Date();

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  console.log("📅 Date Range:", startOfToday, "to", endOfToday);

  // Fetch today's sales
  const todaySales = await prisma.sale.findMany({
    where: {
      date: {
        gte: startOfToday,
        lte: endOfToday
      },
      whatsappSent: false,
      whatsappRetryCount: {
        lt: 3
      },
      whatsappProcessing: false,
      party: {
        name: {
          not: {
            equals: "cash"
          }
        },
        phone: {
          not: null
        }
      }
    },
    take: limit,
    include: {
      party: true
    }
  });

  // Filter unpaid / partial
  const pendingSales = todaySales.filter(
    sale => Number(sale.receivedAmount) < Number(sale.totalAmount)
  );

  console.log(`🧾 Pending SALES after payment filter: ${pendingSales.length}`);

  // Fetch today's sale returns
  const todaySaleReturns = await prisma.saleReturn.findMany({
    where: {
      date: {
        gte: startOfToday,
        lte: endOfToday
      },
      whatsappSent: false,
      whatsappRetryCount: {
        lt: 3
      },
      whatsappProcessing: false,
      party: {
        name: {
          not: {
            equals: "cash"
          }
        },
        phone: {
          not: null
        }
      }
    },
    take: limit,
    include: {
      party: true,
      sale: true
    }
  });

  const pendingSaleReturns = todaySaleReturns.filter(
    sr => Number(sr.paidAmount) < Number(sr.totalAmount)
  );

  console.log(`🔁 Pending SALE RETURNS after payment filter: ${pendingSaleReturns.length}`);

  console.log("✅ Invoice Selection Completed");

  const sales = pendingSales;
  const saleReturns = pendingSaleReturns;

  return [
    ...sales.map(s => ({ ...s, type: "sale" })),
    ...saleReturns.map(r => ({ ...r, type: "saleReturn" }))
  ];
};

// Random delay helper (1–7 sec)
const delayRandom = async () => {
  const randomMs = Math.floor(Math.random() * (7000 - 1000 + 1)) + 1000;
  console.log(`⏳ Waiting ${randomMs} ms before next message...`);
  return new Promise(resolve => setTimeout(resolve, randomMs));
};

let isProcessing = false;

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
        await markInvoiceAsProcessing(id, type);

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
        console.log("🔓 Automation lock released.");
      }
    }

    console.log("\n🎯 WhatsApp Invoice Automation Completed Successfully.");
  } catch (error) {
    console.error("🔥 Critical Automation Failure:", error);
  }
};

export default { getTodayPendingInvoicesForWhatsApp, processDailyWhatsAppInvoices };
