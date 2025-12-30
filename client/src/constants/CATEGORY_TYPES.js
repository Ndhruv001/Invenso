export const CATEGORY_TYPES = ["PRODUCT", "EXPENSE"];

export const CATEGORY_TYPE_OPTIONS = CATEGORY_TYPES.map(v => ({
  value: v,
  label: v.charAt(0) + v.slice(1).toLowerCase(),
}));

export default CATEGORY_TYPES;