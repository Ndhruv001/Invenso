/**
 * validations/adjustStockValidations.js
 * Validation rules for adjustStock resource using express-validator.
 */

import { body } from "express-validator";

const adjustmentTypes = ["ADD", "SUBTRACT"];

const validateAdjustStock = [
  body("productId")
    .notEmpty()
    .withMessage("Product ID is required")
    .isInt({ gt: 0 })
    .withMessage("Product ID must be a positive integer"),
  body("type")
    .notEmpty()
    .withMessage("Type is required")
    .isIn(adjustmentTypes)
    .withMessage(`Type must be one of: ${adjustmentTypes.join(", ")}`),
  body("quantity")
    .notEmpty()
    .withMessage("Quantity is required")
    .isFloat({ gt: 0 })
    .withMessage("Quantity must be a positive number"),
  body("remark").optional().isString(),
];

export { validateAdjustStock };
export default { validateAdjustStock };
