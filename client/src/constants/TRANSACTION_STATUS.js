export const TRANSACTION_STATUSES = ["PAID", "PARTIAL", "UNPAID", "CANCELLED", "DRAFT"];

export const TRANSACTION_STATUS_OPTIONS = TRANSACTION_STATUSES.map(v => ({
  value: v,
  label: v.charAt(0) + v.slice(1).toLowerCase()
}));

export default TRANSACTION_STATUSES;
