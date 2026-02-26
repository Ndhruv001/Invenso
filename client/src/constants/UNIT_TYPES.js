export const UNIT_TYPES = [
  "PCS",
  "METER",
  "KG",
  "LITER",
  "BOX",
  "PACKET",
  "ROLL",
  "SHEET",
  "SQF",
  "SQM",
  "OTHER"
];

// Generate dropdown options based on UNITS
export const UNIT_OPTIONS = UNIT_TYPES.map(unit => ({
  value: unit,
  label: unit.charAt(0) + unit.slice(1).toLowerCase() // e.g., KG → Kg
}));

export default UNIT_TYPES;
