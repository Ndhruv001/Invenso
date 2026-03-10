// routes/categoryRoutes.js

import express from "express";
const router = express.Router();

import authMiddleware from "../middlewares/authMiddleware.js";
import {
  validateCreateCategory,
  validateUpdateCategory,
  validateCategoryId
} from "../validations/categoryValidations.js";
import validateRequest from "../middlewares/validateRequestMiddleware.js";
import categoryController from "../controllers/categoryControllers.js";

/**
 * ---------------------------
 * COLLECTION ROUTES
 * ---------------------------
 */

// List categories
router.get("/", authMiddleware, categoryController.listCategories);

// Create new category
router.post(
  "/",
  authMiddleware,
  validateCreateCategory,
  validateRequest,
  categoryController.createCategory
);

/**
 * ---------------------------
 * PARAMETERIZED ROUTES
 * ---------------------------
 */

// Get single category
router.get(
  "/:id",
  authMiddleware,
  validateCategoryId,
  validateRequest,
  categoryController.getCategory
);

// Update category
router.put(
  "/:id",
  authMiddleware,
  validateCategoryId,
  validateUpdateCategory,
  validateRequest,
  categoryController.updateCategory
);

// Delete category
router.delete(
  "/:id",
  authMiddleware,
  validateCategoryId,
  validateRequest,
  categoryController.deleteCategory
);

export default router;
export { router as categoryRouter };
