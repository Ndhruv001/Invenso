/**
 * saleReturnControllers.js
 * Controllers for SaleReturn resource.
 * Wrap service calls with asyncHandler and respond with successResponse.
 */

import asyncHandler from "../utils/asyncHandlerUtils.js";
import * as saleReturnServices from "../services/saleReturnServices.js";
import {successResponse} from "../utils/responseUtils.js";

/**
 * GET /sale-returns
 * List sale returns with pagination, filters, search, and stats
 */
const listSaleReturns = asyncHandler(async (req, res) => {
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

  const result = await saleReturnServices.listSaleReturns(query);
  return successResponse(res, "Sale returns fetched successfully", result, 200);
});

/**
 * GET /sale-returns/:id
 * Fetch sale return by ID
 */
const getSaleReturn = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const saleReturn = await saleReturnServices.getSaleReturnById(id);
  return successResponse(res, "Sale return fetched successfully", saleReturn, 200);
});

/**
 * POST /sale-returns
 * Create new sale return
 */
const createSaleReturn = asyncHandler(async (req, res) => {
  const data = req.body;
  const userId = req.user?.id || null;
  const createdSaleReturn = await saleReturnServices.createSaleReturn(data, userId);
  return successResponse(res, "Sale return created successfully", createdSaleReturn, 201);
});

/**
 * PUT /sale-returns/:id
 * Update sale return
 */
const updateSaleReturn = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const data = req.body;
  const userId = req.user?.id || null;
  const updatedSaleReturn = await saleReturnServices.updateSaleReturn(id, data, userId);
  return successResponse(res, "Sale return updated successfully", updatedSaleReturn, 200);
});

/**
 * DELETE /sale-returns/:id
 * Delete sale return
 */
const deleteSaleReturn = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const userId = req.user?.id || null;
  const deleted = await saleReturnServices.deleteSaleReturn(id, userId);
  return successResponse(res, "Sale return deleted successfully", deleted, 200);
});

/**
 * POST /sale-returns/bulk-delete
 * Bulk delete sale returns by IDs
 */
const bulkDeleteSaleReturns = asyncHandler(async (req, res) => {
  const ids = req.body?.ids;
  const userId = req.user?.id || null;
  const deleted = await saleReturnServices.bulkDeleteSaleReturns(ids, userId);
  return successResponse(res, "Sale returns deleted successfully", deleted, 200);
});

export default {
  listSaleReturns,
  getSaleReturn,
  createSaleReturn,
  updateSaleReturn,
  deleteSaleReturn,
  bulkDeleteSaleReturns,
};
export {
  listSaleReturns,
  getSaleReturn,
  createSaleReturn,
  updateSaleReturn,
  deleteSaleReturn,
  bulkDeleteSaleReturns,
};
