import * as Yup from "yup";
import { INVENTORY_LOG_TYPES } from "@/constants/INVENTORY_LOG_TYPES";

const stockAdjustmentCreateSchema = Yup.object({
  productId: Yup.number()
    .typeError("Product is required")
    .required("Product is required")
    .integer("Invalid product ID")
    .positive("Invalid product ID"),

  quantity: Yup.number()
    .typeError("Quantity must be a number")
    .required("Quantity is required")
    .positive("Quantity must be greater than 0"),

  type: Yup.string()
    .oneOf(INVENTORY_LOG_TYPES, "Invalid adjustment type")
    .required("Adjustment type is required"),

  reason: Yup.string()
    .trim()
    .nullable()
    .max(500, "Reason must be less than 500 characters"),
}).noUnknown(true);

export { stockAdjustmentCreateSchema };
export default { stockAdjustmentCreateSchema };
