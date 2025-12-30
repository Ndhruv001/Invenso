/**
 * partyControllers.js
 * Controllers for Party resource.
 * Handles request/response, calls partyServices functions wrapped in asyncHandler.
 * Uses successResponse for consistent API success responses.
 */

import asyncHandler from "../utils/asyncHandlerUtils.js";
import * as partyServices from "../services/partyServices.js";
import {successResponse} from "../utils/responseUtils.js";

/**
 * GET /parties
 * List parties with pagination, filters, search, stats
 */
const listParties = asyncHandler(async (req, res) => {
 const { page, limit, sortBy, sortOrder, search, ...rest } = req.query;

  const query = {
    page: Number(page) || 1,
    limit: Number(limit) || 10,
    sortBy: sortBy || "createdAt",
    sortOrder: sortOrder || "desc",
    search: search || "",
    filters: rest || {} 
  };

  const result = await partyServices.listParties(query);
  return successResponse(res, "Parties fetched successfully", result, 200);
});

/**
 * GET /parties/:id
 * Get party by ID
 */
const getParty = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const party = await partyServices.getPartyById(id);
  return successResponse(res, "Party fetched successfully", party, 200);
});

/**
 * POST /parties
 * Create a new party
 */
const createParty = asyncHandler(async (req, res) => {
  const partyData = req.body;
  const userId = req.user?.id || null;
  const createdParty = await partyServices.createParty(partyData, userId);
  return successResponse(res, "Party created successfully", createdParty, 201);
});

/**
 * PUT /parties/:id
 * Update existing party by ID
 */
const updateParty = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const updateData = req.body;
  const userId = req.user?.id || null;
  const updatedParty = await partyServices.updateParty(id, updateData, userId);
  return successResponse(res, "Party updated successfully", updatedParty, 200);
});

/**
 * DELETE /parties/:id
 * Soft delete party by ID
 */
const deleteParty = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const userId = req.user?.id || null;
  const deleted = await partyServices.deleteParty(id, userId);
  return successResponse(res, "Party deleted successfully", deleted, 200);
});

/**
 * POST /parties/bulk-delete
 * Bulk soft delete parties by array of IDs
 */
const bulkDeleteParties = asyncHandler(async (req, res) => {
  const ids = req.body?.ids;
  const userId = req.user?.id || null;
  const deleted = await partyServices.bulkDeleteParties(ids, userId);
  return successResponse(res, "Parties deleted successfully", deleted, 200);
});

/**
 * GET /parties/search?q=
 * Global search parties on several fields
 */
const globalSearchParties = asyncHandler(async (req, res) => {
  const query = req.query?.q || "";
  const results = await partyServices.globalSearchParties(query);
  return successResponse(res, "Parties search results", results, 200);
});

/**
 * GET /parties/suggest?q=
 * Suggest party names (limit 10) for dropdown
 */
const suggestPartyNames = asyncHandler(async (req, res) => {
  const query = req.query.q || "";
  const results = await partyServices.suggestPartyNames(query);
  return successResponse(res, "Party name suggestions", results, 200);
});

export default {
  listParties,
  getParty,
  createParty,
  updateParty,
  deleteParty,
  bulkDeleteParties,
  globalSearchParties,
  suggestPartyNames,
};
export {
  listParties,
  getParty,
  createParty,
  updateParty,
  deleteParty,
  bulkDeleteParties,
  globalSearchParties,
  suggestPartyNames,
};
