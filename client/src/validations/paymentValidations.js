import * as yup from "yup";

/**
 * Payment Validation Schema
 * -------------------------
 * Derived from Prisma model `Payment` and backend logic in listPayments service.
 * Fields: partyId, type, amount, paymentReference, remark, referenceType, referenceId, paymentMode, date
 */

const paymentValidations = yup.object().shape({
  partyId: yup
    .number()
    .typeError("Party is required")
    .required("Party is required"),

  type: yup
    .string()
    .required("Payment type is required")
    .oneOf(["RECEIVED", "PAID"], "Invalid payment type"),

  amount: yup
    .number()
    .typeError("Amount must be a number")
    .positive("Amount must be greater than 0")
    .max(999999999.99, "Amount is too large")
    .required("Amount is required"),

  paymentReference: yup
    .string()
    .nullable()
    .transform(value => (value === "" ? null : value))
    .max(50, "Payment reference must not exceed 50 characters"),

  remark: yup
    .string()
    .nullable()
    .transform(value => (value === "" ? null : value))
    .max(300, "Remark must not exceed 300 characters"),

  referenceType: yup
    .string()
    .required("Reference type is required")
    .oneOf(
      ["PURCHASE", "SALE", "PURCHASE_RETURN", "SALE_RETURN", "GENERAL", "TRANSPORT", "OTHER"],
      "Invalid reference type"
    ),

  referenceId: yup
    .number()
    .nullable()
    .transform(val => (val === "" ? null : val))
    .typeError("Reference ID should be a number"),

  paymentMode: yup
    .string()
    .required("Payment mode is required")
    .oneOf(["NONE", "CASH", "BANK_TRANSFER", "CHEQUE", "UPI", "CARD", "CREDIT", "ONLINE"], "Invalid payment mode"),

  date: yup
    .date()
    .typeError("Please select a valid date")
    .required("Date is required")
    .max(new Date(), "Date cannot be in the future"),
});

export default paymentValidations;
export { paymentValidations };
