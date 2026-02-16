// controllers/categoryControllers.js

/**
 * @file Controllers for Category resource.
 * Orchestrates requests/responses.
 * Wraps service calls in asyncHandler and sends structured success responses.
 */

import asyncHandler from "../utils/asyncHandlerUtils.js";
import * as categoryServices from "../services/categoryServices.js";
import { successResponse } from "../utils/responseUtils.js";

/**
 * GET /categories
 * Query params: page, limit, sortBy, sortOrder, search, filters
 * Returns paginated list of categories with filters.
 */
const listCategories = asyncHandler(async (req, res) => {
  const { page, limit, sortBy, sortOrder, search, ...rest } = req.query;

  const query = {
    page: Number(page) || 1,
    limit: Number(limit) || 10,
    sortBy: sortBy || "createdAt",
    sortOrder: sortOrder || "desc",
    search: search || "",
    filters: rest || {} // everything else treated as filters
  };

  const result = await categoryServices.listCategories(query);
  return successResponse(res, "Categories fetched successfully", result, 200);
});

/**
 * GET /categories/:id
 * Fetch single category by ID.
 */
const getCategory = asyncHandler(async (req, res) => {
  const id = Number(req.params?.id);
  const category = await categoryServices.getCategoryById(id);
  return successResponse(res, "Category fetched successfully", category, 200);
});

/**
 * POST /categories
 * Create a new category.
 * Expects category data in req.body.
 */
const createCategory = asyncHandler(async (req, res) => {
  const categoryData = req.body;
  const userId = req.user?.id || null;
  const createdCategory = await categoryServices.createCategory(categoryData, userId);
  return successResponse(res, "Category created successfully", createdCategory, 201);
});

/**
 * PUT /categories/:id
 * Update existing category by ID.
 * Expects update data in req.body.
 */
const updateCategory = asyncHandler(async (req, res) => {
  const id = Number(req.params?.id);
  const updateData = req.body;
  const userId = req.user?.id || null;
  const updatedCategory = await categoryServices.updateCategory(id, updateData, userId);
  return successResponse(res, "Category updated successfully", updatedCategory, 200);
});

/**
 * DELETE /categories/:id
 * Soft delete category by ID (set isActive = false).
 */
const deleteCategory = asyncHandler(async (req, res) => {
  const id = Number(req.params?.id);
  const userId = req.user?.id || null;
  const deleted = await categoryServices.deleteCategory(id, userId);
  return successResponse(res, "Category deleted successfully", deleted, 200);
});


export default {
  listCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
};

export {
  listCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
};
