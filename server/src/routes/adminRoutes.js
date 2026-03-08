import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { runWhatsAppInvoices, runDeleteOldAuditLogsAndInventoryLogs } from "../controllers/adminControllers.js";

const router = express.Router();

router.post("/run-whatsapp-invoices", authMiddleware, runWhatsAppInvoices);
router.post("/run-delete-old-audit-and-inventory-logs", authMiddleware, runDeleteOldAuditLogsAndInventoryLogs);

export default router;
