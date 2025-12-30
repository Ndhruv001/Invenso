export const PAYMENT_TYPES = ["RECEIVED", "PAID"];

export const PAYMENT_TYPE_OPTIONS = PAYMENT_TYPES.map(v => ({
  value: v,
  label: v.charAt(0) + v.slice(1).toLowerCase(),
}));

export default PAYMENT_TYPES;