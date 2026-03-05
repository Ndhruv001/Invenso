import asyncHandler from "../utils/asyncHandlerUtils.js";
import * as reportServices from "../services/reportServices.js";
import * as partyLedgerServices from "../services/reports/partyLedgerServices.js"
import { successResponse } from "../utils/responseUtils.js";

const generateReport = asyncHandler(async (req, res) => {
  const { module, filters } = req.query;

  const result = await reportServices.generateReport(module, JSON.parse(filters));
  return successResponse(res, "Report generated successfully", result, 200);
});

/**
 * GET /party-ledger/pdf
 * Download party ledger PDF
 */
const getPartyLedgerPdf = asyncHandler(async (req, res) => {

  const { partyId, dateFrom, dateTo } = req.query;

  if (!partyId || !dateFrom || !dateTo) {
    throw new Error("partyId, dateFrom and dateTo are required");
  }

  // Call service
  const pdfBuffer = await partyLedgerServices.getPartyLedgerPdf({
    partyId: Number(partyId),
    dateFrom,
    dateTo
  });

  // Headers for download
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=party-ledger-${partyId}.pdf`
  );

  return res.status(200).send(pdfBuffer);
});


/**
 * GET /party-ledger/print
 * Print / preview party ledger PDF
 */
const printPartyLedgerPdf = asyncHandler(async (req, res) => {

  const { partyId, dateFrom, dateTo } = req.query;

  if (!partyId || !dateFrom || !dateTo) {
    throw new Error("partyId, dateFrom and dateTo are required");
  }

  // Call service
  const pdfBuffer = await partyLedgerServices.getPartyLedgerPdf({
    partyId: Number(partyId),
    dateFrom,
    dateTo
  });

  // Headers for browser preview
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `inline; filename=party-ledger-${partyId}.pdf`
  );

  return res.status(200).send(pdfBuffer);
});

export default {generateReport, getPartyLedgerPdf, printPartyLedgerPdf};
export { generateReport, getPartyLedgerPdf, printPartyLedgerPdf };
