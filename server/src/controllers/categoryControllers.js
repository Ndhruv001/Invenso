/**
 * categoryControllers.js
 * Express controllers for Category resource.
 * Uses asyncHandler and successResponse.
 */

import asyncHandler from "../utils/asyncHandlerUtils.js";
import { successResponse } from "../utils/responseUtils.js";
import * as categoryServices from "../services/categoryServices.js";

// List categories
const listCategories = asyncHandler(async (req, res) => {
  const { type } = req.query || {};
  const result = await categoryServices.listCategories(type);
  successResponse(res, "Categories fetched successfully", result, 200);
});

// Get category by ID
const getCategory = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const category = await categoryServices.getCategoryById(id);
  successResponse(res, "Category fetched successfully", category, 200);
});

// Add new category
const addCategory = asyncHandler(async (req, res) => {
  const categoryData = req.body;
  const userId = req.user?.id || null;
  const created = await categoryServices.addCategory(categoryData, userId);
  successResponse(res, "Category created successfully", created, 201);
});

// Search categories by name (for dropdowns)
const searchCategoriesByName = asyncHandler(async (req, res) => {
  const q = req.query.q || "";
  const results = await categoryServices.searchCategoriesByName(q);
  successResponse(res, "Category name suggestions", results, 200);
});

export default {
  addCategory,
  listCategories,
  getCategory,
  searchCategoriesByName
};
export { addCategory, listCategories, getCategory, searchCategoriesByName };
