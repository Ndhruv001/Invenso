// src/validations/expenseValidations.js
import * as Yup from "yup";
import PAYMENT_MODES from "@/constants/PAYMENT_MODES";

/**
 * ---------------------------
 * CREATE EXPENSE
 * ---------------------------
 */
const expenseCreateSchema = Yup.object({
  categoryId: Yup.number()
    .transform((value, originalValue) =>
      originalValue === "" || originalValue === null ? null : value
    )
    .integer("Category must be valid")
    .positive("Category must be valid")
    .required("Category is required"),

  date: Yup.date().typeError("Invalid expense date").required("Expense date is required"),

  amount: Yup.number()
    .transform((value, originalValue) =>
      originalValue === "" || originalValue === null ? 0 : value
    )
    .typeError("Amount must be a number")
    .positive("Amount must be greater than zero")
    .required("Amount is required"),

  paymentMode: Yup.string()
    .oneOf(PAYMENT_MODES, "Invalid payment mode")
    .required("Payment mode is required"),

  paymentReference: Yup.string()
    .trim()
    .nullable()
    .max(100, "Payment reference must be less than 100 characters"),

  remark: Yup.string().trim().nullable().max(500, "Remark must be less than 500 characters")
}).noUnknown(true);

/**
 * ---------------------------
 * UPDATE EXPENSE
 * ---------------------------
 */
const expenseUpdateSchema = Yup.object({
  categoryId: Yup.number()
    .integer("Category must be valid")
    .positive("Category must be valid")
    .nullable()
    .notRequired(),

  date: Yup.date().typeError("Invalid expense date").notRequired(),

  amount: Yup.number()
    .typeError("Amount must be a number")
    .positive("Amount must be greater than zero")
    .notRequired(),

  paymentMode: Yup.string().oneOf(PAYMENT_MODES, "Invalid payment mode").notRequired(),

  paymentReference: Yup.string()
    .trim()
    .nullable()
    .max(100, "Payment reference must be less than 100 characters")
    .notRequired(),

  remark: Yup.string()
    .trim()
    .nullable()
    .max(500, "Remark must be less than 500 characters")
    .notRequired()
}).noUnknown(true);

export { expenseCreateSchema, expenseUpdateSchema };
export default { expenseCreateSchema, expenseUpdateSchema };
