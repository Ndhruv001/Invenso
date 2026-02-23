/**
 * @file express-validator middlewares for party resource.
 */

import { body, param, query } from "express-validator";
import { PartyType } from "@prisma/client";

// Convert Prisma enums → arrays (IMPORTANT)
const PARTY_TYPES = Object.values(PartyType);

// --------------------
// Validate party ID param
// --------------------
const validatePartyId = [
  param("id")
    .exists()
    .withMessage("Party ID is required")
    .isInt({ gt: 0 })
    .withMessage("Party ID must be a positive integer")
    .toInt()
];

// --------------------
// Validate party create body
// --------------------
const validateCreateParty = [
  body("name").exists().withMessage("Party name is required").isString().trim().notEmpty(),

  body("type")
    .exists()
    .withMessage("Party type is required")
    .isIn(PARTY_TYPES)
    .withMessage(`Party type must be one of: ${PARTY_TYPES.join(", ")}`),

  body("identifier").optional().isString().trim(),

  body("phone").optional().isString().trim(),

  body("gstNumber").optional().isString().trim(),

  body("openingBalance").optional().isDecimal().toFloat(),

  body("remark").optional().isString().trim()
];

// --------------------
// Validate party update body
// --------------------
const validateUpdateParty = [
  body("name").optional().isString().trim().notEmpty(),

  body("type")
    .optional()
    .isIn(PARTY_TYPES)
    .withMessage(`Party type must be one of: ${PARTY_TYPES.join(", ")}`),

  body("identifier").optional().isString().trim(),

  body("phone").optional().isString().trim(),

  body("gstNumber").optional().isString().trim(),

  body("openingBalance").optional().isDecimal().toFloat(),

  body("remark").optional().isString().trim()
];

// --------------------
// Validate query for suggest/search
// --------------------
const validateSuggest = [query("q").exists().isString().trim().notEmpty()];

// --------------------
// Exports
// --------------------
export { validateCreateParty, validateUpdateParty, validatePartyId, validateSuggest };

export default {
  validateCreateParty,
  validateUpdateParty,
  validatePartyId,
  validateSuggest
};
