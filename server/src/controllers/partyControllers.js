// controllers/partyControllers.js

/**
 * @file Controllers for Party resource.
 * Orchestrates requests/responses.
 * Wraps service calls in asyncHandler and sends structured success responses.
 */

import asyncHandler from "../utils/asyncHandlerUtils.js";
import * as partyServices from "../services/partyServices.js";
import { successResponse } from "../utils/responseUtils.js";

/**
 * GET /parties
 * Query params: page, limit, sortBy, sortOrder, search, filters
 * Returns paginated list of parties with filters and aggregates.
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
 * Fetch single party by ID.
 */
const getParty = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const party = await partyServices.getPartyById(id);
  return successResponse(res, "Party fetched successfully", party, 200);
});

/**
 * POST /parties
 * Create a new party.
 * Expects party data in req.body.
 */
const createParty = asyncHandler(async (req, res) => {
  const partyData = req.body;
  const userId = req.user?.id || null;
  const createdParty = await partyServices.createParty(partyData, userId);
  return successResponse(res, "Party created successfully", createdParty, 201);
});

/**
 * PUT /parties/:id
 * Update existing party by ID.
 * Expects update data in req.body.
 */
const updateParty = asyncHandler(async (req, res) => {
  const id = Number(req.params?.id);
  const updateData = req.body;
  const userId = req.user?.id || null;
  const updatedParty = await partyServices.updateParty(id, updateData, userId);
  return successResponse(res, "Party updated successfully", updatedParty, 200);
});

/**
 * DELETE /parties/:id
 * Soft delete party by ID.
 */
const deleteParty = asyncHandler(async (req, res) => {
  const id = Number(req.params?.id);
  const userId = req.user?.id || null;
  const deleted = await partyServices.deleteParty(id, userId);
  return successResponse(res, "Party deleted successfully", deleted, 200);
});

/**
 * GET /parties/suggest?q=
 * Suggest party names for dropdown
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
  suggestPartyNames
};

export { listParties, getParty, createParty, updateParty, deleteParty, suggestPartyNames };
