import { useState } from "react";
import { Link } from "react-router-dom";
import { BedDouble, DoorOpen, ShieldAlert } from "lucide-react";
import type { ArrivalRow } from "../services/frontdesk.api.ts";
import {
  buttonPrimary,
  buttonSecondary,
  fieldHint,
  fieldLabel,
  input,
  link,
} from "../../../shared/ui/styles.ts";
import { formatPrice } from "../../../shared/ui/format.ts";
import { OVERRIDE_REASON_MIN } from "../constants/policy.ts";
import BlockerList from "./BlockerList.tsx";

interface ArrivalCardProps {
  row: ArrivalRow;
  busy: boolean;
  /** False for anyone who cannot wave an unpaid advance through. */
  canOverride: boolean;
  onCheckIn: (reservationId: string, overrideReason?: string) => void;
}

/** True when the only thing in the way is something a manager may allow. */
const onlyOverridable = (row: ArrivalRow) =>
  row.blockers.length > 0 && row.blockers.every((blocker) => blocker.overridable);

/**
 * One guest arriving today.
 *
 * The card leads with what is stopping them rather than with a button, because
 * on a busy morning the useful question is not "can I press this" but "what do
 * I need to sort out first".
 */
const ArrivalCard = ({ row, busy, canOverride, onCheckIn }: ArrivalCardProps) => {
  const [overriding, setOverriding] = useState(false);
  const [reason, setReason] = useState("");

  const { reservation, ready, blockers } = row;
  const canForce = canOverride && onlyOverridable(row);
  const reasonValid = reason.trim().length >= OVERRIDE_REASON_MIN;

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
          <span className="block font-semibold tabular-nums text-ink">
            {formatPrice(reservation.payment.balanceDue)}
          </span>
          outstanding
        </p>
      </header>

      <BlockerList blockers={blockers} readyLabel="Ready to check in" />

      <div className="mt-4 flex flex-wrap gap-3">
        {ready && (
          <button
            type="button"
            className={buttonPrimary}
            disabled={busy}
            onClick={() => onCheckIn(reservation.id)}
          >
            <DoorOpen size={16} aria-hidden="true" /> {busy ? "Checking in..." : "Check in"}
          </button>
        )}

        {!ready && canForce && !overriding && (
          <button type="button" className={buttonSecondary} onClick={() => setOverriding(true)}>
            <ShieldAlert size={16} aria-hidden="true" /> Override and check in
          </button>
        )}
      </div>

      {overriding && (
        <div className="mt-4 border-t border-line pt-4">
          <label className={fieldLabel} htmlFor={`override-${reservation.id}`}>
            Why are you letting this guest in?
          </label>
          <input
            id={`override-${reservation.id}`}
            type="text"
            className={input}
            value={reason}
            placeholder="Regular guest, bank transfer in flight..."
            onChange={(event) => setReason(event.target.value)}
          />
          <p className={fieldHint}>
            This goes into the audit log under your name, so write something the next person will
            understand. At least {OVERRIDE_REASON_MIN} characters.
          </p>

          <div className="mt-3 flex flex-wrap gap-3">
            <button
              type="button"
              className={buttonPrimary}
              disabled={busy || !reasonValid}
              onClick={() => onCheckIn(reservation.id, reason.trim())}
            >
              <ShieldAlert size={16} aria-hidden="true" />{" "}
              {busy ? "Checking in..." : "Confirm override"}
            </button>
            <button
              type="button"
              className={buttonSecondary}
              disabled={busy}
              onClick={() => {
                setOverriding(false);
                setReason("");
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </article>
  );
};

export default ArrivalCard;
