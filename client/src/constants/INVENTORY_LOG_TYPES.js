export const INVENTORY_LOG_TYPES = ["ADD", "SUBTRACT"];

export const INVENTORY_LOG_TYPE_OPTIONS = INVENTORY_LOG_TYPES.map(v => ({
  value: v,
  label: v.charAt(0) + v.slice(1).toLowerCase()
}));

export default INVENTORY_LOG_TYPES;
