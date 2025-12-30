/**
 * @file express-validator middlewares for product resource.
 * Validates request params, body, query, and batch actions.
 */

import { body, param, query } from "express-validator";
// & -- IGNORE --- this will a future addition
// import createListValidation from "../middlewares/listValidation.js"; 


const ACP_SHEET_SIZES = ["NONE", "S4x4", "S6x4", "S8x4", "S10x4", "S12x4", "OTHER"];
const UNIT_TYPES = ["PCS", "METER", "KG", "LITER", "BOX", "PACKET", "ROLL", "SHEET", "SQF", "SQM", "OTHER"];

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
    .isString().withMessage("Name must be a string")
    .trim()
    .notEmpty().withMessage("Name cannot be empty"),

  body("categoryId")
    .exists().withMessage("CategoryId is required")
    .isInt({ gt: 0 }).withMessage("CategoryId must be a positive integer")
    .toInt(),

  body("hsnCode")
    .optional()
    .isString().withMessage("HSN Code must be a string")
    .trim(),

  body("size")
    .optional()
    .isIn(ACP_SHEET_SIZES)
    .withMessage(`Size must be one of: ${ACP_SHEET_SIZES.join(", ")}`),

  body("unit")
    .exists().withMessage("Unit is required")
    .isIn(UNIT_TYPES)
    .withMessage(`Unit must be one of: ${UNIT_TYPES.join(", ")}`),

  body("openingStock")
    .optional()
    .isDecimal().withMessage("Opening stock must be a decimal number")
    .toFloat(),

  body("currentStock")
    .optional()
    .isDecimal().withMessage("Current stock must be a decimal number")
    .toFloat(),

  body("avgCostPrice")
    .optional()
    .isDecimal().withMessage("Average cost price must be a decimal number")
    .toFloat(),

  body("avgSellPrice")
    .optional()
    .isDecimal().withMessage("Average sell price must be a decimal number")
    .toFloat(),

  body("threshold")
    .optional()
    .isDecimal().withMessage("Threshold must be a decimal number")
    .toFloat(),

  body("description")
    .optional()
    .isString().withMessage("Description must be a string")
    .trim(),
];


// --------------------
// Validate query for suggest and search (q param)
// --------------------
const validateSuggestOrSearch = [
  query("q")
    .exists().withMessage("Query param 'q' is required")
    .isString().withMessage("q must be a string")
    .trim()
    .notEmpty().withMessage("'q' cannot be empty"),
];

// --------------------
// Exports
// --------------------
export default {
  validateProduct,
  validateProductId,
  validateSuggestOrSearch,
};

export {
  validateProduct,
  validateProductId,
  validateSuggestOrSearch,
};
