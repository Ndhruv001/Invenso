/**
 * @file express-validator middlewares for transport resource.
 */

import { body, param } from "express-validator";
import { PaymentMode, DriverShift } from "@prisma/client";

// Convert Prisma enums → arrays
const PAYMENT_MODES = Object.values(PaymentMode);
const DRIVER_SHIFTS = Object.values(DriverShift);
// --------------------
// Validate transport ID param
// --------------------
const validateTransportId = [
  param("id")
    .exists()
    .withMessage("Transport ID is required")
    .isInt({ gt: 0 })
    .withMessage("Transport ID must be a positive integer")
    .toInt()
];

// --------------------
// Validate transport create body
// --------------------
const validateCreateTransport = [
  body("date").optional().isISO8601().toDate(),

  body("partyId").exists().withMessage("Party ID is required").isInt({ gt: 0 }).toInt(),

  body("driverId").exists().withMessage("Driver ID is required").isInt({ gt: 0 }).toInt(),

  body("shift")
    .optional()
    .isIn(DRIVER_SHIFTS)
    .withMessage(`Driver shift must be one of: ${DRIVER_SHIFTS.join(", ")}`),

  body("fromLocation")
    .exists()
    .withMessage("From Location is required")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("From Location cannot be empty"),

  body("toLocation")
    .exists()
    .withMessage("To Location is required")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("To Location cannot be empty"),

  body("amount")
    .exists()
    .withMessage("Amount is required")
    .isDecimal({ decimal_digits: "0,2" })
    .toFloat(),

  body("receivedAmount").optional().isDecimal({ decimal_digits: "0,2" }).toFloat(),

  body("paymentMode")
    .optional()
    .isIn(PAYMENT_MODES)
    .withMessage(`Payment mode must be one of: ${PAYMENT_MODES.join(", ")}`),

  body("paymentReference").optional().isString().trim(),

  body("remark").optional().isString().trim()
];

// --------------------
// Validate transport update body
// --------------------
const validateUpdateTransport = [
  body("date").optional().isISO8601().toDate(),

  body("partyId").optional().isInt({ gt: 0 }).toInt(),

  body("driverId").optional().isInt({ gt: 0 }).toInt(),

  body("shift").optional().isIn(DRIVER_SHIFTS),

  body("fromLocation").optional().isString().trim().notEmpty(),

  body("toLocation").optional().isString().trim().notEmpty(),

  body("amount").optional().isDecimal({ decimal_digits: "0,2" }).toFloat(),

  body("receivedAmount").optional().isDecimal({ decimal_digits: "0,2" }).toFloat(),

  body("paymentMode").optional().isIn(PAYMENT_MODES),

  body("paymentReference").optional().isString().trim(),

  body("remark").optional().isString().trim()
];

// --------------------
// Exports
// --------------------
export { validateCreateTransport, validateUpdateTransport, validateTransportId };

export default {
  validateCreateTransport,
  validateUpdateTransport,
  validateTransportId
};
