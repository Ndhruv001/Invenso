import pkg from "whatsapp-web.js";
import { client } from "./config/whatsappClient.js";

const { MessageMedia } = pkg;

export async function sendInvoiceOnWhatsApp(data) {
  const { invoice, pdfBase64, type } = data;
  console.log(`📤 Preparing to send ${type} invoice ID: ${invoice.id}`);

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
    pdfBase64,
    `${type}_Invoice_${invoice.invoiceNumber || invoice.id}.pdf`
  );


  // 4️⃣ Prepare message text
  const pendingAmount =
    type === "sale"
      ? Number(invoice.totalAmount) - Number(invoice.receivedAmount)
      : Number(invoice.totalAmount) - Number(invoice.paidAmount);

  const message = `नमस्ते ${invoice.party.name}, आपका ${type === "sale" ? "बिल" : "सेल रिटर्न"} नं. ${invoice.invoiceNumber || invoice.id} भेज दिया है।  
  कुल राशि ₹${invoice.totalAmount} है, जिसमें ₹${pendingAmount} अभी बाकी है।

${invoice.type === "sale" ? "कृपया अटैच किया हुआ बिल देख लें और समय मिलने पर पेमेंट कर दें।" : "कृपया अटैच किया हुआ बिल देख लें"} 
  धन्यवाद!`;

  if (!client.info) {
    throw new Error("WhatsApp client not ready");
  }

  console.log("📝 Sending text message...");

  await client.sendMessage(chatId, message);

  console.log("📎 Sending PDF...");

  await client.sendMessage(chatId, media);

  console.log(`✅ Successfully sent invoice ID: ${invoice.id}`);

  return { success: true };
}

/**
 * Send summary message to host/admin after invoices are sent
 * @param {Number} totalInvoices - Total invoices sent successfully
 */
export async function sendInvoiceSummaryToHost(totalInvoices = 0) {
  console.log("📊 Preparing host summary message...");

  // 🔹 YOUR HOST NUMBER (CHANGE THIS)
  let hostPhone = process.env.HOST_MOBILE_NUMBER || "" // <-- put your WhatsApp number here


  // Clean number
  hostPhone = hostPhone.replace(/\D/g, "");

  const chatId = `${hostPhone}@c.us`;

  if (!client.info) {
    throw new Error("WhatsApp client not ready");
  }

  const message = `✅ Invoice Sending Completed

📦 Total Invoices Sent Successfully: ${totalInvoices}

🕒 Time: ${new Date().toLocaleString()}

Powered by Invenso`;

  console.log("📨 Sending summary to host...");

  await client.sendMessage(chatId, message);

  console.log("✅ Host summary sent");

  return { success: true };
}
