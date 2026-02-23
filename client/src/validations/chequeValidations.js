// src/validations/chequeValidations.js
import * as Yup from "yup";
import CHEQUE_TYPES from "@/constants/CHEQUE_TYPES";
import CHEQUE_STATUSES from "@/constants/CHEQUE_STATUSES";

/**
 * ---------------------------
 * CREATE CHEQUE
 * ---------------------------
 */
const chequeCreateSchema = Yup.object({
  chequeNumber: Yup.string()
    .trim()
    .required("Cheque number is required")
    .max(50, "Cheque number is too long"),

  type: Yup.string().oneOf(CHEQUE_TYPES, "Invalid cheque type").required("Cheque type is required"),

  status: Yup.string()
    .oneOf(CHEQUE_STATUSES, "Invalid cheque status")
    .required("Cheque status is required"),

  partyId: Yup.number()
    .transform((value, originalValue) =>
      originalValue === "" || originalValue === null ? null : value
    )
    .integer("Party must be valid")
    .positive("Party must be valid")
    .required("Party is required"),

  amount: Yup.number()
    .transform((value, originalValue) =>
      originalValue === "" || originalValue === null ? 0 : value
    )
    .typeError("Amount must be a number")
    .positive("Amount must be greater than zero")
    .required("Amount is required"),

  bankName: Yup.string().trim().required("Bank name is required").max(100, "Bank name is too long"),

  chequeDate: Yup.date().typeError("Invalid cheque date").required("Cheque date is required"),

  // Optional dates based on status
  depositDate: Yup.date()
    .nullable()
    .transform((value, originalValue) => (originalValue === "" ? null : value))
    .typeError("Invalid deposit date"),

  clearDate: Yup.date()
    .nullable()
    .transform((value, originalValue) => (originalValue === "" ? null : value))
    .typeError("Invalid clear date"),

  bounceReason: Yup.string()
    .trim()
    .nullable()
    .max(255, "Bounce reason must be less than 255 characters")
}).noUnknown(true);

/**
 * ---------------------------
 * UPDATE CHEQUE
 * ---------------------------
 */
const chequeUpdateSchema = Yup.object({
  chequeNumber: Yup.string().trim().max(50).notRequired(),

  type: Yup.string().oneOf(CHEQUE_TYPES, "Invalid cheque type").notRequired(),

  status: Yup.string().oneOf(CHEQUE_STATUSES, "Invalid cheque status").notRequired(),

  partyId: Yup.number()
    .integer("Party must be valid")
    .positive("Party must be valid")
    .nullable()
    .notRequired(),

  amount: Yup.number()
    .typeError("Amount must be a number")
    .positive("Amount must be greater than zero")
    .notRequired(),

  bankName: Yup.string().trim().max(100).notRequired(),

  chequeDate: Yup.date().typeError("Invalid cheque date").notRequired(),

  depositDate: Yup.date().typeError("Invalid deposit date").nullable().notRequired(),

  clearDate: Yup.date().typeError("Invalid clear date").nullable().notRequired(),

  bounceReason: Yup.string().trim().nullable().max(255).notRequired()
}).noUnknown(true);

export { chequeCreateSchema, chequeUpdateSchema };
export default { chequeCreateSchema, chequeUpdateSchema };
