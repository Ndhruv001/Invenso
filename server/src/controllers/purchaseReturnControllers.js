/**
 * purchaseReturnControllers.js
 * Controllers for PurchaseReturn resource CRUD operations.
 * Wraps service calls with asyncHandler.
 * Uses successResponse for consistent success responses.
 */

import asyncHandler from "../utils/asyncHandlerUtils.js";
import * as purchaseReturnServices from "../services/purchaseReturnServices.js";
import {successResponse} from "../utils/responseUtils.js";

/**
 * GET /purchase-returns
 * List purchase returns with pagination, filters, search, stats
 */
const listPurchaseReturns = asyncHandler(async (req, res) => {
  const query = {
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 10,
    sortBy: req.query.sortBy || "date",
    sortOrder: req.query.sortOrder || "desc",
    search: req.query.search || "",
    filters: req.query.filters || {},
  };

  if (typeof query.filters === "string") {
    try {
      query.filters = JSON.parse(query.filters);
    } catch {
      query.filters = {};
    }
  }

  const result = await purchaseReturnServices.listPurchaseReturns(query);
  return successResponse(res, "Purchase returns fetched successfully", result, 200);
});

/**
 * GET /purchase-returns/:id
 * Get purchase return by ID
 */
const getPurchaseReturn = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const purchaseReturn = await purchaseReturnServices.getPurchaseReturnById(id);
  return successResponse(res, "Purchase return fetched successfully", purchaseReturn, 200);
});

/**
 * POST /purchase-returns
 * Create purchase return with payment, inventory, party balance, audit
 */
const createPurchaseReturn = asyncHandler(async (req, res) => {
  const data = req.body;
  const userId = req.user?.id || null;
  const createdReturn = await purchaseReturnServices.createPurchaseReturn(data, userId);
  return successResponse(res, "Purchase return created successfully", createdReturn, 201);
});

/**
 * PUT /purchase-returns/:id
 * Update purchase return with payment, inventory, balance diffs, audit log
 */
const updatePurchaseReturn = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const data = req.body;
  const userId = req.user?.id || null;
  const updatedReturn = await purchaseReturnServices.updatePurchaseReturn(id, data, userId);
  return successResponse(res, "Purchase return updated successfully", updatedReturn, 200);
});

/**
 * DELETE /purchase-returns/:id
 * Delete purchase return with cleanup and audit log
 */
const deletePurchaseReturn = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const userId = req.user?.id || null;
  const deleted = await purchaseReturnServices.deletePurchaseReturn(id, userId);
  return successResponse(res, "Purchase return deleted successfully", deleted, 200);
});

/**
 * POST /purchase-returns/bulk-delete
 * Bulk delete purchase returns by IDs
 */
const bulkDeletePurchaseReturns = asyncHandler(async (req, res) => {
  const ids = req.body?.ids;
  const userId = req.user?.id || null;
  const deleted = await purchaseReturnServices.bulkDeletePurchaseReturns(ids, userId);
  return successResponse(res, "Purchase returns deleted successfully", deleted, 200);
});

export default {
  listPurchaseReturns,
  getPurchaseReturn,
  createPurchaseReturn,
  updatePurchaseReturn,
  deletePurchaseReturn,
  bulkDeletePurchaseReturns,
};
export {
  listPurchaseReturns,
  getPurchaseReturn,
  createPurchaseReturn,
  updatePurchaseReturn,
  deletePurchaseReturn,
  bulkDeletePurchaseReturns,
};
