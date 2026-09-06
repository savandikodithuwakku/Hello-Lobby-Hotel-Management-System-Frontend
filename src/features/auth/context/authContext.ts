import { createContext, useContext } from "react";
import type { ApiResponse, Role, User } from "../../../shared/api/types.ts";
import type {
  ChangePasswordPayload,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
} from "../services/auth.api.ts";

export interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  /** True during the silent refresh on first paint. */
  initialising: boolean;
  /** True while an individual form action is in flight. */
  submitting: boolean;

  login: (payload: LoginPayload) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<{ user: User }>;
  logout: () => Promise<void>;
  logoutAllDevices: () => Promise<void>;
  verifyEmail: (token: string) => Promise<ApiResponse<null>>;
  resendVerification: (email: string) => Promise<ApiResponse<null>>;
  forgotPassword: (email: string) => Promise<ApiResponse<null>>;
  resetPassword: (token: string, payload: ResetPasswordPayload) => Promise<null>;
  changePassword: (payload: ChangePasswordPayload) => Promise<null>;
  refreshProfile: () => Promise<User>;

  hasRole: (...roles: Role[]) => boolean;
  hasPermission: (...permissions: string[]) => boolean;
}

/**
 * The context and its hooks live apart from `AuthProvider.tsx` so that the
 * provider module only exports a component, which is what keeps Vite fast
 * refresh working. Screens import `useAuth` from here and never touch the
 * context object directly.
 */
export const AuthContext = createContext<AuthContextValue | null>(null);

/** Access the authenticated user, auth actions and permission helpers. */
export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};


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
