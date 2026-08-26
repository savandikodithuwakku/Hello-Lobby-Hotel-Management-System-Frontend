import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, Phone, User, UserPlus } from "lucide-react";
import { ApiClientError } from "../../../shared/api/httpClient.ts";
import { useAuth } from "../hooks/useAuth.ts";
import type { RegisterPayload } from "../services/auth.api.ts";
import AuthCard, { AuthCardLink } from "../components/AuthCard.tsx";
import AlertMessage from "../components/AlertMessage.tsx";
import FormField from "../components/FormField.tsx";
import SubmitButton from "../components/SubmitButton.tsx";

type RegisterForm = Required<RegisterPayload>;

const INITIAL_FORM: RegisterForm = {
  name: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
};

const RegisterPage = () => {
  const [form, setForm] = useState<RegisterForm>(INITIAL_FORM);
  const [error, setError] = useState<ApiClientError | null>(null);

  const { register, submitting } = useAuth();
  const navigate = useNavigate();

  const setField = (field: keyof RegisterForm) => (value: string) =>
    setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    // Checked here too so the user gets instant feedback; the API validates again.
    if (form.password !== form.confirmPassword) {
      setError(new ApiClientError("Passwords do not match"));
      return;
    }

    try {
      await register(form);
      navigate("/login", {
        replace: true,
        state: {
          message: "Account created. Check your inbox to verify your email before signing in.",
        },
      });
    } catch (apiError) {
      setError(apiError as ApiClientError);
    }
  };

  return (
    <AuthCard
      title="HelloLobby"
      subtitle="Create your account"
      footer={
        <>
          Already registered? <AuthCardLink to="/login">Sign in</AuthCardLink>
        </>
      }
    >
      <AlertMessage message={error?.message} errors={error?.errors} />

      <form onSubmit={handleSubmit} noValidate>
        <FormField
          label="Full name"
          icon={User}
          placeholder="Jane Doe"
          autoComplete="name"
          value={form.name}
          onChange={setField("name")}
          required
        />

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
          label="Phone number (optional)"
          type="tel"
          icon={Phone}
          placeholder="+94 71 234 5678"
          autoComplete="tel"
          value={form.phone}
          onChange={setField("phone")}
        />

        <FormField
          label="Password"
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
          label="Confirm password"
          type="password"
          icon={Lock}
          placeholder="Re-enter your password"
          autoComplete="new-password"
          value={form.confirmPassword}
          onChange={setField("confirmPassword")}
          required
        />

        <SubmitButton loading={submitting} loadingLabel="Creating account..." icon={UserPlus}>
          Create account
        </SubmitButton>
      </form>
    </AuthCard>
  );
};

export default RegisterPage;
