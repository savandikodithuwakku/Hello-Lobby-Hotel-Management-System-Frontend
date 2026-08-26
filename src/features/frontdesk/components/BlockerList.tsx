import { AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";
import type { FrontDeskBlocker } from "../services/frontdesk.api.ts";

interface BlockerListProps {
  blockers: FrontDeskBlocker[];
  /** What to say when there is nothing in the way. */
  readyLabel: string;
}

/**
 * Every reason a guest cannot yet be checked in or out.
 *
 * All of them are shown at once rather than one at a time, which is how the API
 * reports them: somebody whose booking is unconfirmed *and* unpaid should be
 * able to sort both out in one conversation, instead of discovering the next
 * problem each time they try again.
 *
 * The one a manager may wave through is marked, so the desk can see there is a
 * way forward without having to know the rules by heart.
 */
const BlockerList = ({ blockers, readyLabel }: BlockerListProps) => {
  if (blockers.length === 0) {
    return (
      <p className="flex items-center gap-2 text-[0.85rem] text-emerald-700">
        <CheckCircle2 size={15} aria-hidden="true" />
        {readyLabel}
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-1.5">
      {blockers.map((blocker) => (
        <li key={blocker.code} className="flex items-start gap-2 text-[0.85rem] text-ink-muted">
          {blocker.overridable ? (
            <ShieldAlert size={15} aria-hidden="true" className="mt-0.5 shrink-0 text-amber-700" />
          ) : (
            <AlertTriangle size={15} aria-hidden="true" className="mt-0.5 shrink-0 text-red-700" />
          )}
          <span>
            {blocker.message}
            {blocker.overridable && (
              <span className="ml-1.5 text-[0.78rem] text-ink-dim">
                — a manager can override this
              </span>
            )}
          </span>
        </li>
      ))}
    </ul>
  );
};

export default BlockerList;
