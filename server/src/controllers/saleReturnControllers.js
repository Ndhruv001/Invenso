/**
 * saleReturnControllers.js
 * Controllers for SaleReturn resource CRUD operations.
 * Each controller method wraps service calls with asyncHandler.
 * Uses successResponse for consistent response format.
 */

import asyncHandler from "../utils/asyncHandlerUtils.js";
import * as saleReturnServices from "../services/saleReturnServices.js";
import { successResponse } from "../utils/responseUtils.js";

/**
 * GET /sale-returns
 * List sale returns with filters, pagination, search, stats
 */
const listSaleReturns = asyncHandler(async (req, res) => {
  const { page, limit, sortBy, sortOrder, search, ...rest } = req.query;

  const query = {
    page: Number(page) || 1,
    limit: Number(limit) || 10,
    sortBy: sortBy || "createdAt",
    sortOrder: sortOrder || "desc",
    search: search || "",
    filters: rest
  };

  const result = await saleReturnServices.listSaleReturns(query);
  return successResponse(res, "Sale returns fetched successfully", result, 200);
});

/**
 * GET /sale-returns/:id
 * Get sale return by ID with items and party
 */
const getSaleReturn = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const saleReturn = await saleReturnServices.getSaleReturnById(id);
  return successResponse(res, "Sale return fetched successfully", saleReturn, 200);
});

/**
 * POST /sale-returns
 * Create new sale return with items, stock revert, payment adjustment, audit log
 */
const createSaleReturn = asyncHandler(async (req, res) => {
  const saleReturnData = req.body;
  const userId = req.user?.id || null;

  const createdSaleReturn = await saleReturnServices.createSaleReturn(saleReturnData, userId);

  return successResponse(res, "Sale return created successfully", createdSaleReturn, 201);
});

/**
 * PUT /sale-returns/:id
 * Update sale return with item diff, stock re-adjustment, audit log
 */
const updateSaleReturn = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const updateData = req.body;
  const userId = req.user?.id || null;

  const updatedSaleReturn = await saleReturnServices.updateSaleReturn(id, updateData, userId);

  return successResponse(res, "Sale return updated successfully", updatedSaleReturn, 200);
});

/**
 * DELETE /sale-returns/:id
 * Delete sale return with stock re-apply, audit log
 */
const deleteSaleReturn = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const userId = req.user?.id || null;

  const deleted = await saleReturnServices.deleteSaleReturn(id, userId);
  return successResponse(res, "Sale return deleted successfully", deleted, 200);
});

/**
 * GET /sale-returns/party-id/:partyId
 * Get sale return suggestions by Party ID
 */
const getSaleReturnsByPartyId = asyncHandler(async (req, res) => {
  const partyId = Number(req.params.partyId);
  const saleReturns = await saleReturnServices.getSaleReturnSuggestionsByPartyId(partyId);

  return successResponse(res, "Sale return suggestions fetched successfully", saleReturns, 200);
});

export default {
  listSaleReturns,
  getSaleReturn,
  createSaleReturn,
  updateSaleReturn,
  deleteSaleReturn,
  getSaleReturnsByPartyId
};

export {
  listSaleReturns,
  getSaleReturn,
  createSaleReturn,
  updateSaleReturn,
  deleteSaleReturn,
  getSaleReturnsByPartyId
};
