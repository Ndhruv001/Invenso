import * as yup from "yup";
import { PAYMENT_MODES } from "@/constants/PAYMENT_MODES";

/**
 * Expense validation schema derived from the Expense Prisma model.
 */
const expenseValidations = yup.object().shape({
  categoryId: yup
    .number()
    .typeError("Category is required")
    .required("Category is required"),

  date: yup
    .date()
    .typeError("Please select a valid date")
    .required("Date is required")
    .max(new Date(), "Date cannot be in the future"),

  amount: yup
    .number()
    .typeError("Amount must be a number")
    .positive("Amount must be greater than 0")
    .max(999999999.99, "Amount is too large")
    .required("Amount is required"),

  paymentMode: yup
    .string()
    .required("Payment mode is required")
    .oneOf(Object.values(PAYMENT_MODES), "Invalid payment mode"),

  paymentReference: yup
    .string()
    .nullable()
    .transform(val => (val === "" ? null : val))
    .max(50, "Payment reference must not exceed 50 characters"),

  remark: yup
    .string()
    .nullable()
    .transform(val => (val === "" ? null : val))
    .max(300, "Remark must not exceed 300 characters"),
});

export default expenseValidations;
export { expenseValidations };
