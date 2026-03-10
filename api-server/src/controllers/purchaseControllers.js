/**
 * purchaseControllers.js
 * Controllers for Purchase resource CRUD operations.
 * Each controller method wraps service calls with asyncHandler.
 * Uses successResponse for consistent response format.
 */

import asyncHandler from "../utils/asyncHandlerUtils.js";
import * as purchaseServices from "../services/purchaseServices.js";
import { successResponse } from "../utils/responseUtils.js";

/**
 * GET /purchases
 * List purchases with filters, pagination, search, stats
 */
const listPurchases = asyncHandler(async (req, res) => {
  const { page, limit, sortBy, sortOrder, search, ...rest } = req.query;

  const query = {
    page: Number(page) || 1,
    limit: Number(limit) || 10,
    sortBy: sortBy || "createdAt",
    sortOrder: sortOrder || "desc",
    search: search || "",
    filters: rest || {} // everything else goes into filters
  };

  const result = await purchaseServices.listPurchases(query);
  return successResponse(res, "Purchases fetched successfully", result, 200);
});

/**
 * GET /purchases/:id
 * Get purchase by ID with items and party
 */
const getPurchase = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const purchase = await purchaseServices.getPurchaseById(id);
  return successResponse(res, "Purchase fetched successfully", purchase, 200);
});

/**
 * POST /purchases
 * Create new purchase with items, payment, inventory, stock, audit log
 */
const createPurchase = asyncHandler(async (req, res) => {
  const purchaseData = req.body;
  const userId = req.user?.id || null;
  const createdPurchase = await purchaseServices.createPurchase(purchaseData, userId);
  return successResponse(res, "Purchase created successfully", createdPurchase, 201);
});

/**
 * PUT /purchases/:id
 * Update purchase with items update, payment diff, stock adjustments, audit log
 */
const updatePurchase = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const updateData = req.body;
  const userId = req.user?.id || null;
  const updatedPurchase = await purchaseServices.updatePurchase(id, updateData, userId);
  return successResponse(res, "Purchase updated successfully", updatedPurchase, 200);
});

/**
 * DELETE /purchases/:id
 * Delete purchase with stock revert, payment deletion, audit log
 */
const deletePurchase = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const userId = req.user?.id || null;
  const deleted = await purchaseServices.deletePurchase(id, userId);
  return successResponse(res, "Purchase deleted successfully", deleted, 200);
});

/**
 * GET /purchases/party-id/:partyId
 * Get purchase by Party ID with items and party
 */
const getPurchaseByPartyId = asyncHandler(async (req, res) => {
  const partyId = Number(req.params.partyId);
  const purchase = await purchaseServices.getPurchaseSuggestionsByPartyId(partyId);
  return successResponse(res, "Purchase suggestions fetched successfully", purchase, 200);
});

/**
 * GET /sales/:id/invoice
 * Generate and download sale invoice PDF
 */
const getPurchaseInvoicePdf = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);

  if (!id) {
    throw new Error("Invalid sale ID");
  }

  // Call service
  const pdfBuffer = await purchaseServices.getPurchaseInvoicePdf(id);

  // Set headers for download
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=invoice-${id}.pdf`);

  return res.status(200).send(pdfBuffer);
});
/**
 * GET /sales/:id/invoice
 * Print sale invoice PDF
 */
const printPurchaseInvoicePdf = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);

  if (!id) {
    throw new Error("Invalid sale ID");
  }

  // Call service
  const pdfBuffer = await purchaseServices.getPurchaseInvoicePdf(id);

  // Set headers for download
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename=invoice-${id}.pdf`);

  return res.status(200).send(pdfBuffer);
});

export default {
  listPurchases,
  getPurchase,
  createPurchase,
  updatePurchase,
  deletePurchase,
  getPurchaseByPartyId,
  getPurchaseInvoicePdf,
  printPurchaseInvoicePdf
};
export {
  listPurchases,
  getPurchase,
  createPurchase,
  updatePurchase,
  deletePurchase,
  getPurchaseByPartyId
};
