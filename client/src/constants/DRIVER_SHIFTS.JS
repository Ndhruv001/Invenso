export const DRIVER_SHIFTS = ["MORNING", "EVENING", "NIGHT", "SUNDAY", "HOLIDAY", "OTHER"];

export const DRIVER_SHIFT_OPTIONS = DRIVER_SHIFTS.map(v => ({
  value: v,
  label: v.charAt(0) + v.slice(1).toLowerCase(),
}));

export default DRIVER_SHIFTS;
