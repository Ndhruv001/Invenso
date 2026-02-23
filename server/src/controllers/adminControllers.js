import asyncHandler from "../utils/asyncHandlerUtils.js";
import { processDailyWhatsAppInvoices } from "../whatsapp/whatsappSchedular.js";
import { successResponse } from "../utils/responseUtils.js";

const runWhatsAppInvoices = asyncHandler(async (req, res) => {
  console.log("🧪 Manual WhatsApp Automation Triggered");
  await processDailyWhatsAppInvoices();
  return successResponse(res, "WhatsApp invoice automation executed successfully.", {}, 201);
});

export default runWhatsAppInvoices;
export { runWhatsAppInvoices };
