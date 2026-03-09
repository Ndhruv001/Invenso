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
 */
const ProtectedRoute = ({
  children,
  requiredRoles = [],
  fallbackPath = "/login"
}) => {
  const location = useLocation();

  const { data: user, isLoading, error } = useMe();

  // 🔹 Still checking authentication
  if (isLoading) {
    return <div>Checking authentication...</div>;
  }

  // 🔹 Only redirect if backend CONFIRMED 401
  if (error?.response?.status === 401) {
    return (
      <Navigate
        to={fallbackPath}
        state={{ from: location }}
        replace
      />
    );
  }

  // 🔹 If temporary network issue → don't force logout
  if (error && !error.response) {
    return <div>Network issue. Please refresh.</div>;
  }

  // 🔹 If somehow user is null (extra safety)
  if (!user) {
    return (
      <Navigate
        to={fallbackPath}
        state={{ from: location }}
        replace
      />
    );
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