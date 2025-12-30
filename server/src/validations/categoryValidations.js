// validators/categoryValidator.js

/**
 * @file express-validator middlewares for category resource.
 * Validates request params, body, and query params for category endpoints.
 */

import { body, param, query } from "express-validator";

// Validate category ID param
const validateCategoryId = [
  param("id")
    .exists().withMessage("Category ID is required")
    .isInt({ gt: 0 }).withMessage("Category ID must be a positive integer")
    .toInt(),
];

// Validate category create body
const validateCategory = [
  body("name")
    .exists().withMessage("Name is required")
    .isString().withMessage("Name must be a string")
    .trim(),
  body("type")
    .optional()
    .isIn(["PRODUCT", "EXPENSE"])
    .withMessage("Type must be either PRODUCT or EXPENSE"),
  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string")
    .trim(),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
];

// Validate query param for search (q)
const validateCategorySearch = [
  query("q")
    .exists()
    .withMessage("Search query 'q' is required")
    .isString()
    .withMessage("Search query must be a string")
    .trim()
    .notEmpty()
    .withMessage("Search query cannot be empty"),
];

export default {
  validateCategory,
  validateCategoryId,
  validateCategorySearch,
};
export {
  validateCategory,
  validateCategoryId,
  validateCategorySearch,
};
