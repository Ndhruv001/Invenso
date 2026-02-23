// src/validations/queryValidators.js
import { query } from "express-validator";

/**
 * Generates validation rules for list/search queries.
 * @param {Object} options
 * @param {string[]} [options.allowedFilterKeys=[]] - Allowed filter keys for the specific module
 * @param {Object} [options.customFilterValidators={}] - Custom per-key validation logic
 */
const createListValidation = ({ allowedFilterKeys = [], customFilterValidators = {} } = {}) => [
  query("page").optional().isInt({ gt: 0 }).toInt().withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ gt: 0 })
    .toInt()
    .withMessage("Limit must be a positive integer"),

  query("sortBy").optional().isString().withMessage("SortBy must be a string"),

  query("sortOrder")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("SortOrder must be 'asc' or 'desc'"),

  query("search").optional().isString().withMessage("Search must be a string"),

  query("q").optional().isString().withMessage("Search query must be a string for search/suggest"),

  query("filters")
    .optional()
    .custom(value => {
      let filters = value;

      // Parse if string
      if (typeof value === "string") {
        try {
          filters = JSON.parse(value);
        } catch {
          throw new Error("Filters must be a valid JSON string");
        }
      }

      // Validate allowed keys
      for (const key of Object.keys(filters)) {
        if (!allowedFilterKeys.includes(key)) {
          throw new Error(`Invalid filter field: ${key}`);
        }

        // Run custom validation if defined for this key
        if (customFilterValidators[key]) {
          customFilterValidators[key](filters[key]);
        }
      }

      return true;
    })
];

export default createListValidation;
export { createListValidation };
