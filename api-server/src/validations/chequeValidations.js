/**
 * @file express-validator middlewares for cheque resource.
 */

import { body, param } from "express-validator";
import { ChequeType, ChequeStatus } from "@prisma/client";

// Convert Prisma enums → arrays (IMPORTANT)
const CHEQUE_TYPES = Object.values(ChequeType);
const CHEQUE_STATUSES = Object.values(ChequeStatus);

// --------------------
// Validate cheque ID param
// --------------------
const validateChequeId = [
  param("id")
    .exists()
    .withMessage("Cheque ID is required")
    .isInt({ gt: 0 })
    .withMessage("Cheque ID must be a positive integer")
    .toInt()
];

// --------------------
// Validate cheque create body
// --------------------
const validateCreateCheque = [
  body("chequeNumber").exists().withMessage("Cheque number is required").isString().trim(),

  body("type")
    .exists()
    .withMessage("Cheque type is required")
    .isIn(CHEQUE_TYPES)
    .withMessage(`Cheque type must be one of: ${CHEQUE_TYPES.join(", ")}`),

  body("status")
    .exists()
    .withMessage("Cheque status is required")
    .isIn(CHEQUE_STATUSES)
    .withMessage(`Cheque status must be one of: ${CHEQUE_STATUSES.join(", ")}`),

  body("partyId")
    .exists()
    .withMessage("Party ID is required")
    .isInt({ gt: 0 })
    .withMessage("Party ID must be a positive integer")
    .toInt(),

  body("amount")
    .exists()
    .withMessage("Amount is required")
    .isDecimal({ decimal_digits: "0,2" })
    .toFloat(),

  body("bankName").exists().withMessage("Bank name is required").isString().trim(),

  body("chequeDate")
    .exists()
    .withMessage("Cheque date is required")
    .isISO8601()
    .withMessage("Cheque date must be a valid date")
    .toDate(),

  body("depositDate")
    .optional({ values: "falsy" }) // ignores "", null, undefined
    .isISO8601()
    .withMessage("Deposit date must be a valid date"),

  body("clearDate")
    .optional({ values: "falsy" })
    .isISO8601()
    .withMessage("Clear date must be a valid date"),

  body("bounceReason").optional().isString().trim()
];

// --------------------
// Validate cheque update body
// --------------------
const validateUpdateCheque = [
  body("chequeNumber").optional().isString().trim(),

  body("type").optional().isIn(CHEQUE_TYPES),

  body("status").optional().isIn(CHEQUE_STATUSES),

  body("partyId")
    .optional()
    .isInt({ gt: 0 })
    .withMessage("Party ID must be a positive integer")
    .toInt(),

  body("amount").optional().isDecimal({ decimal_digits: "0,2" }).toFloat(),

  body("bankName").optional().isString().trim(),

  body("chequeDate")
    .optional()
    .isISO8601()
    .withMessage("Cheque date must be a valid date")
    .toDate(),

  body("depositDate")
    .optional()
    .isISO8601()
    .withMessage("Deposit date must be a valid date")
    .toDate(),

  body("clearDate").optional().isISO8601().withMessage("Clear date must be a valid date").toDate(),

  body("bounceReason").optional().isString().trim()
];

// --------------------
// Exports
// --------------------

export { validateCreateCheque, validateUpdateCheque, validateChequeId };

export default {
  validateCreateCheque,
  validateUpdateCheque,
  validateChequeId
};
