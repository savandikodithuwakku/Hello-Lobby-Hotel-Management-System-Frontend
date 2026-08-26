import type { ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.ts";
import AuthLoadingScreen from "./AuthLoadingScreen.tsx";
import type { RouteState } from "../types.ts";

/**
 * Keeps already-signed-in users away from sign-in / registration screens and
 * sends them back where they came from instead.
 */
const PublicOnlyRoute = ({ children }: { children?: ReactNode }) => {
  const { isAuthenticated, initialising } = useAuth();
  const location = useLocation();
  const state = location.state as RouteState | null;

  if (initialising) {
    return <AuthLoadingScreen message="Checking your session..." />;
  }

  if (isAuthenticated) {
    return <Navigate to={state?.from?.pathname || "/"} replace />;
  }

  return children ?? <Outlet />;
};

export default PublicOnlyRoute;
