import * as yup from "yup";

export const partySchema = yup.object().shape({
  name: yup
    .string()
    .trim()
    .required("Party name is required")
    .max(255, "Party name must be at most 255 characters"),

  identifier: yup
    .string()
    .trim()
    .nullable()
    .max(50, "Identifier must be at most 50 characters"),

  type: yup
    .string()
    .oneOf(
      ["CUSTOMER", "SUPPLIER", "BOTH", "EMPLOYEE", "DRIVER", "OTHER"],
      "Invalid party type"
    )
    .required("Party type is required"),

  phone: yup
    .string()
    .trim()
    .nullable()
    .matches(/^[0-9]{10}$/, "Phone number must be 10 digits")
    .optional(),

  gstNumber: yup
    .string()
    .trim()
    .nullable()
    .matches(/^[0-9A-Z]{15}$/, "Invalid GST number format")
    .optional(),

  openingBalance: yup
    .number()
    .typeError("Opening balance must be a number")
    .min(0, "Opening balance cannot be negative")
    .required("Opening balance is required"),

  currentBalance: yup
    .number()
    .typeError("Current balance must be a number")
    .min(0, "Current balance cannot be negative")
    .required("Current balance is required"),

  balanceType: yup
    .string()
    .oneOf(["RECEIVABLE", "PAYABLE"], "Invalid balance type")
    .required("Balance type is required"),

  address: yup.string().trim().nullable().max(500, "Address too long").optional(),

  remark: yup.string().trim().nullable().max(500, "Remark too long").optional(),

  isActive: yup.boolean().default(true),
});
export default partySchema;