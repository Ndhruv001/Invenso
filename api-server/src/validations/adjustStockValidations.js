/**
 * @file express-validator middlewares for adjustStock resource.
 */

import { body } from "express-validator";
import { InventoryLogType } from "@prisma/client";

const INVENTORY_LOG_TYPES = Object.values(InventoryLogType);

// --------------------
// Validate create adjust stock body
// --------------------
const validateCreateAdjustStock = [
  body("productId")
    .exists()
    .withMessage("Product ID is required")
    .isInt({ gt: 0 })
    .withMessage("Product ID must be a positive integer")
    .toInt(),

  body("type")
    .exists()
    .withMessage("Type is required")
    .isIn(INVENTORY_LOG_TYPES)
    .withMessage(`Type must be one of: ${INVENTORY_LOG_TYPES.join(", ")}`),

  body("quantity")
    .exists()
    .withMessage("Quantity is required")
    .isFloat({ gt: 0 })
    .withMessage("Quantity must be a positive number")
    .toFloat(),

  body("remark").optional().isString().trim()
];

// --------------------
// Exports
// --------------------
export { validateCreateAdjustStock };

export default {
  validateCreateAdjustStock
};
