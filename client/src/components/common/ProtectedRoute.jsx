/**
 * @file ProtectedRoute.jsx
 * @description Route protection with cookie-based authentication + role-based access control.
 */

import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useMe } from "@/hooks/useAuth";

/**
 * hasPermission
 * Checks if user's role is allowed.
 */
const hasPermission = (userRole, requiredRoles = []) => {
  if (!requiredRoles.length) return true;
  return requiredRoles.includes(userRole);
};

/**
 * ProtectedRoute
 *
 * - Calls useMe() → verifies cookie via backend
 * - If loading → show loader
 * - If not authenticated → redirect to login
 * - If role not allowed → redirect to unauthorized
 * - Otherwise → render children
 */
const ProtectedRoute = ({ children, requiredRoles = [], fallbackPath = "/login" }) => {
  const location = useLocation();

  const { data: user, isLoading, isError } = useMe();

  // 🔹 While checking authentication
  if (isLoading) {
    return <div>Checking authentication...</div>;
  }

  // 🔹 If cookie invalid / not logged in
  if (isError || !user) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // 🔹 Role-based protection
  if (!hasPermission(user?.role, requiredRoles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // 🔹 Allow access
  return children;
};

export default ProtectedRoute;

/**
 * withRoleProtection (HOC)
 */
export const withRoleProtection = (Component, requiredRoles = []) => {
  return function RoleProtectedComponent(props) {
    return (
      <ProtectedRoute requiredRoles={requiredRoles}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
};

/**
 * usePermissions
 * Allows checking roles inside components (UI level control)
 */
export const usePermissions = () => {
  const { data: user } = useMe();

  return {
    hasRole: role => user?.role === role,
    hasAnyRole: roles => roles.includes(user?.role),
    canAccess: roles => hasPermission(user?.role, roles),
    userRole: user?.role || null
  };
};
