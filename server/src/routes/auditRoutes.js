import express from "express";
const router = express.Router();

import auditControllers from "../controllers/auditControllers.js";
import authMiddleware from "../middlewares/authMiddleware.js";

router.get("/", authMiddleware, auditControllers.listAudits);

/**
 * POST /admin/run-whatsapp-invoices
 */
router.post("/run-whatsapp-invoices", async (req, res) => {
  console.log("🧪 Manual WhatsApp Automation Triggered");

  try {
    await processDailyWhatsAppInvoices();

    return res.json({
      success: true,
      message: "WhatsApp invoice automation executed successfully."
    });
  } catch (error) {
    console.error("❌ Manual trigger failed:", error);

    return res.status(500).json({
      success: false,
      message: "Automation failed.",
      error: error.message
    });
  }
});

export default router;
export { router };
