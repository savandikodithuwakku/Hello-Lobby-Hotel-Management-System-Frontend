import { useId, useState } from "react";
import { AlertTriangle } from "lucide-react";
import {
  actionRow,
  buttonDanger,
  buttonSecondary,
  fieldGroup,
  fieldLabel,
  input,
} from "../ui/styles.ts";

interface ConfirmPanelProps {
  title: string;
  description: string;
  confirmLabel: string;
  /** When set, the operator must type this value back before confirming. */
  confirmValue?: string | null;
  confirmHint?: string | null;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Inline confirmation for a destructive action.
 *
 * When `confirmValue` is given the operator has to type it back before the
 * button enables - the same safeguard the API applies to a permanent delete,
 * repeated here so the mistake is caught before the request is sent.
 */
const ConfirmPanel = ({
  title,
  description,
  confirmLabel,
  confirmValue = null,
  confirmHint = null,
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmPanelProps) => {
  const inputId = useId();
  const [typed, setTyped] = useState("");

  const ready = !confirmValue || typed.trim().toLowerCase() === confirmValue.toLowerCase();

  return (
    <div
      className="border border-danger/30 bg-danger/5 p-5"
      role="alertdialog"
      aria-labelledby={`${inputId}-title`}
    >
      <p className="mb-2 flex items-center gap-2 font-semibold text-ink" id={`${inputId}-title`}>
        <AlertTriangle size={18} aria-hidden="true" /> {title}
      </p>
      <p className="mb-5 text-[0.88rem] text-ink-muted">{description}</p>

      {confirmValue && (
        <div className={fieldGroup}>
          <label className={fieldLabel} htmlFor={inputId}>
            {confirmHint || `Type ${confirmValue} to confirm`}
          </label>
          <input
            id={inputId}
            type="text"
            className={input}
            value={typed}
            onChange={(event) => setTyped(event.target.value)}
            autoComplete="off"
          />
        </div>
      )}

      <div className={actionRow}>
        <button type="button" className={buttonSecondary} onClick={onCancel} disabled={busy}>
          Cancel
        </button>
        <button
          type="button"
          className={buttonDanger}
          onClick={() => onConfirm()}
          disabled={busy || !ready}
        >
          {busy ? "Working..." : confirmLabel}
        </button>
      </div>
    </div>
  );
};

export default ConfirmPanel;
