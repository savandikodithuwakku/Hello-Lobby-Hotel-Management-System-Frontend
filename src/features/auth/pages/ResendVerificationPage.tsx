import { useState, type FormEvent } from "react";
import { useLocation } from "react-router-dom";
import { Mail, Send } from "lucide-react";
import { ApiClientError } from "../../../shared/api/httpClient.ts";
import { useAuth } from "../hooks/useAuth.ts";
import type { RouteState } from "../types.ts";
import AuthCard, { AuthCardLink } from "../components/AuthCard.tsx";
import AlertMessage from "../components/AlertMessage.tsx";
import FormField from "../components/FormField.tsx";
import SubmitButton from "../components/SubmitButton.tsx";

const ResendVerificationPage = () => {
  const location = useLocation();
  const state = location.state as RouteState | null;

  const [email, setEmail] = useState(state?.email || "");
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<ApiClientError | null>(null);

  const { resendVerification, submitting } = useAuth();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setNotice(null);

    try {
      const response = await resendVerification(email);
      setNotice(response.message);
    } catch (apiError) {
      setError(apiError as ApiClientError);
    }
  };

  return (
    <AuthCard
      title="Resend verification"
      subtitle="We will send a fresh activation link to your inbox"
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

          <SubmitButton loading={submitting} loadingLabel="Sending email..." icon={Send}>
            Send verification email
          </SubmitButton>
        </form>
      )}
    </AuthCard>
  );
};

export default ResendVerificationPage;
