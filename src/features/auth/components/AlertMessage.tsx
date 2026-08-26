import { AlertCircle, CheckCircle2 } from "lucide-react";
import type { ApiFieldError } from "../../../shared/api/types.ts";

type AlertVariant = "error" | "success";

const VARIANTS: Record<AlertVariant, string> = {
  error: "border-danger/20 bg-danger/10 text-red-700",
  success: "border-success/20 bg-success/10 text-emerald-700",
};

interface AlertMessageProps {
  variant?: AlertVariant;
  message?: string | null;
  errors?: ApiFieldError[];
}

/**
 * Renders an API error (including its field-level validation messages) or a
 * success notice.
 */
const AlertMessage = ({ variant = "error", message, errors = [] }: AlertMessageProps) => {
  if (!message && errors.length === 0) return null;

  const Icon = variant === "success" ? CheckCircle2 : AlertCircle;

  return (
    <div
      className={`mb-6 flex items-center gap-3 border px-4 py-3.5 text-sm ${VARIANTS[variant]}`}
      role={variant === "error" ? "alert" : "status"}
    >
      <Icon size={20} aria-hidden="true" />
      <div>
        {message && <span>{message}</span>}
        {errors.length > 0 && (
          <ul className="flex flex-col gap-1">
            {errors.map((error) => (
              <li key={`${error.field}-${error.message}`}>{error.message}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AlertMessage;
