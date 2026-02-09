/**
 * @file express-validator middlewares for expense resource.
 */

import { body, param } from "express-validator";
import { PaymentMode } from "@prisma/client";

// Convert Prisma enums → arrays (IMPORTANT)
const PAYMENT_MODES = Object.values(PaymentMode);

// --------------------
// Validate expense ID param
// --------------------
const validateExpenseId = [
  param("id")
    .exists()
    .withMessage("Expense ID is required")
    .isInt({ gt: 0 })
    .withMessage("Expense ID must be a positive integer")
    .toInt()
];

// --------------------
// Validate expense create body
// --------------------
const validateCreateExpense = [
  body("date").optional().isISO8601().withMessage("Date must be a valid ISO8601 date").toDate(),

  body("categoryId")
    .exists()
    .withMessage("Category ID is required")
    .isInt({ gt: 0 })
    .withMessage("Category ID must be a positive integer")
    .toInt(),

  body("amount")
    .exists()
    .withMessage("Amount is required")
    .isDecimal({ decimal_digits: "0,2" })
    .withMessage("Amount must be a valid decimal with up to 2 digits")
    .toFloat(),

  body("paymentMode")
    .optional()
    .isIn(PAYMENT_MODES)
    .withMessage(`Payment mode must be one of: ${PAYMENT_MODES.join(", ")}`),

  body("paymentReference")
    .optional()
    .isString()
    .withMessage("Payment reference must be a string")
    .trim(),

  body("remark").optional().isString().withMessage("Remark must be a string").trim()
];

// --------------------
// Validate expense update body
// --------------------
const validateUpdateExpense = [
  body("date").optional().isISO8601().withMessage("Date must be a valid ISO8601 date").toDate(),

  body("categoryId")
    .optional()
    .isInt({ gt: 0 })
    .withMessage("Category ID must be a positive integer")
    .toInt(),

  body("amount")
    .optional()
    .isDecimal({ decimal_digits: "0,2" })
    .withMessage("Amount must be a valid decimal with up to 2 digits")
    .toFloat(),

  body("paymentMode")
    .optional()
    .isIn(PAYMENT_MODES)
    .withMessage(`Payment mode must be one of: ${PAYMENT_MODES.join(", ")}`),

  body("paymentReference")
    .optional()
    .isString()
    .withMessage("Payment reference must be a string")
    .trim(),

  body("remark").optional().isString().withMessage("Remark must be a string").trim()
];

// --------------------
// Exports
// --------------------
export { validateCreateExpense, validateUpdateExpense, validateExpenseId };

export default {
  validateCreateExpense,
  validateUpdateExpense,
  validateExpenseId
};
