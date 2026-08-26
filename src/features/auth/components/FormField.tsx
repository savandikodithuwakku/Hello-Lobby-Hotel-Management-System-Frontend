import { useId, useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff, type LucideIcon } from "lucide-react";
import { fieldGroup, fieldHint, fieldLabel, input, inputWithIcon } from "../../../shared/ui/styles.ts";

interface FormFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "id" | "className"> {
  label: string;
  icon?: LucideIcon;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
}

/**
 * Labelled input with an optional leading icon and a password visibility
 * toggle, so every auth form stays consistent and accessible.
 */
const FormField = ({
  label,
  type = "text",
  icon: Icon,
  hint,
  value,
  onChange,
  ...inputProps
}: FormFieldProps) => {
  const id = useId();
  const [revealed, setRevealed] = useState(false);
  const isPassword = type === "password";

  return (
    <div className={fieldGroup}>
      <label className={fieldLabel} htmlFor={id}>
        {label}
      </label>
      <div className="relative flex items-center">
        {Icon && (
          <Icon
            className="pointer-events-none absolute left-4 text-ink-dim"
            size={20}
            aria-hidden="true"
          />
        )}
        <input
          id={id}
          type={isPassword && revealed ? "text" : type}
          className={Icon ? inputWithIcon : input}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          {...inputProps}
        />
        {isPassword && (
          <button
            type="button"
            className="absolute right-4 flex cursor-pointer items-center text-ink-dim transition-colors duration-300 hover:text-ink"
            onClick={() => setRevealed((current) => !current)}
            aria-label={revealed ? "Hide password" : "Show password"}
          >
            {revealed ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
      {hint && <p className={fieldHint}>{hint}</p>}
    </div>
  );
};

export default FormField;
