/**
 * @file express-validator middlewares for sale resource.
 */

import { body, param } from "express-validator";
import { PaymentMode } from "@prisma/client";

// Convert Prisma enums → arrays
const PAYMENT_MODES = Object.values(PaymentMode);

// --------------------
// Validate sale ID param
// --------------------
const validateSaleReturnId = [
  param("id")
    .exists()
    .withMessage("Sale Return ID param is required")
    .isInt({ gt: 0 })
    .withMessage("Sale Return ID must be a positive integer")
    .toInt()
];

// --------------------
// Validate sale create body
// --------------------
const validateCreateSaleReturn = [
  // ---- Core fields ----
  body("partyId").exists().withMessage("Party ID is required").isInt({ gt: 0 }).toInt(),

  body("date").optional().isISO8601().withMessage("Date must be ISO8601"),

  body("paymentMode")
    .optional()
    .isIn(PAYMENT_MODES)
    .withMessage(`Payment mode must be one of: ${PAYMENT_MODES.join(", ")}`),

  body("reason").optional().isString().trim(),

  body("paidAmount").optional().isDecimal().toFloat(),

  body("totalAmount").exists().withMessage("Total amount is required").isDecimal().toFloat(),

  body("totalTaxableAmount").exists().isDecimal().toFloat(),

  body("totalGstAmount").exists().isDecimal().toFloat(),

  // ---- Items ----
  body("items").exists().isArray({ min: 1 }).withMessage("At least one sale item is required"),

  body("items.*.productId").exists().isInt({ gt: 0 }).toInt(),

  body("items.*.quantity").exists().isDecimal().toFloat(),

  body("items.*.pricePerUnit").exists().isDecimal().toFloat(),

  body("items.*.gstRate").exists().isDecimal().toFloat(),

  body("items.*.gstAmount").exists().isDecimal().toFloat(),

  body("items.*.taxableAmount").exists().isDecimal().toFloat(),

  body("items.*.amount").exists().isDecimal().toFloat()
];

// --------------------
// Validate sale update body
// --------------------
const validateUpdateSaleReturn = [
  body("partyId").optional().isInt({ gt: 0 }).toInt(),

  body("date").optional().isISO8601(),

  body("paymentMode").optional().isIn(PAYMENT_MODES),

  body("reason").optional().isString().trim(),

  body("paidAmount").optional().isDecimal().toFloat(),

  body("totalAmount").optional().isDecimal().toFloat(),

  body("totalTaxableAmount").optional().isDecimal().toFloat(),

  body("totalGstAmount").optional().isDecimal().toFloat(),

  body("items").optional().isArray({ min: 1 }),

  body("items.*.productId").optional().isInt({ gt: 0 }).toInt(),

  body("items.*.quantity").optional().isDecimal().toFloat(),

  body("items.*.pricePerUnit").optional().isDecimal().toFloat(),

  body("items.*.gstRate").optional().isDecimal().toFloat(),

  body("items.*.gstAmount").optional().isDecimal().toFloat(),

  body("items.*.taxableAmount").optional().isDecimal().toFloat(),

  body("items.*.amount").optional().isDecimal().toFloat()
];

// --------------------
// Exports
// --------------------
export { validateCreateSaleReturn, validateUpdateSaleReturn, validateSaleReturnId };

export default {
  validateCreateSaleReturn,
  validateUpdateSaleReturn,
  validateSaleReturnId
};
