/**
 * @file express-validator middlewares for product resource.
 */

import { body, param, query } from "express-validator";
import { AcpSheetSize, UnitType } from "@prisma/client";

// Convert Prisma enums → arrays (IMPORTANT)
const ACP_SHEET_SIZES = Object.values(AcpSheetSize);
const UNIT_TYPES = Object.values(UnitType);

// --------------------
// Validate product ID param
// --------------------
const validateProductId = [
  param("id")
    .exists().withMessage("Product ID param is required")
    .isInt({ gt: 0 }).withMessage("Product ID must be a positive integer")
    .toInt(),
];

// --------------------
// Validate product create/update body
// --------------------
const validateProduct = [
  body("name")
    .exists().withMessage("Name is required")
    .isString()
    .trim()
    .notEmpty(),

  body("categoryId")
    .exists().withMessage("CategoryId is required")
    .isInt({ gt: 0 })
    .toInt(),

  body("hsnCode")
    .optional()
    .isString()
    .trim(),

  body("size")
    .optional()
    .isIn(ACP_SHEET_SIZES)
    .withMessage(`Size must be one of: ${ACP_SHEET_SIZES.join(", ")}`),

  body("unit")
    .exists().withMessage("Unit is required")
    .isIn(UNIT_TYPES)
    .withMessage(`Unit must be one of: ${UNIT_TYPES.join(", ")}`),

  body("openingStock").optional().isDecimal().toFloat(),
  body("currentStock").optional().isDecimal().toFloat(),
  body("avgCostPrice").optional().isDecimal().toFloat(),
  body("avgSellPrice").optional().isDecimal().toFloat(),
  body("threshold").optional().isDecimal().toFloat(),

  body("description")
    .optional()
    .isString()
    .trim(),
];

// --------------------
// Validate query for suggest/search
// --------------------
const validateSuggestOrSearch = [
  query("q")
    .exists()
    .isString()
    .trim()
    .notEmpty(),
];

// --------------------
// Exports
// --------------------
export {
  validateProduct,
  validateProductId,
  validateSuggestOrSearch,
};

export default {
  validateProduct,
  validateProductId,
  validateSuggestOrSearch,
};
