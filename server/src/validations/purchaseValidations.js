/**
 * @file express-validator middlewares for purchase resource.
 */

import { body, param, query } from "express-validator";
import { PaymentMode } from "@prisma/client";

// Convert Prisma enums → arrays
const PAYMENT_MODES = Object.values(PaymentMode);

// --------------------
// Validate purchase ID param
// --------------------
const validatePurchaseId = [
  param("id")
    .exists().withMessage("Purchase ID param is required")
    .isInt({ gt: 0 }).withMessage("Purchase ID must be a positive integer")
    .toInt(),
];

// --------------------
// Validate purchase create/update body
// --------------------
const validatePurchase = [
  // ---- Core purchase fields ----
  body("partyId")
    .exists().withMessage("Party ID is required")
    .isInt({ gt: 0 })
    .withMessage("Party ID must be a positive integer")
    .toInt(),

  body("date")
    .optional()
    .isISO8601()
    .withMessage("Date must be in ISO8601 format"),

  // invoiceNumber is auto-generated → do NOT require
  body("invoiceNumber")
    .optional()
    .isInt({ gt: 0 })
    .toInt(),

  body("paymentMode")
    .optional()
    .isIn(PAYMENT_MODES)
    .withMessage(`Payment mode must be one of: ${PAYMENT_MODES.join(", ")}`),

  body("paymentReference")
    .optional()
    .isString()
    .trim(),

  body("remarks")
    .optional()
    .isString()
    .trim(),

  body("paidAmount")
    .optional()
    .isDecimal()
    .withMessage("Paid amount must be a decimal")
    .toFloat(),

  body("totalAmount")
    .exists().withMessage("Total amount is required")
    .isDecimal()
    .withMessage("Total amount must be a decimal")
    .toFloat(),

  body("totalTaxableAmount")
    .exists().withMessage("Total taxable amount is required")
    .isDecimal()
    .toFloat(),

  body("totalGstAmount")
    .exists().withMessage("Total GST amount is required")
    .isDecimal()
    .toFloat(),

  // ---- Purchase items ----
  body("purchaseItems")
    .exists().withMessage("Purchase items are required")
    .isArray({ min: 1 })
    .withMessage("Purchase items must be an array with at least one item"),

  body("purchaseItems.*.productId")
    .exists().withMessage("Product ID is required for each item")
    .isInt({ gt: 0 })
    .toInt(),

  body("purchaseItems.*.quantity")
    .exists().withMessage("Quantity is required for each item")
    .isDecimal()
    .withMessage("Quantity must be a decimal")
    .toFloat(),

  body("purchaseItems.*.pricePerUnit")
    .exists().withMessage("Price per unit is required for each item")
    .isDecimal()
    .withMessage("Price per unit must be a decimal")
    .toFloat(),

  body("purchaseItems.*.gstRate")
    .exists().withMessage("GST rate is required for each item")
    .isDecimal()
    .withMessage("GST rate must be a decimal")
    .toFloat(),

  body("purchaseItems.*.gstAmount")
    .exists().withMessage("GST amount is required for each item")
    .isDecimal()
    .withMessage("GST amount must be a decimal")
    .toFloat(),

  body("purchaseItems.*.taxableAmount")
    .exists().withMessage("Taxable amount is required for each item")
    .isDecimal()
    .withMessage("Taxable amount must be a decimal")
    .toFloat(),

  body("purchaseItems.*.amount")
    .exists().withMessage("Total amount is required for each item")
    .isDecimal()
    .withMessage("Total amount must be a decimal")
    .toFloat(),
];

// --------------------
// Exports
// --------------------
export {
  validatePurchase,
  validatePurchaseId,
};

export default {
  validatePurchase,
  validatePurchaseId,
};
