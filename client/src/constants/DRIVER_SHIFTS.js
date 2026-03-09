export const DRIVER_SHIFTS = ["MORNING", "EVENING", "NIGHT", "SUNDAY", "HOLIDAY", "OTHER"];

export const DRIVER_SHIFT_OPTIONS = DRIVER_SHIFTS.map(d => ({
  value: d,
  label: d.charAt(0) + d.slice(1).toLowerCase()
}));

export default DRIVER_SHIFTS;
