export const ACP_SHEET_SIZES = ["NONE", "S4x4", "S6x4", "S8x4", "S10x4", "S12x4", "OTHER"];

export const ACP_SHEET_SIZE_OPTIONS = ACP_SHEET_SIZES.map(size => ({
  value: size,
  label: size.replace(/^S/, "").replace("x", "x "),
}));

export default ACP_SHEET_SIZES;