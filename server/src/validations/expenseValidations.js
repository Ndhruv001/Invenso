/**
 * validations/expenseValidations.js
 * Validation rules for Expense resource using express-validator.
 */

import { body, param, query } from "express-validator";

const paymentModes = [
  "NONE",
  "CASH",
  "BANK_TRANSFER",
  "CHEQUE",
  "UPI",
  "CARD",
  "CREDIT",
  "ONLINE",
];

// Validate expense fields for create/update
const validateExpense = [
  body("categoryId")
    .notEmpty()
    .withMessage("Category ID is required")
    .isInt({ gt: 0 })
    .withMessage("Category ID must be a positive integer"),
  body("date").optional().isISO8601().withMessage("Date must be ISO8601 format"),
  body("amount")
    .notEmpty()
    .withMessage("Amount is required")
    .isDecimal({ decimal_digits: "0,2" })
    .withMessage("Amount must be a decimal with up to 2 decimals"),
  body("paymentMode")
    .optional()
    .isIn(paymentModes)
    .withMessage(`PaymentMode must be one of: ${paymentModes.join(", ")}`),
  body("paymentReference").optional().isString(),
  body("remark").optional().isString(),
];

// Validate expense ID param
const validateExpenseId = [
  param("id").isInt({ gt: 0 }).withMessage("Valid expense ID is required"),
];

// Validate query params for list (pagination, filters, sorting)
const validateExpenseQuery = [
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("limit").optional().isInt({ min: 1 }).toInt(),
  query("sortBy")
    .optional()
    .isIn(["date", "createdAt", "updatedAt", "amount"])
    .withMessage("Invalid sortBy field"),
  query("sortOrder")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("Invalid sortOrder value"),
  query("filters").optional().custom((value) => {
    if (typeof value === "string") {
      try {
        JSON.parse(value);
        return true;
      } catch {
        throw new Error("Invalid JSON for filters");
      }
    }
    return true;
  }),
];

// Validate bulk delete request body
const validateBulkDelete = [
  body("ids")
    .isArray({ min: 1 })
    .withMessage("Array of expense IDs is required"),
  body("ids.*")
    .isInt({ gt: 0 })
    .withMessage("Each expense ID must be a positive integer"),
];

export {
  validateExpense,
  validateExpenseId,
  validateExpenseQuery,
  validateBulkDelete,
};
export default {
  validateExpense,
  validateExpenseId,
  validateExpenseQuery,
  validateBulkDelete,
};
