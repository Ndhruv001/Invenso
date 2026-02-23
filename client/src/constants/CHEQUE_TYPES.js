export const CHEQUE_TYPES = [
  "INWARD",
  "OUTWARD",
];

export const CHEQUE_TYPE_OPTIONS = CHEQUE_TYPES.map(v => ({
  value: v,
  label: v.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
}));

export default CHEQUE_TYPES;