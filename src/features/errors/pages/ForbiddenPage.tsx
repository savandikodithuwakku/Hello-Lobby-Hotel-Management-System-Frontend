import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { link } from "../../../shared/ui/styles.ts";

const ForbiddenPage = () => (
  <main className="flex min-h-screen items-center justify-center p-6">
    <section className="w-full max-w-[480px] border border-line bg-surface p-10 text-center">
      <ShieldAlert size={36} aria-hidden="true" className="mx-auto" />
      <h1 className="mt-4 mb-2 font-display text-[2.2rem] font-extrabold text-ink">
        Access denied
      </h1>
      <p className="mb-8 text-[0.95rem] text-ink-muted">
        Your role does not include permission to open this page. Contact an administrator if you
        believe this is a mistake.
      </p>
      <Link to="/" className={link}>
        Back to dashboard
      </Link>
    </section>
  </main>
);

export default ForbiddenPage;
