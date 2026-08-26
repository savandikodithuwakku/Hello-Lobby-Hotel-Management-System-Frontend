import { useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Lock, LogIn, Mail } from "lucide-react";
import { ApiClientError } from "../../../shared/api/httpClient.ts";
import { fieldHint } from "../../../shared/ui/styles.ts";
import { useAuth } from "../hooks/useAuth.ts";
import type { RouteState } from "../types.ts";
import AuthCard, { AuthCardLink } from "../components/AuthCard.tsx";
import AlertMessage from "../components/AlertMessage.tsx";
import FormField from "../components/FormField.tsx";
import SubmitButton from "../components/SubmitButton.tsx";

interface LoginForm {
  email: string;
  password: string;
  rememberMe: boolean;
}

const LoginPage = () => {
  const [form, setForm] = useState<LoginForm>({ email: "", password: "", rememberMe: false });
  const [error, setError] = useState<ApiClientError | null>(null);

  const { login, submitting } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as RouteState | null;

  const redirectTo = state?.from?.pathname || "/";

  const setField =
    <TField extends keyof LoginForm>(field: TField) =>
    (value: LoginForm[TField]) =>
      setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    try {
      await login(form);
      navigate(redirectTo, { replace: true });
    } catch (apiError) {
      setError(apiError as ApiClientError);
    }
  };

  return (
    <AuthCard
      title="HelloLobby"
      subtitle="Sign in to your account"
      footer={
        <>
          Don&apos;t have an account? <AuthCardLink to="/register">Create one</AuthCardLink>
        </>
      }
    >
      {state?.message && <AlertMessage variant="success" message={state.message} />}
      <AlertMessage message={error?.message} errors={error?.errors} />

      <form onSubmit={handleSubmit} noValidate>
        <FormField
          label="Email address"
          type="email"
          icon={Mail}
          placeholder="you@example.com"
          autoComplete="email"
          value={form.email}
          onChange={setField("email")}
          required
        />

        <FormField
          label="Password"
          type="password"
          icon={Lock}
          placeholder="Enter your password"
          autoComplete="current-password"
          value={form.password}
          onChange={setField("password")}
          required
        />

        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <label className="inline-flex cursor-pointer items-center gap-2 text-[0.85rem] text-ink-muted">
            <input
              type="checkbox"
              className="size-4 cursor-pointer accent-brand"
              checked={form.rememberMe}
              onChange={(event) => setField("rememberMe")(event.target.checked)}
            />
            Remember me for 30 days
          </label>
          <AuthCardLink to="/forgot-password">Forgot password?</AuthCardLink>
        </div>

        <SubmitButton loading={submitting} loadingLabel="Signing in..." icon={LogIn}>
          Sign in
        </SubmitButton>
      </form>

      {error?.status === 403 && (
        <p className={fieldHint}>
          Need a new verification email?{" "}
          <AuthCardLink to="/resend-verification" state={{ email: form.email }}>
            Resend it
          </AuthCardLink>
        </p>
      )}
    </AuthCard>
  );
};

export default LoginPage;
