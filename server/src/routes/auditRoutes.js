import express from "express";
const router = express.Router();

import auditControllers from "../controllers/auditControllers.js";
import authMiddleware from "../middlewares/authMiddleware.js";

router.get(
  "/",
  authMiddleware,
  auditControllers.listAudits
);

export default router;
export { router };
