import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import { link } from "../../../shared/ui/styles.ts";

const NotFoundPage = () => (
  <main className="flex min-h-screen items-center justify-center p-6">
    <section className="w-full max-w-[480px] border border-line bg-surface p-10 text-center">
      <Compass size={36} aria-hidden="true" className="mx-auto" />
      <h1 className="mt-4 mb-2 font-display text-[2.2rem] font-extrabold text-ink">
        Page not found
      </h1>
      <p className="mb-8 text-[0.95rem] text-ink-muted">
        The page you are looking for does not exist or has moved.
      </p>
      <Link to="/" className={link}>
        Back to dashboard
      </Link>
    </section>
  </main>
);

export default NotFoundPage;
