import { useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { KeyRound, Lock } from "lucide-react";
import { ApiClientError } from "../../../shared/api/httpClient.ts";
import { useAuth } from "../hooks/useAuth.ts";
import type { ResetPasswordPayload } from "../services/auth.api.ts";
import AuthCard, { AuthCardLink } from "../components/AuthCard.tsx";
import AlertMessage from "../components/AlertMessage.tsx";
import FormField from "../components/FormField.tsx";
import SubmitButton from "../components/SubmitButton.tsx";

const ResetPasswordPage = () => {
  const [form, setForm] = useState<ResetPasswordPayload>({ password: "", confirmPassword: "" });
  const [error, setError] = useState<ApiClientError | null>(null);

  const { token = "" } = useParams<{ token: string }>();
  const { resetPassword, submitting } = useAuth();
  const navigate = useNavigate();

  const setField = (field: keyof ResetPasswordPayload) => (value: string) =>
    setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (form.password !== form.confirmPassword) {
      setError(new ApiClientError("Passwords do not match"));
      return;
    }

    try {
      await resetPassword(token, form);
      navigate("/login", {
        replace: true,
        state: { message: "Password updated. Sign in with your new password." },
      });
    } catch (apiError) {
      setError(apiError as ApiClientError);
    }
  };

  return (
    <AuthCard
      title="Set a new password"
      subtitle="This link can only be used once"
      footer={<AuthCardLink to="/forgot-password">Request a new link</AuthCardLink>}
    >
      <AlertMessage message={error?.message} errors={error?.errors} />

      <form onSubmit={handleSubmit} noValidate>
        <FormField
          label="New password"
          type="password"
          icon={Lock}
          placeholder="Create a strong password"
          autoComplete="new-password"
          hint="At least 8 characters with an uppercase letter, a lowercase letter and a number."
          value={form.password}
          onChange={setField("password")}
          required
        />

        <FormField
          label="Confirm new password"
          type="password"
          icon={Lock}
          placeholder="Re-enter your new password"
          autoComplete="new-password"
          value={form.confirmPassword}
          onChange={setField("confirmPassword")}
          required
        />

        <SubmitButton loading={submitting} loadingLabel="Updating password..." icon={KeyRound}>
          Update password
        </SubmitButton>
      </form>
    </AuthCard>
  );
};

export default ResetPasswordPage;
