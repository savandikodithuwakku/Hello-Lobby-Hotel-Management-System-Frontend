import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { setAccessToken, setSessionExpiredHandler } from "../../../shared/api/httpClient.ts";
import type { Role, SessionPayload, User } from "../../../shared/api/types.ts";
import authApi, {
  type ChangePasswordPayload,
  type LoginPayload,
  type RegisterPayload,
  type ResetPasswordPayload,
} from "../services/auth.api.ts";
import { AuthContext, type AuthContextValue } from "./authContext.ts";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  // `initialising` covers the silent refresh on first paint; `submitting`
  // covers individual form actions, so a login spinner never blanks the app.
  const [initialising, setInitialising] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const applySession = useCallback((payload: SessionPayload): User => {
    setAccessToken(payload.accessToken);
    setUser(payload.user);
    return payload.user;
  }, []);

  const clearSession = useCallback((): void => {
    setAccessToken(null);
    setUser(null);
  }, []);

  // Called by the HTTP client when a token refresh fails for good.
  useEffect(() => {
    setSessionExpiredHandler(clearSession);
    return () => setSessionExpiredHandler(null);
  }, [clearSession]);

  // Silent sign-in: the refresh cookie survives a page reload even though the
  // access token (memory only) does not.
  useEffect(() => {
    let active = true;

    authApi
      .refresh()
      .then((response) => {
        if (active) applySession(response.data);
      })
      .catch(() => {
        if (active) clearSession();
      })
      .finally(() => {
        if (active) setInitialising(false);
      });

    return () => {
      active = false;
    };
  }, [applySession, clearSession]);

  const withSubmitting = useCallback(async <TResult,>(action: () => Promise<TResult>): Promise<TResult> => {
    setSubmitting(true);
    try {
      return await action();
    } finally {
      setSubmitting(false);
    }
  }, []);

  const login = useCallback(
    ({ email, password, rememberMe = false }: LoginPayload) =>
      withSubmitting(async () => {
        try {
          const response = await authApi.login({ email, password, rememberMe });
          return applySession(response.data);
        } catch (error) {
          clearSession();
          throw error;
        }
      }),
    [applySession, clearSession, withSubmitting]
  );

  const register = useCallback(
    (payload: RegisterPayload) =>
      withSubmitting(async () => (await authApi.register(payload)).data),
    [withSubmitting]
  );

  const logout = useCallback(
    () =>
      withSubmitting(async () => {
        try {
          await authApi.logout();
        } finally {
          // The client always ends up signed out, even if the call failed.
          clearSession();
        }
      }),
    [clearSession, withSubmitting]
  );

  const logoutAllDevices = useCallback(
    () =>
      withSubmitting(async () => {
        try {
          await authApi.logoutAllDevices();
        } finally {
          clearSession();
        }
      }),
    [clearSession, withSubmitting]
  );

  const verifyEmail = useCallback((token: string) => authApi.verifyEmail(token), []);

  const resendVerification = useCallback(
    (email: string) => withSubmitting(() => authApi.resendVerification(email)),
    [withSubmitting]
  );

  const forgotPassword = useCallback(
    (email: string) => withSubmitting(() => authApi.forgotPassword(email)),
    [withSubmitting]
  );

  const resetPassword = useCallback(
    (token: string, payload: ResetPasswordPayload) =>
      withSubmitting(async () => {
        const response = await authApi.resetPassword(token, payload);
        clearSession();
        return response.data;
      }),
    [clearSession, withSubmitting]
  );

  const changePassword = useCallback(
    (payload: ChangePasswordPayload) =>
      withSubmitting(async () => {
        const response = await authApi.changePassword(payload);
        // The API revokes every session on a password change, so the client
        // must return to the sign-in screen.
        clearSession();
        return response.data;
      }),
    [clearSession, withSubmitting]
  );

  const refreshProfile = useCallback(async (): Promise<User> => {
    const response = await authApi.getMe();
    setUser(response.data.user);
    return response.data.user;
  }, []);

  const hasRole = useCallback(
    (...roles: Role[]) => Boolean(user) && roles.includes(user!.role),
    [user]
  );

  const hasPermission = useCallback(
    (...permissions: string[]) =>
      Boolean(user) && permissions.some((permission) => user!.permissions?.includes(permission)),
    [user]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      initialising,
      submitting,
      login,
      register,
      logout,
      logoutAllDevices,
      verifyEmail,
      resendVerification,
      forgotPassword,
      resetPassword,
      changePassword,
      refreshProfile,
      hasRole,
      hasPermission,
    }),
    [
      user,
      initialising,
      submitting,
      login,
      register,
      logout,
      logoutAllDevices,
      verifyEmail,
      resendVerification,
      forgotPassword,
      resetPassword,
      changePassword,
      refreshProfile,
      hasRole,
      hasPermission,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
