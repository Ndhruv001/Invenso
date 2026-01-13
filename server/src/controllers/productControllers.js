// controllers/productControllers.js

/**
 * @file Controllers for Product resource.
 * Orchestrates requests/responses.
 * Wraps service calls in asyncHandler and sends structured success responses.
 */

import asyncHandler from "../utils/asyncHandlerUtils.js";
import * as productServices from "../services/productServices.js";
import { successResponse } from "../utils/responseUtils.js";

/**
 * GET /products
 * Query params: page, limit, sortBy, sortOrder, search, filters (as JSON string or object)
 * Returns paginated list of products with filters and aggregates.
 */

  // List HSN Codes
const listHsnCodes = asyncHandler(async (req, res) => {
  const result = await productServices.listHsnCodes();
  successResponse(res, "HSN Codes fetched successfully", result, 200);
});


const listProducts = asyncHandler(async (req, res) => {


  const { page, limit, sortBy, sortOrder, search, ...rest } = req.query;

  const query = {
    page: Number(page) || 1,
    limit: Number(limit) || 10,
    sortBy: sortBy || "createdAt",
    sortOrder: sortOrder || "desc",
    search: search || "",
    filters: rest || {} // everything else goes into filters
  };

  const result = await productServices.listProducts(query);
  return successResponse(res, "Products fetched successfully", result, 200);
});

/**
 * GET /products/:id
 * Fetch single product by ID.
 */
const getProduct = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const product = await productServices.getProductById(id);
  return successResponse(res, "Product fetched successfully", product, 200);
});

/**
 * POST /products
 * Create a new product.
 * Expects product data in req.body.
 */
const createProduct = asyncHandler(async (req, res) => {
  const productData = req.body;
  const userId = req.user?.id || null; // if user info available
  const createdProduct = await productServices.createProduct(productData, userId);
  return successResponse(res, "Product created successfully", createdProduct, 201);
});

/**
 * PUT /products/:id
 * Update existing product by ID.
 * Expects update data in req.body.
 */
const updateProduct = asyncHandler(async (req, res) => {
  const id = Number(req.params?.id);
  const updateData = req.body;
  const userId = req.user?.id || null;
  const updatedProduct = await productServices.updateProduct(id, updateData, userId);
  return successResponse(res, "Product updated successfully", updatedProduct, 200);
});

/**
 * DELETE /products/:id
 * Soft delete product by ID (set isActive = false).
 */
const deleteProduct = asyncHandler(async (req, res) => {
  const id = Number(req.params?.id);
  const userId = req.user?.id || null;
  const deleted = await productServices.deleteProduct(id, userId);
  return successResponse(res, "Product deleted successfully", deleted, 200);
});

/**
 * GET /products/suggest?q=
 * Suggest product names for dropdown, max 10
 */
const suggestProductNames = asyncHandler(async (req, res) => {
  const query = req.query.q || "";
  const results = await productServices.suggestProductNames(query);
  return successResponse(res, "Product name suggestions", results, 200);
});

export default {
  listHsnCodes,
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  suggestProductNames,
};
export {
  listHsnCodes,
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  suggestProductNames,
};
