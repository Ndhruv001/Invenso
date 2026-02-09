// src/validations/transportValidations.js
import * as Yup from "yup";
import PAYMENT_MODES from "@/constants/PAYMENT_MODES";
import DRIVER_SHIFTS from "@/constants/DRIVER_SHIFTS";



/**
 * ---------------------------
 * CREATE TRANSPORT
 * ---------------------------
 */
const transportCreateSchema = Yup.object({
  date: Yup.date().typeError("Invalid transport date").required("Transport date is required"),

  partyId: Yup.number()
    .transform((value, originalValue) =>
      originalValue === "" || originalValue === null ? null : value
    )
    .integer("Party must be valid")
    .positive("Party must be valid")
    .required("Party is required"),

  driverId: Yup.number()
    .transform((value, originalValue) =>
      originalValue === "" || originalValue === null ? null : value
    )
    .integer("Driver must be valid")
    .positive("Driver must be valid")
    .required("Driver is required"),

  shift: Yup.string().oneOf(DRIVER_SHIFTS, "Invalid shift").nullable().notRequired(),

  fromLocation: Yup.string()
    .trim()
    .required("From location is required")
    .max(200, "From location must be less than 200 characters"),

  toLocation: Yup.string()
    .trim()
    .required("To location is required")
    .max(200, "To location must be less than 200 characters"),

  amount: Yup.number()
    .transform((value, originalValue) =>
      originalValue === "" || originalValue === null ? 0 : value
    )
    .typeError("Amount must be a number")
    .positive("Amount must be greater than zero")
    .required("Amount is required"),

  receivedAmount: Yup.number()
    .transform((value, originalValue) =>
      originalValue === "" || originalValue === null ? 0 : value
    )
    .typeError("Received amount must be a number")
    .min(0, "Received amount cannot be negative")
    .test(
      "not-greater-than-amount",
      "Received amount cannot be greater than total amount",
      function (value) {
        const { amount } = this.parent;
        return value == null || amount == null || value <= amount;
      }
    )
    .nullable()
    .notRequired(),

  paymentMode: Yup.string().oneOf(PAYMENT_MODES, "Invalid payment mode").nullable().notRequired(),

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

/**
 * ---------------------------
 * UPDATE TRANSPORT
 * ---------------------------
 */
const transportUpdateSchema = Yup.object({
  date: Yup.date().typeError("Invalid transport date").notRequired(),

  partyId: Yup.number()
    .integer("Party must be valid")
    .positive("Party must be valid")
    .nullable()
    .notRequired(),

  driverId: Yup.number()
    .integer("Driver must be valid")
    .positive("Driver must be valid")
    .nullable()
    .notRequired(),

  shift: Yup.string().oneOf(DRIVER_SHIFTS, "Invalid shift").nullable().notRequired(),

  fromLocation: Yup.string()
    .trim()
    .max(200, "From location must be less than 200 characters")
    .notRequired(),

  toLocation: Yup.string()
    .trim()
    .max(200, "To location must be less than 200 characters")
    .notRequired(),

  amount: Yup.number()
    .typeError("Amount must be a number")
    .positive("Amount must be greater than zero")
    .notRequired(),

  receivedAmount: Yup.number()
    .typeError("Received amount must be a number")
    .min(0, "Received amount cannot be negative")
    .test(
      "not-greater-than-amount",
      "Received amount cannot be greater than total amount",
      function (value) {
        const { amount } = this.parent;
        return value == null || amount == null || value <= amount;
      }
    )
    .nullable()
    .notRequired(),

  paymentMode: Yup.string().oneOf(PAYMENT_MODES, "Invalid payment mode").nullable().notRequired(),

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

export { transportCreateSchema, transportUpdateSchema };
export default { transportCreateSchema, transportUpdateSchema };
