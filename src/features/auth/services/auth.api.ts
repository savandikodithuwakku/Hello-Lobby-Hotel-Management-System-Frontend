import httpClient from "../../../shared/api/httpClient.ts";
import type { Session, SessionPayload, User } from "../../../shared/api/types.ts";

export interface RegisterPayload {
  name: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
}

export interface LoginPayload {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface ResetPasswordPayload {
  password: string;
  confirmPassword: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

/**
 * Typed wrapper around the auth endpoints. Components and the auth context
 * talk to this file instead of building URLs themselves.
 */
const authApi = {
  register: (payload: RegisterPayload) => httpClient.post<{ user: User }>("/auth/register", payload),
  login: (payload: LoginPayload) => httpClient.post<SessionPayload>("/auth/login", payload),
  logout: () => httpClient.post<null>("/auth/logout"),
  logoutAllDevices: () => httpClient.post<null>("/auth/logout-all"),

  // No `refresh` here on purpose: refreshing lives in the HTTP client, as
  // `refreshSession`, because that is the only place that can guarantee a
  // single refresh is in flight at a time.

  verifyEmail: (token: string) => httpClient.post<null>(`/auth/verify-email/${token}`),
  resendVerification: (email: string) =>
    httpClient.post<null>("/auth/resend-verification", { email }),

  forgotPassword: (email: string) => httpClient.post<null>("/auth/forgot-password", { email }),
  resetPassword: (token: string, payload: ResetPasswordPayload) =>
    httpClient.post<null>(`/auth/reset-password/${token}`, payload),
  changePassword: (payload: ChangePasswordPayload) =>
    httpClient.patch<null>("/auth/change-password", payload),

  getMe: () => httpClient.get<{ user: User }>("/auth/me"),
  updateMe: (payload: Partial<User>) => httpClient.patch<{ user: User }>("/auth/me", payload),

  getSessions: () => httpClient.get<{ sessions: Session[] }>("/auth/sessions"),
  revokeSession: (sessionId: string) => httpClient.delete<null>(`/auth/sessions/${sessionId}`),
  getPermissionMatrix: () => httpClient.get<Record<string, string[]>>("/auth/permissions"),
};

export default authApi;
