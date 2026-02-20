import pkg from "whatsapp-web.js";
import { client } from "./whatsappClient.js";
import prisma from "../config/prisma.js";

const { MessageMedia } = pkg;

export async function sendInvoiceOnWhatsApp(invoice, pdfBuffer, type = "sale") {
  console.log(`📤 Preparing to send ${type} invoice ID: ${invoice.id}`);

  try {
    // 1️⃣ Validate phone
    if (!invoice.party?.phone) {
      throw new Error("Phone number not found");
    }

    // 2️⃣ Clean phone number
    let phone = invoice.party.phone.replace(/\D/g, "");

    // Add country code if missing (India default 91)
    if (phone.length === 10) {
      phone = `91${phone}`;
    }

    const chatId = `${phone}@c.us`;

    console.log("📞 Sending to:", chatId);

    // 3️⃣ Create PDF media from buffer
    const media = new MessageMedia(
      "application/pdf",
      pdfBuffer.toString("base64"),
      `${type}_Invoice_${invoice.invoiceNumber || invoice.id}.pdf`
    );

    // 4️⃣ Prepare message text
    const pendingAmount =
      type === "sale"
        ? Number(invoice.totalAmount) - Number(invoice.receivedAmount)
        : Number(invoice.totalAmount) - Number(invoice.paidAmount);

    const message = `
Hello ${invoice.party.name},

Your ${type === "sale" ? "Invoice" : "Sale Return"} 
No: ${invoice.invoiceNumber || invoice.id}

Total Amount: ₹${invoice.totalAmount}
Pending Amount: ₹${pendingAmount}

Thank you 🙏
    `;

    if (!client.info) {
      throw new Error("WhatsApp client not ready");
    }

    console.log("📝 Sending text message...");

    await client.sendMessage(chatId, message);

    console.log("📎 Sending PDF...");

    await client.sendMessage(chatId, media);

    console.log(`✅ Successfully sent invoice ID: ${invoice.id}`);

    return { success: true };
  } catch (error) {
    console.error(`❌ Failed sending invoice ID: ${invoice.id}`, error.message);

    return {
      success: false,
      error: error.message
    };
  }
}

export const updateDBForInvoiceWhatsAppStatus = async (id, type, isSuccess) => {
  console.log(`🛠 Updating DB for ${type} ID: ${id}`);

  try {
    const model = type === "sale" ? prisma.sale : prisma.saleReturn;

    if (!model) {
      throw new Error("Invalid invoice type");
    }

    if (isSuccess) {
      await model.update({
        where: { id },
        data: {
          whatsappSent: true,
          whatsappSentAt: new Date(),
          whatsappRetryCount: 0,
          whatsappProcessing: false
        }
      });

      console.log(`✅ ${type} ID ${id} marked as SENT.`);
    } else {
      await model.update({
        where: { id },
        data: {
          whatsappRetryCount: {
            increment: 1
          },
          whatsappProcessing: false
        }
      });

      console.log(`🔁 ${type} ID ${id} retry incremented.`);
    }
  } catch (error) {
    console.error(`❌ DB update failed for ${type} ID ${id}`, error);
    throw error;
  }
};

export const markInvoiceAsProcessing = async (id, type) => {
  try {
    const model = type === "sale" ? prisma.sale : prisma.saleReturn;

    if (!model) {
      throw new Error("Invalid invoice type");
    }

    await model.update({
      where: { id },
      data: {
        whatsappProcessing: true
      }
    });
  } catch (error) {
    console.error(`❌ DB update failed for ${type} ID ${id}`, error);
    throw error;
  }
};
