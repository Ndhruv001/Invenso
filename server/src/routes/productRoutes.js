// routes/productRoutes.js

/**
 * @file Routes for Product resource.
 * Sets up RESTful endpoints.
 * Applies validation middleware.
 */

import express from "express";
const router = express.Router();

import authMiddleware from "../middlewares/authMiddleware.js";
import {
  validateProduct,
  validateProductId,
  validateSuggestOrSearch
} from "../validations/productValidations.js";
import validateRequest from "../middlewares/validateRequestMiddleware.js";
import productController from "../controllers/productControllers.js";

// List HSN Codes (GET /products/hsn-codes)
router.get("/hsn-codes", authMiddleware, productController.listHsnCodes);
// List products with filters, pagination, sorting
router.get(
  "/",
  authMiddleware,
  productController.listProducts
);

// Get single product by ID
router.get(
  "/:id",
  authMiddleware,
  validateProductId,
  validateRequest,
  productController.getProduct
);

// Create new product
router.post("/", authMiddleware, validateProduct, validateRequest, productController.createProduct);

// Update product by ID
router.put(
  "/:id",
  authMiddleware,
  validateProductId,
  validateProduct,
  validateRequest,
  productController.updateProduct
);

// Soft delete product by ID
router.delete(
  "/:id",
  authMiddleware,
  validateProductId,
  validateRequest,
  productController.deleteProduct
);

// Global search (with q param)
router.get(
  "/search",
  authMiddleware,
  validateSuggestOrSearch,
  validateRequest,
  productController.globalSearchProducts
);

// Product name suggestions for dropdown (with q param)
router.get(
  "/suggest",
  authMiddleware,
  validateSuggestOrSearch,
  validateRequest,
  productController.suggestProductNames
);

export default router;
export { router };
