// routes/productRoutes.js

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

/**
 * ---------------------------
 * STATIC & FEATURE ROUTES
 * ---------------------------
 */

// List HSN Codes
router.get("/hsn-codes", authMiddleware, productController.listHsnCodes);

// Product name suggestions
router.get(
  "/suggest",
  authMiddleware,
  validateSuggestOrSearch,
  validateRequest,
  productController.suggestProductNames
);

/**
 * ---------------------------
 * COLLECTION ROUTES
 * ---------------------------
 */

// List products
router.get("/", authMiddleware, productController.listProducts);

// Create new product
router.post("/", authMiddleware, validateProduct, validateRequest, productController.createProduct);

/**
 * ---------------------------
 * PARAMETERIZED ROUTES
 * ---------------------------
 */

// Get single product
router.get(
  "/:id",
  authMiddleware,
  validateProductId,
  validateRequest,
  productController.getProduct
);

// Update product
router.put(
  "/:id",
  authMiddleware,
  validateProductId,
  validateRequest,
  productController.updateProduct
);

// Delete product
router.delete(
  "/:id",
  authMiddleware,
  validateProductId,
  validateRequest,
  productController.deleteProduct
);

export default router;
export { router as productRouter };
