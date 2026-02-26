export const PAYMENT_MODES = [
  "NONE",
  "CASH",
  "BANK_TRANSFER",
  "CHEQUE",
  "UPI",
  "CARD",
  "CREDIT",
  "ONLINE"
];

export const PAYMENT_MODE_OPTIONS = PAYMENT_MODES.map(v => ({
  value: v,
  label: v.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())
}));

export default PAYMENT_MODES;
