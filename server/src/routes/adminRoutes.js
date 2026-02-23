import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { runWhatsAppInvoices } from "../controllers/adminControllers.js";

const router = express.Router();

router.post("/run-whatsapp-invoices", authMiddleware, runWhatsAppInvoices);

export default router;
