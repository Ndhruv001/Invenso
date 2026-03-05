// routes/productRoutes.js

import express from "express";
const router = express.Router();

import authMiddleware from "../middlewares/authMiddleware.js";
import {generateReport, getPartyLedgerPdf, printPartyLedgerPdf} from "../controllers/reportControllers.js";

router.get("/download/party-ledger", getPartyLedgerPdf);
router.get("/print/party-ledger", printPartyLedgerPdf);

router.get("/", authMiddleware, generateReport);

export default router;
export { router as productRouter };
