import type { ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import type { Role } from "../../../shared/api/types.ts";
import { useAuth } from "../hooks/useAuth.ts";
import AuthLoadingScreen from "./AuthLoadingScreen.tsx";

interface ProtectedRouteProps {
  children?: ReactNode;
  roles?: Role[];
  permissions?: string[];
}

/**
 * Route guard for authenticated areas.
 *
 * `roles` and `permissions` are optional additional gates; when both are given
 * the user must satisfy both. This is a UX guard only - the API enforces the
 * same rules again on every request.
 */
const ProtectedRoute = ({ children, roles = [], permissions = [] }: ProtectedRouteProps) => {
  const { isAuthenticated, initialising, hasRole, hasPermission } = useAuth();
  const location = useLocation();

  if (initialising) {
    return <AuthLoadingScreen message="Verifying your session..." />;
  }

  if (!isAuthenticated) {
    // Remember where the user was headed so sign-in can return them there.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles.length > 0 && !hasRole(...roles)) {
    return <Navigate to="/forbidden" replace />;
  }

  if (permissions.length > 0 && !hasPermission(...permissions)) {
    return <Navigate to="/forbidden" replace />;
  }

  return children ?? <Outlet />;
};

export default ProtectedRoute;
