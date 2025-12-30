/**
 * saleControllers.js
 * Controllers for Sale resource.
 * Wrap service functions with asyncHandler,
 * respond using successResponse utility.
 */

import asyncHandler from "../utils/asyncHandlerUtils.js";
import * as saleServices from "../services/saleServices.js";
import {successResponse} from "../utils/responseUtils.js";

/**
 * GET /sales
 * List sales with filters, pagination, stats (including profit)
 */
const listSales = asyncHandler(async (req, res) => {
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

  const result = await saleServices.listSales(query);
  return successResponse(res, "Sales fetched successfully", result, 200);
});

/**
 * GET /sales/:id
 * Get single sale details with items and party
 */
const getSale = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const sale = await saleServices.getSaleById(id);
  return successResponse(res, "Sale fetched successfully", sale, 200);
});

/**
 * POST /sales
 * Create a new sale transaction
 */
const createSale = asyncHandler(async (req, res) => {
  const saleData = req.body;
  const userId = req.user?.id || null;
  const createdSale = await saleServices.createSale(saleData, userId);
  return successResponse(res, "Sale created successfully", createdSale, 201);
});

/**
 * PUT /sales/:id
 * Update existing sale with payment, stock, profit, audit log
 */
const updateSale = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const updateData = req.body;
  const userId = req.user?.id || null;
  const updatedSale = await saleServices.updateSale(id, updateData, userId);
  return successResponse(res, "Sale updated successfully", updatedSale, 200);
});

/**
 * DELETE /sales/:id
 * Delete sale transaction, revert stock and payments
 */
const deleteSale = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const userId = req.user?.id || null;
  const deleted = await saleServices.deleteSale(id, userId);
  return successResponse(res, "Sale deleted successfully", deleted, 200);
});

/**
 * POST /sales/bulk-delete
 * Bulk delete multiple sales by IDs
 */
const bulkDeleteSales = asyncHandler(async (req, res) => {
  const ids = req.body?.ids;
  const userId = req.user?.id || null;
  const deleted = await saleServices.bulkDeleteSales(ids, userId);
  return successResponse(res, "Sales deleted successfully", deleted, 200);
});

export default {
  listSales,
  getSale,
  createSale,
  updateSale,
  deleteSale,
  bulkDeleteSales,
};
export {
  listSales,
  getSale,
  createSale,
  updateSale,
  deleteSale,
  bulkDeleteSales,
};
