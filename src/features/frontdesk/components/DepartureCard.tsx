import { Link } from "react-router-dom";
import { BedDouble, LogOut, Receipt } from "lucide-react";
import type { DepartureRow } from "../services/frontdesk.api.ts";
import { buttonPrimary, buttonSecondary, link } from "../../../shared/ui/styles.ts";
import { formatPrice } from "../../../shared/ui/format.ts";
import BlockerList from "./BlockerList.tsx";

interface DepartureCardProps {
  row: DepartureRow;
  busy: boolean;
  onCheckOut: (reservationId: string) => void;
}

/**
 * One guest leaving today.
 *
 * There is no override here, and the card does not pretend otherwise: an unpaid
 * balance at the door is a debt rather than a judgement call. What it offers
 * instead is a way to the bill, because settling it is the thing that actually
 * unblocks the departure.
 */
const DepartureCard = ({ row, busy, onCheckOut }: DepartureCardProps) => {
  const { reservation, ready, blockers, balanceDue } = row;

  return (
    <article className="border border-line bg-surface p-5">
      <header className="mb-3 flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <Link to={`/reservations/${reservation.id}`} className={`${link} font-display text-lg`}>
            {reservation.reference}
          </Link>
          <p className="mt-1 text-[0.88rem] text-ink-muted">
            {reservation.customer.name ?? "Guest"}
            {reservation.room.roomNumber && (
              <span className="ml-2 inline-flex items-center gap-1.5 text-ink-dim">
                <BedDouble size={14} aria-hidden="true" /> Room {reservation.room.roomNumber}
              </span>
            )}
          </p>
        </div>

        <p className="text-right text-[0.85rem] text-ink-muted">
          <span
            className={`block font-semibold tabular-nums ${
              balanceDue > 0 ? "text-red-700" : "text-emerald-700"
            }`}
          >
            {formatPrice(balanceDue)}
          </span>
          {balanceDue > 0 ? "to settle" : "settled"}
        </p>
      </header>

      <BlockerList blockers={blockers} readyLabel="Nothing outstanding - ready to leave" />

      <div className="mt-4 flex flex-wrap gap-3">
        {ready ? (
          <button
            type="button"
            className={buttonPrimary}
            disabled={busy}
            onClick={() => onCheckOut(reservation.id)}
          >
            <LogOut size={16} aria-hidden="true" /> {busy ? "Checking out..." : "Check out"}
          </button>
        ) : (
          // The bill is where the balance actually gets settled, so that is what
          // the card offers rather than a disabled button with no way forward.
          <Link to={`/reservations/${reservation.id}`} className={buttonSecondary}>
            <Receipt size={16} aria-hidden="true" /> Settle the bill
          </Link>
        )}
      </div>
    </article>
  );
};

export default DepartureCard;
