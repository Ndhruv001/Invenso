// controllers/chequeControllers.js

/**
 * @file Controllers for Cheque resource.
 * Orchestrates requests/responses.
 * Wraps service calls in asyncHandler and sends structured success responses.
 */

import asyncHandler from "../utils/asyncHandlerUtils.js";
import * as chequeServices from "../services/chequeServices.js";
import { successResponse } from "../utils/responseUtils.js";

/**
 * GET /cheques
 * Query params: page, limit, sortBy, sortOrder, search, filters
 * Returns paginated list of cheques with filters and stats.
 */
const listCheques = asyncHandler(async (req, res) => {
  const { page, limit, sortBy, sortOrder, search, ...rest } = req.query;

  const query = {
    page: Number(page) || 1,
    limit: Number(limit) || 10,
    sortBy: sortBy || "createdAt",
    sortOrder: sortOrder || "desc",
    search: search || "",
    filters: rest || {} // everything else goes into filters
  };

  const result = await chequeServices.listCheques(query);
  return successResponse(res, "Cheques fetched successfully", result, 200);
});

/**
 * GET /cheques/:id
 * Fetch single cheque by ID.
 */
const getCheque = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const cheque = await chequeServices.getChequeById(id);
  return successResponse(res, "Cheque fetched successfully", cheque, 200);
});

/**
 * POST /cheques
 * Create a new cheque.
 * Expects cheque data in req.body.
 */
const createCheque = asyncHandler(async (req, res) => {
  const chequeData = req.body;
  const userId = req.user?.id || null;

  const createdCheque = await chequeServices.createCheque(chequeData, userId);
  return successResponse(res, "Cheque created successfully", createdCheque, 201);
});

/**
 * PUT /cheques/:id
 * Update existing cheque by ID.
 * Handles financial sync internally in service.
 */
const updateCheque = asyncHandler(async (req, res) => {
  const id = Number(req.params?.id);
  const updateData = req.body;
  const userId = req.user?.id || null;

  const updatedCheque = await chequeServices.updateCheque(id, updateData, userId);

  return successResponse(res, "Cheque updated successfully", updatedCheque, 200);
});

/**
 * DELETE /cheques/:id
 * Delete cheque by ID.
 * Reverts financial impact if already cleared/encashed.
 */
const deleteCheque = asyncHandler(async (req, res) => {
  const id = Number(req.params?.id);
  const userId = req.user?.id || null;

  const deleted = await chequeServices.deleteCheque(id, userId);
  return successResponse(res, "Cheque deleted successfully", deleted, 200);
});

/* -------------------------------------------------------------------------- */
/*                                   Exports                                  */
/* -------------------------------------------------------------------------- */

export default {
  listCheques,
  getCheque,
  createCheque,
  updateCheque,
  deleteCheque
};

export { listCheques, getCheque, createCheque, updateCheque, deleteCheque };
