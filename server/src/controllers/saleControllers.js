/**
 * saleControllers.js
 * Controllers for Sale resource CRUD operations.
 * Each controller method wraps service calls with asyncHandler.
 * Uses successResponse for consistent response format.
 */

import asyncHandler from "../utils/asyncHandlerUtils.js";
import * as saleServices from "../services/saleServices.js";
import { successResponse } from "../utils/responseUtils.js";

/**
 * GET /sales
 * List sales with filters, pagination, search, stats
 */
const listSales = asyncHandler(async (req, res) => {
  const { page, limit, sortBy, sortOrder, search, ...rest } = req.query;

  const query = {
    page: Number(page) || 1,
    limit: Number(limit) || 10,
    sortBy: sortBy || "createdAt",
    sortOrder: sortOrder || "desc",
    search: search || "",
    filters: rest || {}
  };

  const result = await saleServices.listSales(query);
  return successResponse(res, "Sales fetched successfully", result, 200);
});

/**
 * GET /sales/:id
 * Get sale by ID with items and party
 */
const getSale = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const sale = await saleServices.getSaleById(id);
  return successResponse(res, "Sale fetched successfully", sale, 200);
});

/**
 * POST /sales
 * Create new sale with items, payment, inventory, stock, audit log
 */
const createSale = asyncHandler(async (req, res) => {
  const saleData = req.body;
  const userId = req.user?.id || null;
  const createdSale = await saleServices.createSale(saleData, userId);
  return successResponse(res, "Sale created successfully", createdSale, 201);
});

/**
 * PUT /sales/:id
 * Update sale with items update, payment diff, stock adjustments, audit log
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
 * Delete sale with stock revert, payment deletion, audit log
 */
const deleteSale = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const userId = req.user?.id || null;
  const deleted = await saleServices.deleteSale(id, userId);
  return successResponse(res, "Sale deleted successfully", deleted, 200);
});

/**
 * GET /sales/party-id/:partyId
 * Get sale suggestions by Party ID
 */
const getSalesByPartyId = asyncHandler(async (req, res) => {
  const partyId = Number(req.params.partyId);
  const sales = await saleServices.getSaleSuggestionsByPartyId(partyId);
  return successResponse(res, "Sale suggestions fetched successfully", sales, 200);
});

export default {
  listSales,
  getSale,
  createSale,
  updateSale,
  deleteSale,
  getSalesByPartyId
};

export { listSales, getSale, createSale, updateSale, deleteSale, getSalesByPartyId };
