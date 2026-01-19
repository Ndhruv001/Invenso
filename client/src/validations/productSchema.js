// src/validations/product.schema.js
import * as Yup from "yup";
import { ACP_SHEET_SIZES } from "@/constants/ACP_SHEET_SIZES";
import { UNIT_TYPES } from "@/constants/UNIT_TYPES"; 
// UNIT_TYPES = ["PCS","METER","KG","LITER","BOX","PACKET","ROLL","SHEET","SQF"]

const productSchema = Yup.object({
  name: Yup.string()
    .trim()
    .required("Product name is required")
    .min(2, "Product name must be at least 2 characters")
    .max(100, "Product name must be less than 100 characters"),

  categoryId: Yup.number()
    .typeError("Category is required")
    .required("Category is required")
    .integer("Category must be a valid ID")
    .positive("Category must be valid"),

  hsnCode: Yup.string()
    .trim()
    .nullable()
    .max(20, "HSN code must be less than 20 characters")
    .notRequired(),

  size: Yup.string()
    .required("Size is required")
    .oneOf(ACP_SHEET_SIZES, "Invalid size option"),

  unit: Yup.string()
    .required("Unit is required")
    .oneOf(UNIT_TYPES, "Invalid unit type"),

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
    .max(500, "Description must be less than 500 characters")
    .notRequired(),
});

export default productSchema;
export { productSchema };
