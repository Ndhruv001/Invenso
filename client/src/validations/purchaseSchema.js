import * as Yup from "yup";
import { PAYMENT_MODES } from "@/constants/PAYMENT_MODES";

/**
 * -------------------------
 * Purchase Item Schema
 * (Used in BOTH create & update)
 * -------------------------
 */
const purchaseItemSchema = Yup.object({
  productId: Yup.number()
    .typeError("Product is required")
    .integer("Product must be a valid ID")
    .positive("Product must be valid")
    .required("Product is required"),

  quantity: Yup.number()
    .typeError("Quantity must be a number")
    .moreThan(0, "Quantity must be greater than 0")
    .required("Quantity is required"),

  pricePerUnit: Yup.number()
    .typeError("Price per unit must be a number")
    .min(0, "Price per unit cannot be negative")
    .required("Price per unit is required"),

  gstRate: Yup.number()
    .typeError("GST rate must be a number")
    .min(0, "GST rate cannot be negative")
    .required("GST rate is required"),
});

/**
 * -------------------------
 * Purchase CREATE Schema
 * (Strict – everything required)
 * -------------------------
 */
const purchaseCreateSchema = Yup.object({
  date: Yup.date()
    .typeError("Invalid date")
    .required("Date is required"),

  partyId: Yup.number()
    .typeError("Party is required")
    .integer("Party must be a valid ID")
    .positive("Party must be valid")
    .required("Party is required"),

  invoiceNumber: Yup.number()
    .typeError("Invoice number is required")
    .integer("Invoice number must be valid")
    .positive("Invoice number must be valid")
    .required("Invoice number is required"),

  paidAmount: Yup.number()
    .transform((value, originalValue) =>
      originalValue === "" || originalValue === null ? 0 : value
    )
    .typeError("Paid amount must be a number")
    .min(0, "Paid amount cannot be negative")
    .nullable(),

  paymentMode: Yup.string()
    .oneOf(PAYMENT_MODES, "Invalid payment mode")
    .required("Payment mode is required"),

  paymentReference: Yup.string()
    .trim()
    .nullable()
    .max(100, "Payment reference must be less than 100 characters"),

  remarks: Yup.string()
    .trim()
    .nullable()
    .max(300, "Remarks must be less than 300 characters"),

  items: Yup.array()
    .of(purchaseItemSchema)
    .min(1, "At least one item is required")
    .required("Items are required"),
});

/**
 * -------------------------
 * Purchase UPDATE Schema
 * (Flexible – partial updates)
 * -------------------------
 */
const purchaseUpdateSchema = Yup.object({
  date: Yup.date().typeError("Invalid date").notRequired(),

  partyId: Yup.number()
    .typeError("Party must be a number")
    .integer("Party must be a valid ID")
    .positive("Party must be valid")
    .notRequired(),

  invoiceNumber: Yup.number()
    .typeError("Invoice number must be a number")
    .integer("Invoice number must be valid")
    .positive("Invoice number must be valid")
    .notRequired(),

  paidAmount: Yup.number()
    .transform((value, originalValue) =>
      originalValue === "" || originalValue === null ? 0 : value
    )
    .typeError("Paid amount must be a number")
    .min(0, "Paid amount cannot be negative")
    .nullable()
    .notRequired(),

  paymentMode: Yup.string()
    .oneOf(PAYMENT_MODES, "Invalid payment mode")
    .notRequired(),

  paymentReference: Yup.string()
    .trim()
    .nullable()
    .max(100, "Payment reference must be less than 100 characters")
    .notRequired(),

  remarks: Yup.string()
    .trim()
    .nullable()
    .max(300, "Remarks must be less than 300 characters")
    .notRequired(),

  /**
   * You said:
   * "I want to send backend all items list always"
   * So items stays REQUIRED
   */
  items: Yup.array()
    .of(purchaseItemSchema)
    .min(1, "At least one item is required")
    .required("Items are required"),
});

export {
  purchaseItemSchema,
  purchaseCreateSchema,
  purchaseUpdateSchema,
};
