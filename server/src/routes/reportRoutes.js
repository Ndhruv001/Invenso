// routes/productRoutes.js

import express from "express";
const router = express.Router();

import authMiddleware from "../middlewares/authMiddleware.js";
import {generateReport, getPartyLedgerPdf, printPartyLedgerPdf, getTransportLedgerPdf, printTransportLedgerPdf} from "../controllers/reportControllers.js";

router.get("/download/party-ledger", getPartyLedgerPdf);
router.get("/print/party-ledger", printPartyLedgerPdf);

//TRANSPORT ROUTES
router.get("/download/transport-ledger", getTransportLedgerPdf);
router.get("/print/transport-ledger", printTransportLedgerPdf);

router.get("/", authMiddleware, generateReport);

export default router;
export { router as productRouter };
