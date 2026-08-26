import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { buttonSubmit } from "../../../shared/ui/styles.ts";

interface SubmitButtonProps {
  loading: boolean;
  loadingLabel?: string;
  icon?: LucideIcon;
  children: ReactNode;
}

const SubmitButton = ({
  loading,
  loadingLabel = "Please wait...",
  icon: Icon,
  children,
}: SubmitButtonProps) => (
  <button type="submit" className={buttonSubmit} disabled={loading}>
    {loading ? (
      <>
        <span className="size-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
        {loadingLabel}
      </>
    ) : (
      <>
        {Icon && <Icon size={20} aria-hidden="true" />}
        {children}
      </>
    )}
  </button>
);

export default SubmitButton;
