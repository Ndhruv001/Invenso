export const PAYMENT_REFERENCE_TYPES = [
  "PURCHASE",
  "SALE",
  "PURCHASE_RETURN",
  "SALE_RETURN",
  "GENERAL",
  "TRANSPORT",
  "OTHER"
];

export const PAYMENT_REFERENCE_TYPE_OPTIONS = PAYMENT_REFERENCE_TYPES.map(v => ({
  value: v,
  label: v.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())
}));

export default PAYMENT_REFERENCE_TYPES;
