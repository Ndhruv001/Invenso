export const CHEQUE_STATUSES = [
  "RECEIVED",
  "DEPOSITED",
  "CLEARED",
  "BOUNCED",
  "ISSUED",
  "ENCASHED",
];

export const CHEQUE_STATUS_OPTIONS = CHEQUE_STATUSES.map(v => ({
  value: v,
  label: v.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
}));

export default CHEQUE_STATUSES;