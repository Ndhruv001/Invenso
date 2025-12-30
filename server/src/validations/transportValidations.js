/**
 * validations/transportValidations.js
 * Validation rules for Transport resource using express-validator.
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

// Validate fields for create/update transport
const validateTransport = [
  body("partyId")
    .notEmpty()
    .withMessage("Party ID is required")
    .isInt({ gt: 0 })
    .withMessage("Party ID must be a positive integer"),
  body("driverId")
    .notEmpty()
    .withMessage("Driver ID is required")
    .isInt({ gt: 0 })
    .withMessage("Driver ID must be a positive integer"),
  body("date").optional().isISO8601().withMessage("Date must be ISO8601 format"),
  body("shift").optional().isString(),
  body("fromLocation")
    .notEmpty()
    .withMessage("From Location is required")
    .isString(),
  body("toLocation")
    .notEmpty()
    .withMessage("To Location is required")
    .isString(),
  body("amount")
    .notEmpty()
    .withMessage("Amount is required")
    .isDecimal({ decimal_digits: "0,2" })
    .withMessage("Amount must be a decimal with up to 2 decimals"),
  body("receivedAmount")
    .optional()
    .isDecimal({ decimal_digits: "0,2" })
    .withMessage("Received Amount must be a decimal with up to 2 decimals"),
  body("paymentMode")
    .optional()
    .isIn(paymentModes)
    .withMessage(`Payment Mode must be one of: ${paymentModes.join(", ")}`),
  body("paymentReference").optional().isString(),
  body("remark").optional().isString(),
];

// Validate transport ID param
const validateTransportId = [
  param("id").isInt({ gt: 0 }).withMessage("Valid Transport ID is required"),
];

// Validate query params for listing transports
const validateTransportQuery = [
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("limit").optional().isInt({ min: 1 }).toInt(),
  query("sortBy")
    .optional()
    .isIn(["date", "createdAt", "updatedAt", "amount", "receivedAmount"])
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
    .withMessage("Array of transport IDs is required"),
  body("ids.*")
    .isInt({ gt: 0 })
    .withMessage("Each transport ID must be a positive integer"),
];

export {
  validateTransport,
  validateTransportId,
  validateTransportQuery,
  validateBulkDelete,
};
export default {
  validateTransport,
  validateTransportId,
  validateTransportQuery,
  validateBulkDelete,
};
