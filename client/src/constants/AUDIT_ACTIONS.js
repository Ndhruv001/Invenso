export const AUDIT_ACTIONS = ["CREATE", "UPDATE", "DELETE"];

export const AUDIT_ACTION_OPTIONS = AUDIT_ACTIONS.map(v => ({
  value: v,
  label: v.charAt(0) + v.slice(1).toLowerCase()
}));

export default AUDIT_ACTIONS;
