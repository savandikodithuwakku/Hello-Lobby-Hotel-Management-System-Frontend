import { useState, type FormEvent } from "react";
import { Mail, Send } from "lucide-react";
import { ApiClientError } from "../../../shared/api/httpClient.ts";
import { useAuth } from "../hooks/useAuth.ts";
import AuthCard, { AuthCardLink } from "../components/AuthCard.tsx";
import AlertMessage from "../components/AlertMessage.tsx";
import FormField from "../components/FormField.tsx";
import SubmitButton from "../components/SubmitButton.tsx";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<ApiClientError | null>(null);

  const { forgotPassword, submitting } = useAuth();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setNotice(null);

    try {
      // The API answers identically whether or not the address exists, so the
      // page must not imply that an account was found.
      const response = await forgotPassword(email);
      setNotice(response.message);
    } catch (apiError) {
      setError(apiError as ApiClientError);
    }
  };

  return (
    <AuthCard
      title="Forgot password"
      subtitle="We will email you a link to set a new password"
      footer={<AuthCardLink to="/login">Back to sign in</AuthCardLink>}
    >
      <AlertMessage variant="success" message={notice} />
      <AlertMessage message={error?.message} errors={error?.errors} />

      {!notice && (
        <form onSubmit={handleSubmit} noValidate>
          <FormField
            label="Email address"
            type="email"
            icon={Mail}
            placeholder="you@example.com"
            autoComplete="email"
            value={email}
            onChange={setEmail}
            required
          />

          <SubmitButton loading={submitting} loadingLabel="Sending link..." icon={Send}>
            Send reset link
          </SubmitButton>
        </form>
      )}
    </AuthCard>
  );
};

export default ForgotPasswordPage;
