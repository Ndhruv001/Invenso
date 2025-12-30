/**
 * transportControllers.js
 * Controllers for Transport resource.
 * Handles HTTP requests and responses, calls transportServices methods.
 * Uses asyncHandler for catching async errors.
 * Uses successResponse for consistent API success responses.
 */

import asyncHandler from "../utils/asyncHandlerUtils.js";
import * as transportServices from "../services/transportServices.js";
import {successResponse} from "../utils/responseUtils.js";

/**
 * GET /transports
 * List transports with filters, pagination, sorting, stats
 */
const listTransports = asyncHandler(async (req, res) => {
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

  const result = await transportServices.listTransports(query);
  return successResponse(res, "Transports fetched successfully", result, 200);
});

/**
 * GET /transports/:id
 * Get single transport by ID
 */
const getTransport = asyncHandler(async (req, res) => {
  const id = Number(req.params?.id);
  const transport = await transportServices.getTransportById(id);
  return successResponse(res, "Transport fetched successfully", transport, 200);
});

/**
 * POST /transports
 * Create new transport with payment and party balance handling
 */
const createTransport = asyncHandler(async (req, res) => {
  const transportData = req.body;
  const userId = req.user?.id || null;
  const createdTransport = await transportServices.createTransport(transportData, userId);
  return successResponse(res, "Transport created successfully", createdTransport, 201);
});

/**
 * PUT /transports/:id
 * Update transport by ID with careful payment and party balance updates
 */
const updateTransport = asyncHandler(async (req, res) => {
  const id = Number(req.params?.id);
  const updateData = req.body;
  const userId = req.user?.id || null;
  const updatedTransport = await transportServices.updateTransport(id, updateData, userId);
  return successResponse(res, "Transport updated successfully", updatedTransport, 200);
});

/**
 * DELETE /transports/:id
 * Delete transport by ID, revert party balances, delete payments
 */
const deleteTransport = asyncHandler(async (req, res) => {
  const id = Number(req.params?.id);
  const userId = req.user?.id || null;
  const deleted = await transportServices.deleteTransport(id, userId);
  return successResponse(res, "Transport deleted successfully", deleted, 200);
});

/**
 * POST /transports/bulk-delete
 * Bulk delete transports by IDs, handle balances/payment, audit log
 */
const bulkDeleteTransports = asyncHandler(async (req, res) => {
  const ids = req.body?.ids;
  const userId = req.user?.id || null;
  const deleted = await transportServices.bulkDeleteTransports(ids, userId);
  return successResponse(res, "Transports deleted successfully", deleted, 200);
});

export default {
  listTransports,
  getTransport,
  createTransport,
  updateTransport,
  deleteTransport,
  bulkDeleteTransports,
};
export {
  listTransports,
  getTransport,
  createTransport,
  updateTransport,
  deleteTransport,
  bulkDeleteTransports,
};
