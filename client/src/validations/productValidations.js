// src/validations/product.schema.js
import * as Yup from "yup";
import { UNIT_TYPES } from "@/constants/UNIT_TYPES";

const productCreateSchema = Yup.object({
  name: Yup.string()
    .trim()
    .required("Product name is required")
    .min(2, "Product name must be at least 2 characters")
    .max(100, "Product name must be less than 100 characters"),

  categoryId: Yup.number()
    .typeError("Category is required")
    .integer("Category must be a valid ID")
    .positive("Category must be valid")
    .required("Category is required"),

  hsnCode: Yup.string()
    .trim()
    .nullable()
    .max(20, "HSN code must be less than 20 characters"),

  unit: Yup.string()
    .oneOf(UNIT_TYPES, "Invalid unit type")
    .required("Unit is required"),

  openingStock: Yup.number()
    .transform((value, originalValue) =>
      originalValue === "" || originalValue === null ? 0 : value
    )
    .typeError("Opening stock must be a number")
    .min(0, "Opening stock cannot be negative")
    .nullable(),

  threshold: Yup.number()
    .transform((value, originalValue) =>
      originalValue === "" || originalValue === null ? 0 : value
    )
    .typeError("Threshold must be a number")
    .min(0, "Threshold cannot be negative")
    .nullable(),

  description: Yup.string()
    .trim()
    .nullable()
    .max(500, "Description must be less than 500 characters"),
}).noUnknown(true);

const productUpdateSchema = Yup.object({
  name: Yup.string()
    .trim()
    .min(2, "Product name must be at least 2 characters")
    .max(100, "Product name must be less than 100 characters")
    .notRequired(),

  categoryId: Yup.number()
    .integer("Category must be a valid ID")
    .positive("Category must be valid")
    .notRequired(),

  hsnCode: Yup.string()
    .trim()
    .nullable()
    .max(20, "HSN code must be less than 20 characters")
    .notRequired(),

  unit: Yup.string()
    .oneOf(UNIT_TYPES, "Invalid unit type")
    .notRequired(),

  openingStock: Yup.number()
    .transform((value, originalValue) =>
      originalValue === "" || originalValue === null ? 0 : value
    )
    .min(0, "Opening stock cannot be negative")
    .nullable()
    .notRequired(),

  threshold: Yup.number()
    .transform((value, originalValue) =>
      originalValue === "" || originalValue === null ? 0 : value
    )
    .min(0, "Threshold cannot be negative")
    .nullable()
    .notRequired(),

  description: Yup.string()
    .trim()
    .nullable()
    .max(500, "Description must be less than 500 characters")
    .notRequired(),
}).noUnknown(true);

export { productCreateSchema, productUpdateSchema };
export default { productCreateSchema, productUpdateSchema };