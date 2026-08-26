import { useContext } from "react";
import { AuthContext, type AuthContextValue } from "../context/authContext.ts";
import type { User } from "../../../shared/api/types.ts";

/** Access the authenticated user, auth actions and permission helpers. */
export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

export default useAuth;

/**
 * Same as `useAuth`, but narrows `user` to a signed-in one.
 *
 * Screens that only ever render inside `ProtectedRoute` always have a user;
 * this saves them from null-checking a value the route guard has already
 * guaranteed, and throws loudly if that assumption is ever broken.
 */
export const useAuthUser = (): AuthContextValue & { user: User } => {
  const context = useAuth();

  if (!context.user) {
    throw new Error("useAuthUser must be used inside an authenticated route");
  }

  return context as AuthContextValue & { user: User };
};
