import express from "express";
import axios from "axios";

const router = express.Router();

const WHATSAPP_SERVICE_URL = process.env.WHATSAPP_SERVICE_URL;

// Get WhatsApp connection status
router.get("/status", async (req, res) => {
  try {
    const response = await axios.get(`${WHATSAPP_SERVICE_URL}/whatsapp/status`);
    console.log("🚀 ~ response:", response);

    return res.json(response?.data);
  } catch (error) {
    console.error("WhatsApp service error:", error.message);

    return res.status(503).json({
      status: "unavailable",
      message: "WhatsApp service not reachable"
    });
  }
});

export default router;
