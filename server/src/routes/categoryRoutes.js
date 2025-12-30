// routes/categoryRoutes.js

/**
 * @file Routes for Category resource.
 * Sets up RESTful endpoints.
 * Applies validation middleware.
 */

import express from "express";
const router = express.Router();

import categoryController from "../controllers/categoryControllers.js";
import {
  validateCategory,
  validateCategoryId,
  validateCategorySearch
} from "../validations/categoryValidations.js";
import validateRequest from "../middlewares/validateRequestMiddleware.js";
import authMiddleware from "../middlewares/authMiddleware.js";

// List categories (GET /categories)
router.get("/", authMiddleware, validateRequest, categoryController.listCategories);

// Get single category by ID (GET /categories/:id)
router.get(
  "/:id",
  authMiddleware,
  validateCategoryId,
  validateRequest,
  categoryController.getCategory
);

// Create new category (POST /categories)
router.post("/", authMiddleware, validateCategory, validateRequest, categoryController.addCategory);

// Search category names for dropdown (GET /categories/search?q=)
router.get(
  "/search",
  authMiddleware,
  validateCategorySearch,
  validateRequest,
  categoryController.searchCategoriesByName
);

export default router;
export { router };
