/**
 * purchaseReturnControllers.js
 * Controllers for Purchase Return resource CRUD operations.
 * Each controller method wraps service calls with asyncHandler.
 * Uses successResponse for consistent response format.
 */

import asyncHandler from "../utils/asyncHandlerUtils.js";
import * as purchaseReturnServices from "../services/purchaseReturnServices.js";
import { successResponse } from "../utils/responseUtils.js";

/**
 * GET /purchase-returns
 * List purchase returns with filters, pagination, search, stats
 */
const listPurchaseReturns = asyncHandler(async (req, res) => {
  const { page, limit, sortBy, sortOrder, search, ...rest } = req.query;

  const query = {
    page: Number(page) || 1,
    limit: Number(limit) || 10,
    sortBy: sortBy || "createdAt",
    sortOrder: sortOrder || "desc",
    search: search || "",
    filters: rest || {} // everything else goes into filters
  };

  const result = await purchaseReturnServices.listPurchaseReturns(query);
  return successResponse(res, "Purchase returns fetched successfully", result, 200);
});

/**
 * GET /purchase-returns/:id
 * Get purchase return by ID with items and party
 */
const getPurchaseReturn = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const purchaseReturn = await purchaseReturnServices.getPurchaseReturnById(id);

  return successResponse(res, "Purchase return fetched successfully", purchaseReturn, 200);
});

/**
 * POST /purchase-returns
 * Create new purchase return with items, inventory revert, party balance update, audit log
 */
const createPurchaseReturn = asyncHandler(async (req, res) => {
  const purchaseReturnData = req.body;
  const userId = req.user?.id || null;

  const createdPurchaseReturn = await purchaseReturnServices.createPurchaseReturn(
    purchaseReturnData,
    userId
  );

  return successResponse(res, "Purchase return created successfully", createdPurchaseReturn, 201);
});

/**
 * PUT /purchase-returns/:id
 * Update purchase return with item diff, stock re-adjustment, party balance diff, audit log
 */
const updatePurchaseReturn = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const updateData = req.body;
  const userId = req.user?.id || null;

  const updatedPurchaseReturn = await purchaseReturnServices.updatePurchaseReturn(
    id,
    updateData,
    userId
  );

  return successResponse(res, "Purchase return updated successfully", updatedPurchaseReturn, 200);
});

/**
 * DELETE /purchase-returns/:id
 * Delete purchase return with stock rollback, party balance revert, audit log
 */
const deletePurchaseReturn = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const userId = req.user?.id || null;

  const deleted = await purchaseReturnServices.deletePurchaseReturn(id, userId);

  return successResponse(res, "Purchase return deleted successfully", deleted, 200);
});

export default {
  listPurchaseReturns,
  getPurchaseReturn,
  createPurchaseReturn,
  updatePurchaseReturn,
  deletePurchaseReturn
};

export {
  listPurchaseReturns,
  getPurchaseReturn,
  createPurchaseReturn,
  updatePurchaseReturn,
  deletePurchaseReturn
};
