/**
 * @file Controllers for Transport resource.
 * Orchestrates requests/responses for logistics and transport entries.
 * Wraps service calls in asyncHandler and sends structured success responses.
 */

import asyncHandler from "../utils/asyncHandlerUtils.js";
import * as transportServices from "../services/transportServices.js";
import { successResponse } from "../utils/responseUtils.js";

/**
 * GET /transports
 * Query params: page, limit, sortBy, sortOrder, search, filters
 * Returns paginated list of transports with integrated search for Party, Driver, and Amounts.
 */
const listTransports = asyncHandler(async (req, res) => {
  const { page, limit, sortBy, sortOrder, search, ...rest } = req.query;

  const query = {
    page: Number(page) || 1,
    limit: Number(limit) || 10,
    sortBy: sortBy || "createdAt",
    sortOrder: sortOrder || "desc",
    search: search || "",
    filters: rest || {} // Captures remaining query params as filters
  };

  const result = await transportServices.listTransports(query);
  return successResponse(res, "Transports fetched successfully", result, 200);
});

/**
 * GET /transports/:id
 * Fetch single transport entry by ID.
 */
const getTransport = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const transport = await transportServices.getTransportById(id);
  return successResponse(res, "Transport fetched successfully", transport, 200);
});

/**
 * POST /transports
 * Create a new transport entry.
 * Automatically handles party balance (Receivable) and initial payment records.
 */
const createTransport = asyncHandler(async (req, res) => {
  const transportData = req.body;
  const userId = req.user?.id || null;

  const createdTransport = await transportServices.createTransport(transportData, userId);
  return successResponse(res, "Transport created successfully", createdTransport, 201);
});

/**
 * PUT /transports/:id
 * Update existing transport by ID.
 * Manages complex logic for party changes and balance re-calculation.
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
 * Delete transport entry.
 * Reverts party balances and removes associated payment records.
 */
const deleteTransport = asyncHandler(async (req, res) => {
  const id = Number(req.params?.id);
  const userId = req.user?.id || null;

  const deleted = await transportServices.deleteTransport(id, userId);
  return successResponse(res, "Transport deleted successfully", deleted, 200);
});

/* -------------------------------------------------------------------------- */
/* Exports                                  */
/* -------------------------------------------------------------------------- */

export default {
  listTransports,
  getTransport,
  createTransport,
  updateTransport,
  deleteTransport
};

export { listTransports, getTransport, createTransport, updateTransport, deleteTransport };
