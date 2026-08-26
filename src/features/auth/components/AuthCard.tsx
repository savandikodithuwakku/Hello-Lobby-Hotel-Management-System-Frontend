import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { link } from "../../../shared/ui/styles.ts";

interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

/** Shared shell for every auth screen so pages stay focused on behaviour. */
const AuthCard = ({ title, subtitle, children, footer }: AuthCardProps) => (
  <div className="flex min-h-screen items-center justify-center p-6">
    <div className="w-full max-w-[480px] border border-line bg-surface p-10">
      <h1 className="mb-2 text-center font-display text-[2.2rem] font-extrabold text-ink">
        {title}
      </h1>
      {subtitle && <p className="mb-8 text-center text-[0.95rem] text-ink-muted">{subtitle}</p>}
      {children}
      {footer && <div className="mt-6 text-center text-sm text-ink-muted">{footer}</div>}
    </div>
  </div>
);

interface AuthCardLinkProps {
  to: string;
  state?: unknown;
  children: ReactNode;
}

export const AuthCardLink = ({ to, state, children }: AuthCardLinkProps) => (
  <Link to={to} state={state} className={link}>
    {children}
  </Link>
);

export default AuthCard;
