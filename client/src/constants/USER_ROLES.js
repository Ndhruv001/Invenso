export const USER_ROLES = ["ADMIN", "MANAGER", "STAFF", "VIEWER"];

export const USER_ROLE_OPTIONS = USER_ROLES.map(v => ({
  value: v,
  label: v.charAt(0) + v.slice(1).toLowerCase()
}));

export default USER_ROLES;
