/**
 * validations/saleValidations.js
 * Validation rules for Sale resource using express-validator.
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

// Validate sale create/update
const validateSale = [
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
  body("receivedAmount")
    .optional()
    .isDecimal({ decimal_digits: "0,2" })
    .withMessage("Received amount must be a decimal with up to 2 decimals"),
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
  body("totalProfit")
    .optional()
    .isDecimal({ decimal_digits: "0,2" }),

  // Validate sale items array
  body("saleItems")
    .isArray({ min: 1 })
    .withMessage("Sale items must be an array with at least 1 item"),
  body("saleItems.*.productId")
    .notEmpty()
    .withMessage("Product ID is required for each sale item")
    .isInt({ gt: 0 }),
  body("saleItems.*.size").optional().isString(),
  body("saleItems.*.quantity")
    .notEmpty()
    .withMessage("Quantity is required for each sale item")
    .isDecimal({ decimal_digits: "0,3" }),
  body("saleItems.*.pricePerUnit")
    .notEmpty()
    .withMessage("Price per unit is required for each sale item")
    .isDecimal({ decimal_digits: "0,2" }),
  body("saleItems.*.gstRate")
    .notEmpty()
    .withMessage("GST rate is required for each sale item")
    .isDecimal({ decimal_digits: "0,2" }),
  body("saleItems.*.gstAmount")
    .notEmpty()
    .withMessage("GST amount is required for each sale item")
    .isDecimal({ decimal_digits: "0,2" }),
  body("saleItems.*.taxableAmount")
    .notEmpty()
    .withMessage("Taxable amount is required for each sale item")
    .isDecimal({ decimal_digits: "0,2" }),
  body("saleItems.*.totalAmount")
    .notEmpty()
    .withMessage("Total amount is required for each sale item")
    .isDecimal({ decimal_digits: "0,2" }),
  body("saleItems.*.profit")
    .optional()
    .isDecimal({ decimal_digits: "0,2" }),
];

// Validate sale ID param
const validateSaleId = [
  param("id").isInt({ gt: 0 }).withMessage("Valid sale ID is required"),
];

// Validate query params for list
const validateSaleQuery = [
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("limit").optional().isInt({ min: 1 }).toInt(),
  query("sortBy")
    .optional()
    .isIn(["date", "createdAt", "updatedAt", "totalAmount", "receivedAmount", "totalProfit"])
    .withMessage("Invalid sortBy value"),
  query("sortOrder")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("Invalid sortOrder value"),
  query("filters").optional().custom((value) => {
    if (typeof value === "string") {
      try {
        JSON.parse(value);
      } catch {
        throw new Error("Invalid JSON for filters");
      }
    }
    return true;
  }),
];

// Validate bulk delete body
const validateBulkDelete = [
  body("ids")
    .isArray({ min: 1 })
    .withMessage("Array of sale IDs is required"),
  body("ids.*")
    .isInt({ gt: 0 })
    .withMessage("Each sale ID must be a positive integer"),
];

export {
  validateSale,
  validateSaleId,
  validateSaleQuery,
  validateBulkDelete,
};
export default {
  validateSale,
  validateSaleId,
  validateSaleQuery,
  validateBulkDelete,
};
