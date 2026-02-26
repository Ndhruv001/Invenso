import * as Yup from "yup";
import { PARTY_TYPES } from "@/constants/PARTY_TYPES";
// example: ["CUSTOMER", "SUPPLIER", "BOTH"]

/**
 * Create Party Validation
 */
const partyCreateSchema = Yup.object({
  name: Yup.string()
    .trim()
    .required("Party name is required")
    .min(2, "Party name must be at least 2 characters")
    .max(150, "Party name must be less than 150 characters"),

  identifier: Yup.string().trim().nullable().max(50, "Identifier must be less than 50 characters"),

  type: Yup.string().oneOf(PARTY_TYPES, "Invalid party type").required("Party type is required"),

  phone: Yup.string()
    .trim()
    .nullable()
    .matches(/^[0-9+\-\s]{7,15}$/, {
      message: "Invalid phone number",
      excludeEmptyString: true
    }),

  gstNumber: Yup.string()
    .trim()
    .nullable()
    .matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, {
      message: "Invalid GST number",
      excludeEmptyString: true
    }),

  openingBalance: Yup.number()
    .transform((value, originalValue) =>
      originalValue === "" || originalValue === null ? 0 : value
    )
    .typeError("Opening balance must be a number")
    .nullable(),

  remark: Yup.string().trim().nullable().max(300, "Remark must be less than 300 characters"),

  isActive: Yup.boolean().notRequired()
}).noUnknown(true);

/**
 * Update Party Validation
 */
const partyUpdateSchema = Yup.object({
  name: Yup.string()
    .trim()
    .min(2, "Party name must be at least 2 characters")
    .max(150, "Party name must be less than 150 characters")
    .notRequired(),

  identifier: Yup.string()
    .trim()
    .nullable()
    .max(50, "Identifier must be less than 50 characters")
    .notRequired(),

  type: Yup.string().oneOf(PARTY_TYPES, "Invalid party type").notRequired(),

  phone: Yup.string()
    .trim()
    .nullable()
    .matches(/^[0-9+\-\s]{7,15}$/, {
      message: "Invalid phone number",
      excludeEmptyString: true
    })
    .notRequired(),

  gstNumber: Yup.string()
    .trim()
    .nullable()
    .matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, {
      message: "Invalid GST number",
      excludeEmptyString: true
    })
    .notRequired(),

  openingBalance: Yup.number()
    .transform((value, originalValue) =>
      originalValue === "" || originalValue === null ? 0 : value
    )
    .nullable()
    .notRequired(),

  remark: Yup.string()
    .trim()
    .nullable()
    .max(300, "Remark must be less than 300 characters")
    .notRequired(),

  isActive: Yup.boolean().notRequired()
}).noUnknown(true);

export { partyCreateSchema, partyUpdateSchema };
export default { partyCreateSchema, partyUpdateSchema };
