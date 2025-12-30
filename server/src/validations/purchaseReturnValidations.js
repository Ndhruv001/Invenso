/**
 * validations/purchaseReturnValidations.js
 * Validation rules for PurchaseReturn resource using express-validator.
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

// Validate purchase return create/update
const validatePurchaseReturn = [
  body("partyId")
    .notEmpty()
    .withMessage("Party ID is required")
    .isInt({ gt: 0 })
    .withMessage("Party ID must be a positive integer"),
  body("purchaseId")
    .optional()
    .isInt({ gt: 0 })
    .withMessage("Purchase ID must be a positive integer if provided"),
  body("date").optional().isISO8601().withMessage("Date must be ISO8601 format"),
  body("receivedAmount")
    .optional()
    .isDecimal({ decimal_digits: "0,2" })
    .withMessage("Received amount must be a decimal with up to 2 decimals"),
  body("paymentMode")
    .optional()
    .isIn(paymentModes)
    .withMessage(`Payment Mode must be one of: ${paymentModes.join(", ")}`),
  body("paymentReference").optional().isString(),
  body("reason").optional().isString(),

  // Validate purchaseReturnItems array
  body("purchaseReturnItems")
    .isArray({ min: 1 })
    .withMessage("Purchase return items must be an array with at least 1 item"),
  body("purchaseReturnItems.*.productId")
    .notEmpty()
    .withMessage("Product ID is required for each return item")
    .isInt({ gt: 0 }),
  body("purchaseReturnItems.*.size").optional().isString(),
  body("purchaseReturnItems.*.quantity")
    .notEmpty()
    .withMessage("Quantity is required for each return item")
    .isDecimal({ decimal_digits: "0,3" }),
  body("purchaseReturnItems.*.pricePerUnit")
    .notEmpty()
    .withMessage("Price per unit is required for each return item")
    .isDecimal({ decimal_digits: "0,2" }),
  body("purchaseReturnItems.*.gstRate")
    .notEmpty()
    .withMessage("GST rate is required for each return item")
    .isDecimal({ decimal_digits: "0,2" }),
  body("purchaseReturnItems.*.gstAmount")
    .notEmpty()
    .withMessage("GST amount is required for each return item")
    .isDecimal({ decimal_digits: "0,2" }),
  body("purchaseReturnItems.*.taxableAmount")
    .notEmpty()
    .withMessage("Taxable amount is required for each return item")
    .isDecimal({ decimal_digits: "0,2" }),
  body("purchaseReturnItems.*.totalAmount")
    .notEmpty()
    .withMessage("Total amount is required for each return item")
    .isDecimal({ decimal_digits: "0,2" }),
];

// Validate purchase return ID param
const validatePurchaseReturnId = [
  param("id").isInt({ gt: 0 }).withMessage("Valid purchase return ID is required"),
];

// Validate query params for list
const validatePurchaseReturnQuery = [
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("limit").optional().isInt({ min: 1 }).toInt(),
  query("sortBy")
    .optional()
    .isIn(["date", "createdAt", "updatedAt", "totalAmount", "receivedAmount"])
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
    .withMessage("Array of purchase return IDs is required"),
  body("ids.*")
    .isInt({ gt: 0 })
    .withMessage("Each purchase return ID must be a positive integer"),
];

export {
  validatePurchaseReturn,
  validatePurchaseReturnId,
  validatePurchaseReturnQuery,
  validateBulkDelete,
};
export default {
  validatePurchaseReturn,
  validatePurchaseReturnId,
  validatePurchaseReturnQuery,
  validateBulkDelete,
};
