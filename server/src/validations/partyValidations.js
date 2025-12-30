/**
 * validations/partyValidations.js
 * Validation rules for Party resource using express-validator.
 */

import { body, param, query } from "express-validator";

// Validate fields on party creation and update
const validateParty = [
  body("name")
    .notEmpty()
    .withMessage("Party name is required")
    .isLength({ max: 255 })
    .withMessage("Name must be at most 255 characters"),
  body("type")
    .notEmpty()
    .withMessage("Party type is required")
    .isIn(["CUSTOMER", "SUPPLIER", "BOTH", "EMPLOYEE", "DRIVER", "OTHER"])
    .withMessage("Invalid party type"),
  body("balanceType")
    .optional()
    .isIn(["RECEIVABLE", "PAYABLE"])
    .withMessage("Invalid balance type"),
  body("phone")
    .optional()
    .isMobilePhone()
    .withMessage("Invalid phone number"),
  body("gstNumber")
    .optional()
    .isLength({ max: 15 })
    .withMessage("GST number max length is 15"),
  body("openingBalance")
    .optional()
    .isDecimal()
    .withMessage("Opening balance must be a decimal number"),
  body("currentBalance").optional().isDecimal().withMessage("Current balance must be decimal"),
  body("address").optional().isString(),
  body("remark").optional().isString(),
];

// Validate party ID param
const validatePartyId = [
  param("id").isInt({ gt: 0 }).withMessage("Valid party ID is required"),
];

// Validate query params for list (pagination, filters, search, sorting)

const validatePartyQuery = [
  // ✅ Pagination
  query("page")
    .optional()
    .isInt({ min: 1 })
    .toInt()
    .withMessage("Page must be an integer >= 1"),

  query("limit")
    .optional()
    .isInt({ min: 1 })
    .toInt()
    .withMessage("Limit must be an integer >= 1"),

  // ✅ Sorting
  query("sortBy")
    .optional()
    .isIn([
      "id",
      "name",
      "identifier",
      "type",
      "phone",
      "balanceType",
      "currentBalance",
      "openingBalance",
      "createdAt",
    ])
    .withMessage("Invalid sortBy field"),

  query("sortOrder")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("Invalid sortOrder value"),

  // ✅ Filters (safe JSON check + known keys)
  query("filters")
    .optional()
    .custom((value) => {
      if (typeof value === "string") {
        try {
          const parsed = JSON.parse(value);
          const allowedKeys = ["type", "balanceType"];
          const invalidKeys = Object.keys(parsed).filter(
            (key) => !allowedKeys.includes(key)
          );
          if (invalidKeys.length > 0) {
            throw new Error(`Invalid filter keys: ${invalidKeys.join(", ")}`);
          }
          return true;
        } catch {
          throw new Error("Invalid JSON for filters");
        }
      }
      return true;
    }),

  // ✅ Search
  query("search")
    .optional()
    .isString()
    .trim()
    .withMessage("Search must be a string"),
];

// Validate bulk delete request body
const validateBulkDelete = [
  body("ids")
    .isArray({ min: 1 })
    .withMessage("Array of party IDs is required"),
  body("ids.*")
    .isInt({ gt: 0 })
    .withMessage("Each party ID must be a positive integer"),
];

// Validate search and suggest query param "q"
const validateSuggestOrSearch = [
  query("q").notEmpty().withMessage("Query parameter q is required"),
];

export {
  validateParty,
  validatePartyId,
  validatePartyQuery,
  validateBulkDelete,
  validateSuggestOrSearch,
};
export default {
  validateParty,
  validatePartyId,
  validatePartyQuery,
  validateBulkDelete,
  validateSuggestOrSearch,
};
