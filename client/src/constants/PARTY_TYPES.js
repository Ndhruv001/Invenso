export const PARTY_TYPES = ["CUSTOMER", "SUPPLIER", "BOTH", "EMPLOYEE", "DRIVER", "OTHER"];

export const PARTY_TYPE_OPTIONS = PARTY_TYPES.map(v => ({
  value: v,
  label: v.charAt(0) + v.slice(1).toLowerCase()
}));

export default PARTY_TYPES;
