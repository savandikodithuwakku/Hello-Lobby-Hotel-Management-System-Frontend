import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { KeyRound, Lock } from "lucide-react";
import { ApiClientError } from "../../../shared/api/httpClient.ts";
import { useAuth } from "../hooks/useAuth.ts";
import type { ChangePasswordPayload } from "../services/auth.api.ts";
import AuthCard, { AuthCardLink } from "../components/AuthCard.tsx";
import AlertMessage from "../components/AlertMessage.tsx";
import FormField from "../components/FormField.tsx";
import SubmitButton from "../components/SubmitButton.tsx";

const INITIAL_FORM: ChangePasswordPayload = {
  currentPassword: "",
  newPassword: "",
  confirmNewPassword: "",
};

const ChangePasswordPage = () => {
  const [form, setForm] = useState<ChangePasswordPayload>(INITIAL_FORM);
  const [error, setError] = useState<ApiClientError | null>(null);

  const { changePassword, submitting } = useAuth();
  const navigate = useNavigate();

  const setField = (field: keyof ChangePasswordPayload) => (value: string) =>
    setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (form.newPassword !== form.confirmNewPassword) {
      setError(new ApiClientError("New passwords do not match"));
      return;
    }

    try {
      await changePassword(form);
      // Changing the password signs out every device, including this one.
      navigate("/login", {
        replace: true,
        state: { message: "Password changed. Please sign in again." },
      });
    } catch (apiError) {
      setError(apiError as ApiClientError);
    }
  };

  return (
    <AuthCard
      title="Change password"
      subtitle="All devices will be signed out after the change"
      footer={<AuthCardLink to="/">Back to dashboard</AuthCardLink>}
    >
      <AlertMessage message={error?.message} errors={error?.errors} />

      <form onSubmit={handleSubmit} noValidate>
        <FormField
          label="Current password"
          type="password"
          icon={Lock}
          autoComplete="current-password"
          value={form.currentPassword}
          onChange={setField("currentPassword")}
          required
        />

        <FormField
          label="New password"
          type="password"
          icon={Lock}
          autoComplete="new-password"
          hint="At least 8 characters with an uppercase letter, a lowercase letter and a number."
          value={form.newPassword}
          onChange={setField("newPassword")}
          required
        />

        <FormField
          label="Confirm new password"
          type="password"
          icon={Lock}
          autoComplete="new-password"
          value={form.confirmNewPassword}
          onChange={setField("confirmNewPassword")}
          required
        />

        <SubmitButton loading={submitting} loadingLabel="Updating password..." icon={KeyRound}>
          Change password
        </SubmitButton>
      </form>
    </AuthCard>
  );
};

export default ChangePasswordPage;
