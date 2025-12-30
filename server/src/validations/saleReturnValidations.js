/**
 * validations/saleReturnValidations.js
 * Validation rules for SaleReturn resource.
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

// Validate sale return create/update
const validateSaleReturn = [
  body("partyId")
    .notEmpty()
    .withMessage("Party ID is required")
    .isInt({ gt: 0 })
    .withMessage("Party ID must be a positive integer"),
  body("saleId")
    .optional()
    .isInt({ gt: 0 })
    .withMessage("Sale ID must be a positive integer if provided"),
  body("date").optional().isISO8601().withMessage("Date must be ISO8601 format"),
  body("paidAmount")
    .optional()
    .isDecimal({ decimal_digits: "0,2" })
    .withMessage("Paid amount must be a decimal with up to 2 decimals"),
  body("paymentMode")
    .optional()
    .isIn(paymentModes)
    .withMessage(`Payment Mode must be one of: ${paymentModes.join(", ")}`),
  body("paymentReference").optional().isString(),
  body("reason").optional().isString(),

  // Validate saleReturnItems array
  body("saleReturnItems")
    .isArray({ min: 1 })
    .withMessage("Sale return items must be an array with at least 1 item"),
  body("saleReturnItems.*.productId")
    .notEmpty()
    .withMessage("Product ID is required for each return item")
    .isInt({ gt: 0 }),
  body("saleReturnItems.*.size").optional().isString(),
  body("saleReturnItems.*.quantity")
    .notEmpty()
    .withMessage("Quantity is required for each return item")
    .isDecimal({ decimal_digits: "0,3" }),
  body("saleReturnItems.*.pricePerUnit")
    .notEmpty()
    .withMessage("Price per unit is required for each return item")
    .isDecimal({ decimal_digits: "0,2" }),
  body("saleReturnItems.*.gstRate")
    .notEmpty()
    .withMessage("GST rate is required for each return item")
    .isDecimal({ decimal_digits: "0,2" }),
  body("saleReturnItems.*.gstAmount")
    .notEmpty()
    .withMessage("GST amount is required for each return item")
    .isDecimal({ decimal_digits: "0,2" }),
  body("saleReturnItems.*.taxableAmount")
    .notEmpty()
    .withMessage("Taxable amount is required for each return item")
    .isDecimal({ decimal_digits: "0,2" }),
  body("saleReturnItems.*.totalAmount")
    .notEmpty()
    .withMessage(
      "Total amount is required for each return item"
    )
    .isDecimal({ decimal_digits: "0,2" }),
  body("saleReturnItems.*.profitLoss")
    .optional()
    .isDecimal({ decimal_digits: "0,2" }),
];

// Validate sale return ID param
const validateSaleReturnId = [
  param("id").isInt({ gt: 0 }).withMessage("Valid sale return ID is required"),
];

// Validate query params for list
const validateSaleReturnQuery = [
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("limit").optional().isInt({ min: 1 }).toInt(),
  query("sortBy")
    .optional()
    .isIn(["date", "createdAt", "updatedAt", "totalAmount", "paidAmount", "totalProfitLoss"])
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

// Validate bulk delete
const validateBulkDelete = [
  body("ids")
    .isArray({ min: 1 })
    .withMessage("Array of sale return IDs is required"),
  body("ids.*")
    .isInt({ gt: 0 })
    .withMessage("Each sale return ID must be a positive integer"),
];

export {
  validateSaleReturn,
  validateSaleReturnId,
  validateSaleReturnQuery,
  validateBulkDelete,
};
export default {
  validateSaleReturn,
  validateSaleReturnId,
  validateSaleReturnQuery,
  validateBulkDelete,
};
