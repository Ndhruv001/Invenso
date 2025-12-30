// src/validations/product.schema.js
import * as Yup from "yup";
import { ACP_SHEET_SIZES } from "@/constants/ACP_SHEET_SIZES";

const productSchema = Yup.object({
  name: Yup.string()
    .required("Product name is required")
    .min(2, "Product name must be at least 2 characters")
    .max(100, "Product name must be less than 100 characters"),

  categoryId: Yup.number()
    .typeError("Category is required")
    .required("Category is required")
    .integer("Category must be a valid ID")
    .positive("Category must be valid"),

  hsnCode: Yup.string()
    .nullable()
    .trim()
    .notRequired(),

  size: Yup.string()
    .nullable()
    .oneOf(ACP_SHEET_SIZES, "Invalid size option")
    .notRequired(), // backend allows optional

  unit: Yup.string()
    .required("Unit is required"),

  openingStock: Yup.number()
    .typeError("Opening stock must be a number")
    .nullable()
    .notRequired(),

  threshold: Yup.number()
    .typeError("Threshold must be a number")
    .min(0, "Threshold cannot be negative")
    .integer("Threshold must be a whole number")
    .nullable()
    .notRequired(),

  description: Yup.string()
    .nullable()
    .max(500, "Description must be less than 500 characters")
    .notRequired(),
});

export default productSchema;
export { productSchema };
