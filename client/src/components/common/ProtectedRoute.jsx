/**
 * @file ProtectedRoute.jsx
 * @description Provides components and hooks for implementing route protection and role-based access control in React applications.
 */

import React from "react";
import { Navigate, useLocation } from "react-router-dom";

/**
 * useAuth - A placeholder hook for authentication logic.
 * Replace this with your actual authentication system (e.g., Context API, Redux, API calls).
 * @returns {{isAuthenticated: boolean, user: {role: string}|null, token: string|null}} Authentication status and user data.
 */
const useAuth = () => {
  // TODO: Implement actual authentication logic here.
  // Example: Check localStorage, context, or make an API call to validate session.
  return {
    isAuthenticated: true, // Placeholder: Set to true if user is logged in
    user: { role: "admin" }, // Placeholder: User object with role information
    token: "exampleToken" // Placeholder: User's authentication token
  };
};

/**
 * hasPermission - Checks if a user's role has the required permissions.
 * @param {string|null} userRole - The role of the current user.
 * @param {string[]} [requiredRoles=[]] - An array of roles that are allowed to access.
 * @returns {boolean} True if the user has permission, false otherwise.
 */
const hasPermission = (userRole, requiredRoles = []) => {
  if (!requiredRoles.length) {
    return true; // No specific roles required, so access is granted.
  }
  return requiredRoles.includes(userRole);
};

/**
 * ProtectedRoute - A component that guards routes based on authentication and role-based access.
 * If the user is not authenticated, they are redirected to `fallbackPath`.
 * If authenticated but lacks required roles, they are redirected to `/unauthorized`.
 *
 * @param {Object} props - The component props.
 * @param {React.ReactNode} props.children - The child components to render if access is granted.
 * @param {string[]} [props.requiredRoles=[]] - An array of roles required to access this route.
 * @param {string} [props.fallbackPath='/login'] - The path to redirect to if the user is not authenticated.
 * @returns {JSX.Element} The children if authorized, or a `Navigate` component for redirection.
 */
const ProtectedRoute = ({ children, requiredRoles = [], fallbackPath = "/login" }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login, preserving the current path for redirection after login.
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  if (requiredRoles.length > 0 && !hasPermission(user?.role, requiredRoles)) {
    // Redirect to an unauthorized page if the user doesn't have the required role.
    return <Navigate to="/unauthorized" replace />;
  }

  return children; // Render the protected content.
};

/**
 * withRoleProtection - A Higher-Order Component (HOC) to easily apply role-based protection to components.
 *
 * @param {React.ComponentType<any>} Component - The React component to wrap and protect.
 * @param {string[]} [requiredRoles=[]] - An array of roles required to render the wrapped component.
 * @returns {React.ComponentType<any>} A new component wrapped with `ProtectedRoute` logic.
 */
const withRoleProtection = (Component, requiredRoles = []) => {
  return props => (
    <ProtectedRoute requiredRoles={requiredRoles}>
      <Component {...props} />
    </ProtectedRoute>
  );
};

/**
 * usePermissions - A hook to check user permissions within any component.
 * Provides utility functions to check roles and access rights.
 *
 * @returns {{hasRole: (role: string) => boolean, hasAnyRole: (roles: string[]) => boolean, canAccess: (requiredRoles: string[]) => boolean, userRole: string|null}} Permission checking utilities.
 */
const usePermissions = () => {
  const { user } = useAuth();

  return {
    /**
     * Checks if the current user has a specific role.
     * @param {string} role - The role to check against.
     * @returns {boolean} True if the user has the role, false otherwise.
     */
    hasRole: role => user?.role === role,
    /**
     * Checks if the current user has any of the specified roles.
     * @param {string[]} roles - An array of roles to check against.
     * @returns {boolean} True if the user has at least one of the roles, false otherwise.
     */
    hasAnyRole: roles => roles.includes(user?.role),
    /**
     * Checks if the current user can access something based on required roles.
     * @param {string[]} requiredRoles - An array of roles required for access.
     * @returns {boolean} True if the user has access, false otherwise.
     */
    canAccess: requiredRoles => hasPermission(user?.role, requiredRoles),
    /**
     * The role of the current authenticated user.
     * @type {string|null}
     */
    userRole: user?.role
  };
};

export { useAuth, hasPermission, withRoleProtection, usePermissions };
export default ProtectedRoute;
