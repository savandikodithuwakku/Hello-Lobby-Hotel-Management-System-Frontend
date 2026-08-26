import { createContext } from "react";
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
 * The context object lives in its own module so that `AuthProvider.tsx` only
 * exports a component (keeping Vite fast refresh working) and the `useAuth`
 * hook can import the context without importing the provider.
 */
export const AuthContext = createContext<AuthContextValue | null>(null);

export default AuthContext;
