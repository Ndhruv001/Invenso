/**
 * @file express-validator middlewares for product resource.
 */

import { body, param, query } from "express-validator";
import { UnitType } from "@prisma/client";

// Convert Prisma enums → arrays (IMPORTANT)
const UNIT_TYPES = Object.values(UnitType);

// --------------------
// Validate product ID param
// --------------------
const validateProductId = [
  param("id")
    .exists()
    .withMessage("Product ID is required")
    .isInt({ gt: 0 })
    .withMessage("Product ID must be a positive integer")
    .toInt()
];

// --------------------
// Validate product create/update body
// --------------------
const validateCreateProduct = [
  body("name").exists().withMessage("Product name is required").isString().trim().notEmpty(),

  body("categoryId").exists().withMessage("Category ID is required").isInt({ gt: 0 }).toInt(),

  body("unit")
    .exists()
    .withMessage("Unit is required")
    .isIn(UNIT_TYPES)
    .withMessage(`Unit must be one of: ${UNIT_TYPES.join(", ")}`),

  body("hsnCode").optional().isString().trim(),

  body("openingStock").optional().isDecimal().toFloat(),

  body("threshold").optional().isDecimal().toFloat(),

  body("description").optional().isString().trim()
];

const validateUpdateProduct = [
  body("name").optional().isString().trim().notEmpty(),

  body("categoryId").optional().isInt({ gt: 0 }).toInt(),

  body("hsnCode").optional().isString().trim(),

  body("threshold").optional().isDecimal().toFloat(),

  body("description").optional().isString().trim()

  // ❌ unit not allowed to change (intentional)
];

// --------------------
// Validate query for suggest/search
// --------------------

const validateSuggest = [query("q").exists().isString().trim().notEmpty()];

// --------------------
// Exports
// --------------------
export { validateCreateProduct, validateUpdateProduct, validateProductId, validateSuggest };

export default {
  validateCreateProduct,
  validateUpdateProduct,
  validateProductId,
  validateSuggest
};
