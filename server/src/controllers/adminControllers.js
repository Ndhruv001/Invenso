import asyncHandler from "../utils/asyncHandlerUtils.js";
import { processDailyWhatsAppInvoices } from "../whatsapp/whatsappSchedular.js";
import {  deleteOldAuditLogsAndInventoryLogs } from "../services/auditServices.js";
import { successResponse } from "../utils/responseUtils.js";

const runWhatsAppInvoices = asyncHandler(async (req, res) => {
  console.log("🧪 Manual WhatsApp Automation Triggered");
  await processDailyWhatsAppInvoices();
  return successResponse(res, "WhatsApp invoice automation executed successfully.", {}, 201);
});

const runDeleteOldAuditLogsAndInventoryLogs = asyncHandler(async (req, res) => {
  await deleteOldAuditLogsAndInventoryLogs();
  return successResponse(res, "Delete old audit logs successfully.", {}, 201);
});

export default {runWhatsAppInvoices, runDeleteOldAuditLogsAndInventoryLogs};
export { runWhatsAppInvoices, runDeleteOldAuditLogsAndInventoryLogs };
