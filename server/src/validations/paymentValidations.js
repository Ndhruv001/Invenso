/**
 * validations/paymentValidations.js
 * Validation rules for Payment resource using express-validator.
 */

import { body, param, query } from "express-validator";

const paymentTypes = ["RECEIVED", "PAID"];
const paymentReferenceTypes = [
  "PURCHASE",
  "SALE",
  "PURCHASE_RETURN",
  "SALE_RETURN",
  "GENERAL",
  "TRANSPORT",
  "OTHER",
];
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

// Validate payment fields for create/update
const validatePayment = [
  body("partyId")
    .optional({ nullable: true })
    .isInt({ gt: 0 })
    .withMessage("Party ID must be a positive integer if provided"),
  body("type")
    .notEmpty()
    .isIn(paymentTypes)
    .withMessage(`Type must be one of: ${paymentTypes.join(", ")}`),
  body("referenceType")
    .notEmpty()
    .isIn(paymentReferenceTypes)
    .withMessage(`ReferenceType must be one of: ${paymentReferenceTypes.join(", ")}`),
  body("amount")
    .notEmpty()
    .isDecimal({ decimal_digits: "0,2" })
    .withMessage("Amount must be a decimal up to 2 decimal places"),
  body("paymentMode")
    .optional()
    .isIn(paymentModes)
    .withMessage(`PaymentMode must be one of: ${paymentModes.join(", ")}`),
  body("paymentReference").optional().isString(),
  body("remark").optional().isString(),
];

// Validate payment ID param
const validatePaymentId = [
  param("id").isInt({ gt: 0 }).withMessage("Valid payment ID is required"),
];

// Validate query params for list (pagination, filters, search, sorting)
const validatePaymentQuery = [
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
    .withMessage("Array of payment IDs is required"),
  body("ids.*")
    .isInt({ gt: 0 })
    .withMessage("Each payment ID must be a positive integer"),
];

export {
  validatePayment,
  validatePaymentId,
  validatePaymentQuery,
  validateBulkDelete,
};
export default {
  validatePayment,
  validatePaymentId,
  validatePaymentQuery,
  validateBulkDelete,
};
