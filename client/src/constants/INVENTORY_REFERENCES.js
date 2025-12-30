export const INVENTORY_REFERENCE_TYPES = [
  "PURCHASE",
  "SALE",
  "PURCHASE_RETURN",
  "SALE_RETURN",
  "OPENING_STOCK",
  "ADJUSTMENT",
  "DAMAGE",
  "TRANSFER",
  "OTHER",
];

export const INVENTORY_REFERENCE_TYPE_OPTIONS = INVENTORY_REFERENCE_TYPES.map(v => ({
  value: v,
  label: v.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
}));

export default INVENTORY_REFERENCE_TYPES;