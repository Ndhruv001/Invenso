/**
 * validations/purchaseValidations.js
 * Validation rules for Purchase resource using express-validator.
 */

import { body, param, query } from "express-validator";
import { createListValidation } from "../middlewares/listValidation.js";

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

// Validate purchase create/update
const validatePurchase = [
  body("partyId")
    .notEmpty()
    .withMessage("Party ID is required")
    .isInt({ gt: 0 })
    .withMessage("Party ID must be a positive integer"),
  body("date").optional().isISO8601().withMessage("Date must be ISO8601 format"),
  body("invoiceNumber").optional().isString(),
  body("paymentMode")
    .optional()
    .isIn(paymentModes)
    .withMessage(`Payment Mode must be one of: ${paymentModes.join(", ")}`),
  body("paymentReference").optional().isString(),
  body("remarks").optional().isString(),
  body("paidAmount")
    .optional()
    .isDecimal({ decimal_digits: "0,2" })
    .withMessage("Paid amount must be a decimal with up to 2 decimals"),
  body("totalAmount")
    .optional()
    .isDecimal({ decimal_digits: "0,2" })
    .withMessage("Total amount must be a decimal with up to 2 decimals"),
  body("totalTaxableAmount")
    .optional()
    .isDecimal({ decimal_digits: "0,2" }),
  body("totalGstAmount")
    .optional()
    .isDecimal({ decimal_digits: "0,2" }),

  // Validate purchase items array
  body("purchaseItems")
    .isArray({ min: 1 })
    .withMessage("Purchase items must be an array with at least 1 item"),
  body("purchaseItems.*.productId")
    .notEmpty()
    .withMessage("Product ID is required for each purchase item")
    .isInt({ gt: 0 }),
  body("purchaseItems.*.size").optional().isString(),
  body("purchaseItems.*.quantity")
    .notEmpty()
    .withMessage("Quantity is required for each purchase item")
    .isDecimal({ decimal_digits: "0,3" }),
  body("purchaseItems.*.pricePerUnit")
    .notEmpty()
    .withMessage("Price per unit is required for each purchase item")
    .isDecimal({ decimal_digits: "0,2" }),
  body("purchaseItems.*.gstRate")
    .notEmpty()
    .withMessage("GST rate is required for each purchase item")
    .isDecimal({ decimal_digits: "0,2" }),
  body("purchaseItems.*.gstAmount")
    .notEmpty()
    .withMessage("GST amount is required for each purchase item")
    .isDecimal({ decimal_digits: "0,2" }),
  body("purchaseItems.*.taxableAmount")
    .notEmpty()
    .withMessage("Taxable amount is required for each purchase item")
    .isDecimal({ decimal_digits: "0,2" }),
  body("purchaseItems.*.totalAmount")
    .notEmpty()
    .withMessage("Total amount is required for each purchase item")
    .isDecimal({ decimal_digits: "0,2" }),
];

// Validate purchase ID param
const validatePurchaseId = [
  param("id").isInt({ gt: 0 }).withMessage("Valid purchase ID is required"),
];

// Validate query params for list
const validatePurchaseQuery = createListValidation({
  // ✅ Allowed filter keys based on your filter config
  allowedFilterKeys: ["partyId", "paymentStatus", "invoiceNumber", "dateRange"],

  // ✅ Custom validation for specific filters
  customFilterValidators: {
    paymentStatus: (value) => {
      const PAYMENT_STATUSES = ["PAID", "PARTIAL", "NOT PAID"];
      if (!PAYMENT_STATUSES.includes(value)) {
        throw new Error(
          `Invalid paymentStatus filter: ${value}. Allowed: ${PAYMENT_STATUSES.join(", ")}`
        );
      }
    },
    dateRange: (value) => {
      // Expected value format: { from: "YYYY-MM-DD", to: "YYYY-MM-DD" }
      if (
        typeof value !== "object" ||
        !value.from ||
        !value.to
      ) {
        throw new Error("dateRange filter must contain 'from' and 'to' fields");
      }

      // Optionally, you could also check for valid date formats
      const isValidDate = (dateStr) => !isNaN(Date.parse(dateStr));
      if (!isValidDate(value.from) || !isValidDate(value.to)) {
        throw new Error("Invalid date format in dateRange filter");
      }
    },
  },
});

// Validate bulk delete request body
const validateBulkDelete = [
  body("ids")
    .isArray({ min: 1 })
    .withMessage("Array of purchase IDs is required"),
  body("ids.*")
    .isInt({ gt: 0 })
    .withMessage("Each purchase ID must be a positive integer"),
];

export {
  validatePurchase,
  validatePurchaseId,
  validatePurchaseQuery,
  validateBulkDelete,
};
export default {
  validatePurchase,
  validatePurchaseId,
  validatePurchaseQuery,
  validateBulkDelete,
};
