import * as Yup from "yup";
import { PAYMENT_MODES } from "@/constants/PAYMENT_MODES";

/**
 * -------------------------
 * Purchase Return Item Schema
 * (Used in BOTH create & update)
 * -------------------------
 */
const purchaseReturnItemSchema = Yup.object({
  id: Yup.number().integer().positive().notRequired(), // present only for update

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
    .required("GST rate is required")
});

/**
 * -------------------------
 * Purchase Return CREATE Schema
 * (Strict – everything required)
 * -------------------------
 */
const purchaseReturnCreateSchema = Yup.object({
  date: Yup.date().typeError("Invalid date").required("Date is required"),

  partyId: Yup.number().typeError("Party is required").integer().positive().required(),

  purchaseId: Yup.number()
    .typeError("Purchase reference must be a valid ID")
    .integer()
    .positive()
    .nullable()
    .notRequired(),

  receivedAmount: Yup.number()
    .transform((value, originalValue) =>
      originalValue === "" || originalValue === null ? 0 : value
    )
    .min(0)
    .nullable(),

  paymentMode: Yup.string().oneOf(PAYMENT_MODES).required(),

  reason: Yup.string().trim().nullable().max(300),

  items: Yup.array().of(purchaseReturnItemSchema).min(1).required()
}).noUnknown(true); // 🔥 prevents sneaky fields

/**
 * -------------------------
 * Purchase Return UPDATE Schema
 * (Flexible – partial updates)
 * -------------------------
 */
const purchaseReturnUpdateSchema = Yup.object({
  date: Yup.date().typeError("Invalid date").notRequired(),

  partyId: Yup.number().integer().positive().notRequired(),

  purchaseId: Yup.number().integer().positive().nullable().notRequired(),

  receivedAmount: Yup.number()
    .transform((value, originalValue) =>
      originalValue === "" || originalValue === null ? 0 : value
    )
    .min(0)
    .nullable()
    .notRequired(),

  paymentMode: Yup.string().oneOf(PAYMENT_MODES).notRequired(),

  reason: Yup.string().trim().nullable().max(300).notRequired(),

  items: Yup.array().of(purchaseReturnItemSchema).min(1).required()
}).noUnknown(true);

export { purchaseReturnItemSchema, purchaseReturnCreateSchema, purchaseReturnUpdateSchema };
