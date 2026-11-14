// Single source of truth for role values on the client.
// These strings must match backend/constants/roles.js exactly.
export const ROLES = Object.freeze({
  ADMIN: 'admin',
  MANAGER: 'manager',
  DRIVER: 'driver',
  CUSTOMER: 'customer',
});

export const ROLE_LIST = Object.values(ROLES);

// Human labels for menus and headings.
export const ROLE_LABELS = Object.freeze({
  [ROLES.ADMIN]: 'Admin',
  [ROLES.MANAGER]: 'Manager',
  [ROLES.DRIVER]: 'Driver',
  [ROLES.CUSTOMER]: 'Customer',
});

export const roleLabel = (role) => ROLE_LABELS[role] || role || 'Unknown';

// Default export so it can be imported as `import Roles from '../constants/roles'`.
export default ROLES;
