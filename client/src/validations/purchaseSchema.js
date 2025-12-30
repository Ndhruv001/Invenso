import * as yup from "yup";

const purchaseSchema = yup.object().shape({
  partyName: yup.string().required("Party name is required"),
  billingAddress: yup.string().required("Billing address is required"),
  invoiceNumber: yup.string().required("Invoice number is required"),
  invoiceDate: yup.date().required("Invoice date is required"),
  items: yup.array().of(
    yup.object().shape({
      item: yup.string().required("Item name is required")
    })
  )
});

export default purchaseSchema;