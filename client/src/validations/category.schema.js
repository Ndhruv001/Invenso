import * as yup from "yup";

const categorySchema = yup.object().shape({
  name: yup
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .required("Category name is required"),
  description: yup.string().nullable()
});

export default categorySchema;
export { categorySchema };
