export const BALANCE_TYPES = ["RECEIVABLE", "PAYABLE", "SETTLED"];

export const BALANCE_TYPE_OPTIONS = BALANCE_TYPES.map(v => ({
  value: v,
  label: v.charAt(0) + v.slice(1).toLowerCase(),
}));

export default BALANCE_TYPES;