/**
 * @file express-validator middlewares for category resource.
 */

import { body, param, query } from "express-validator";
import { CategoryType } from "@prisma/client";

// Convert Prisma enums → arrays (IMPORTANT)
const CATEGORY_TYPES = Object.values(CategoryType);

// --------------------
// Validate category ID param
// --------------------
const validateCategoryId = [
  param("id")
    .exists().withMessage("Category ID is required")
    .isInt({ gt: 0 }).withMessage("Category ID must be a positive integer")
    .toInt(),
];

// --------------------
// Validate category create body
// --------------------
const validateCreateCategory = [
  body("name")
    .exists().withMessage("Category name is required")
    .isString()
    .trim()
    .notEmpty(),

  body("type")
    .optional()
    .isIn(CATEGORY_TYPES)
    .withMessage(`Type must be one of: ${CATEGORY_TYPES.join(", ")}`),

  body("description")
    .optional()
    .isString()
    .trim()
];

// --------------------
// Validate category update body
// --------------------
const validateUpdateCategory = [
  body("name")
    .optional()
    .isString()
    .trim()
    .notEmpty(),

  body("type")
    .optional()
    .isIn(CATEGORY_TYPES)
    .withMessage(`Type must be one of: ${CATEGORY_TYPES.join(", ")}`),

  body("description")
    .optional()
    .isString()
    .trim(),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be true or false")
    .toBoolean()
];

// --------------------
// Exports
// --------------------
export {
  validateCreateCategory,
  validateUpdateCategory,
  validateCategoryId,
};

export default {
  validateCreateCategory,
  validateUpdateCategory,
  validateCategoryId,
};
