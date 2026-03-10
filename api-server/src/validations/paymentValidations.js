/**
 * @file express-validator middlewares for payment resource.
 */

import { body, param, query } from "express-validator";
import { PaymentType, PaymentMode, PaymentReferenceType } from "@prisma/client";

// Convert Prisma enums → arrays (IMPORTANT)
const PAYMENT_TYPES = Object.values(PaymentType);
const PAYMENT_MODES = Object.values(PaymentMode);
const REFERENCE_TYPES = Object.values(PaymentReferenceType);

// --------------------
// Validate payment ID param
// --------------------
const validatePaymentId = [
  param("id")
    .exists()
    .withMessage("Payment ID is required")
    .isInt({ gt: 0 })
    .withMessage("Payment ID must be a positive integer")
    .toInt()
];

// --------------------
// Validate payment create body
// --------------------
const validateCreatePayment = [
  body("date").optional().isISO8601().toDate(),

  body("partyId").optional().isInt({ gt: 0 }).toInt(),

  body("type")
    .exists()
    .withMessage("Payment type is required")
    .isIn(PAYMENT_TYPES)
    .withMessage(`Payment type must be one of: ${PAYMENT_TYPES.join(", ")}`),

  body("amount")
    .exists()
    .withMessage("Amount is required")
    .isDecimal({ decimal_digits: "0,2" })
    .toFloat(),

  body("paymentMode")
    .optional()
    .isIn(PAYMENT_MODES)
    .withMessage(`Payment mode must be one of: ${PAYMENT_MODES.join(", ")}`),

  body("referenceType")
    .exists()
    .withMessage("Reference type is required")
    .isIn(REFERENCE_TYPES)
    .withMessage(`Reference type must be one of: ${REFERENCE_TYPES.join(", ")}`),

  body("remark").optional().isString().trim(),

];

// --------------------
// Validate payment update body
// --------------------
const validateUpdatePayment = [
  body("date").optional().isISO8601().toDate(),

  body("partyId").optional().isInt({ gt: 0 }).toInt(),

  body("type").optional().isIn(PAYMENT_TYPES),

  body("amount").optional().isDecimal({ decimal_digits: "0,2" }).toFloat(),

  body("paymentMode").optional().isIn(PAYMENT_MODES),

  body("referenceType").optional().isIn(REFERENCE_TYPES),

  body("remark").optional().isString().trim(),

];

// --------------------
// Exports
// --------------------
export { validateCreatePayment, validateUpdatePayment, validatePaymentId };

export default {
  validateCreatePayment,
  validateUpdatePayment,
  validatePaymentId
};
