// src/validations/categoryValidations.js
import * as Yup from "yup";
import { CATEGORY_TYPES } from "@/constants/CATEGORY_TYPES";

const categoryCreateSchema = Yup.object({
  name: Yup.string()
    .trim()
    .required("Category name is required")
    .min(2, "Category name must be at least 2 characters")
    .max(100, "Category name must be less than 100 characters"),

  type: Yup.string()
    .oneOf(CATEGORY_TYPES, "Invalid category type")
    .notRequired(),

  description: Yup.string()
    .trim()
    .nullable()
    .max(500, "Description must be less than 500 characters"),
}).noUnknown(true);

const categoryUpdateSchema = Yup.object({
  name: Yup.string()
    .trim()
    .min(2, "Category name must be at least 2 characters")
    .max(100, "Category name must be less than 100 characters")
    .notRequired(),

  type: Yup.string()
    .oneOf(CATEGORY_TYPES, "Invalid category type")
    .notRequired(),

  description: Yup.string()
    .trim()
    .nullable()
    .max(500, "Description must be less than 500 characters")
    .notRequired(),

  isActive: Yup.boolean()
    .typeError("isActive must be true or false")
    .notRequired(),
}).noUnknown(true);

export { categoryCreateSchema, categoryUpdateSchema };
export default { categoryCreateSchema, categoryUpdateSchema };
