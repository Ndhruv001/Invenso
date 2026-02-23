import pkg from "whatsapp-web.js";
import { client } from "./whatsappClient.js";

const { MessageMedia } = pkg;

export async function sendInvoiceOnWhatsApp(invoice, pdfBuffer, type = "sale") {
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
    pdfBuffer.toString("base64"),
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
