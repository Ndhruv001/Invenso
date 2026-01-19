import * as Yup from "yup";
import { ACP_SHEET_SIZES } from "@/constants/ACP_SHEET_SIZES";
import { PAYMENT_MODES } from "@/constants/PAYMENT_MODES";
// PAYMENT_MODES = ["CASH","UPI","BANK","CHEQUE","NONE"]

/**
 * -------------------------
 * Purchase Item Schema
 * -------------------------
 */
const purchaseItemSchema = Yup.object({
  productId: Yup.number()
    .typeError("Product is required")
    .required("Product is required")
    .integer("Product must be a valid ID")
    .positive("Product must be valid"),

  size: Yup.string()
    .required("Size is required")
    .oneOf(ACP_SHEET_SIZES, "Invalid size option"),

  quantity: Yup.number()
    .typeError("Quantity must be a number")
    .required("Quantity is required")
    .moreThan(0, "Quantity must be greater than 0"),

  pricePerUnit: Yup.number()
    .typeError("Price per unit must be a number")
    .required("Price per unit is required")
    .min(0, "Price per unit cannot be negative"),

  gstRate: Yup.number()
    .typeError("GST rate must be a number")
    .required("GST rate is required")
    .min(0, "GST rate cannot be negative"),

  gstAmount: Yup.number()
    .typeError("GST amount must be a number")
    .required("GST amount is required")
    .min(0, "GST amount cannot be negative"),

  taxableAmount: Yup.number()
    .typeError("Taxable amount must be a number")
    .required("Taxable amount is required")
    .min(0, "Taxable amount cannot be negative"),

  totalAmount: Yup.number()
    .typeError("Total amount must be a number")
    .required("Total amount is required")
    .min(0, "Total amount cannot be negative"),
});

/**
 * -------------------------
 * Purchase Schema
 * -------------------------
 */
const purchaseSchema = Yup.object({
  date: Yup.date()
    .typeError("Invalid date")
    .required("Date is required"),

  partyId: Yup.number()
    .typeError("Party is required")
    .required("Party is required")
    .integer("Party must be a valid ID")
    .positive("Party must be valid"),

  invoiceNumber: Yup.number()
    .typeError("Invoice number is required")
    .required("Invoice number is required")
    .integer("Invoice number must be valid")
    .positive("Invoice number must be valid"),

  totalAmount: Yup.number()
    .typeError("Total amount must be a number")
    .required("Total amount is required")
    .min(0, "Total amount cannot be negative"),

  totalGstAmount: Yup.number()
    .typeError("Total GST must be a number")
    .required("Total GST is required")
    .min(0, "Total GST cannot be negative"),

  totalTaxableAmount: Yup.number()
    .typeError("Total taxable amount must be a number")
    .required("Total taxable amount is required")
    .min(0, "Total taxable amount cannot be negative"),

  paidAmount: Yup.number()
    .transform((value, originalValue) =>
      originalValue === "" || originalValue === null ? 0 : value
    )
    .typeError("Paid amount must be a number")
    .min(0, "Paid amount cannot be negative")
    .nullable(),

  paymentMode: Yup.string()
    .required("Payment mode is required")
    .oneOf(PAYMENT_MODES, "Invalid payment mode"),

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

  items: Yup.array()
    .of(purchaseItemSchema)
    .min(1, "At least one item is required")
    .required("Items are required"),
});

export default purchaseSchema;
export {
  purchaseSchema,
  purchaseItemSchema,
};
