// src/validations/paymentValidations.js
import * as Yup from "yup";
import PAYMENT_MODES from "@/constants/PAYMENT_MODES"; // from your enum
import PAYMENT_TYPES from "@/constants/PAYMENT_TYPES";
import PAYMENT_REFERENCE from "@/constants/PAYMENT_REFERENCES";

/**
 * ---------------------------
 * CREATE PAYMENT
 * ---------------------------
 */
const paymentCreateSchema = Yup.object({
  date: Yup.date().typeError("Invalid payment date").required("Payment date is required"),

  partyId: Yup.number()
    .transform((value, originalValue) =>
      originalValue === "" || originalValue === null ? null : value
    )
    .integer("Party must be valid")
    .positive("Party must be valid")
    .nullable(),

  type: Yup.string()
    .oneOf(PAYMENT_TYPES, "Invalid payment type")
    .required("Payment type is required"),

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

  remark: Yup.string().trim().nullable().max(500, "Remark must be less than 500 characters"),

  referenceType: Yup.string()
    .oneOf(PAYMENT_REFERENCE, "Invalid reference type")
    .required("Reference type is required"),

}).noUnknown(true);

/**
 * ---------------------------
 * UPDATE PAYMENT
 * ---------------------------
 */
const paymentUpdateSchema = Yup.object({
  date: Yup.date().typeError("Invalid payment date").notRequired(),

  partyId: Yup.number()
    .integer("Party must be valid")
    .positive("Party must be valid")
    .nullable()
    .notRequired(),

  amount: Yup.number()
    .typeError("Amount must be a number")
    .positive("Amount must be greater than zero")
    .notRequired(),

  paymentMode: Yup.string().oneOf(PAYMENT_MODES, "Invalid payment mode").notRequired(),

  remark: Yup.string()
    .trim()
    .nullable()
    .max(500, "Remark must be less than 500 characters")
    .notRequired()
}).noUnknown(true);

export { paymentCreateSchema, paymentUpdateSchema };
export default { paymentCreateSchema, paymentUpdateSchema };
