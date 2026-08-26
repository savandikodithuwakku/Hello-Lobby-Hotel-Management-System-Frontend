import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { ApiClientError } from "../../../shared/api/httpClient.ts";
import { useAuth } from "../hooks/useAuth.ts";
import AuthCard, { AuthCardLink } from "../components/AuthCard.tsx";
import AlertMessage from "../components/AlertMessage.tsx";
import { Spinner } from "../components/AuthLoadingScreen.tsx";

type Status = "verifying" | "success" | "error";

const VerifyEmailPage = () => {
  const [status, setStatus] = useState<Status>("verifying");
  const [error, setError] = useState<ApiClientError | null>(null);

  const { token = "" } = useParams<{ token: string }>();
  const { verifyEmail } = useAuth();
  // Verification consumes a single-use token; React StrictMode runs effects
  // twice in development, so the call is guarded against a double submit.
  const hasRequested = useRef(false);

  useEffect(() => {
    if (hasRequested.current) return;
    hasRequested.current = true;

    verifyEmail(token)
      .then(() => setStatus("success"))
      .catch((apiError: ApiClientError) => {
        setError(apiError);
        setStatus("error");
      });
  }, [token, verifyEmail]);

  return (
    <AuthCard
      title="Email verification"
      footer={
        status === "error" ? (
          <AuthCardLink to="/resend-verification">Request a new link</AuthCardLink>
        ) : (
          <AuthCardLink to="/login">Continue to sign in</AuthCardLink>
        )
      }
    >
      {status === "verifying" && <Spinner message="Verifying your email address..." />}

      {status === "success" && (
        <AlertMessage
          variant="success"
          message="Your email address is verified. Your account is now active."
        />
      )}

      {status === "error" && <AlertMessage message={error?.message} errors={error?.errors} />}
    </AuthCard>
  );
};

export default VerifyEmailPage;
