import { useState } from "react";
import { AlertTriangle, CheckCircle2, Wallet } from "lucide-react";
import type { Reservation } from "../../../shared/api/types.ts";
import {
  actionRow,
  buttonPrimary,
  buttonSecondary,
  fieldGroup,
  fieldHint,
  fieldLabel,
  input,
} from "../../../shared/ui/styles.ts";
import { formatDateOnly, formatPrice, pluralize } from "../../../shared/ui/format.ts";
import { daysUntil } from "../constants/reservations.ts";

interface PaymentPanelProps {
  reservation: Reservation;
  /** False for a guest, who sees the amounts but cannot record a payment. */
  canRecord: boolean;
  busy: boolean;
  onRecord: (amount: number, note: string) => void;
}

const Line = ({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) => (
  <div className="flex items-center justify-between gap-4 border-b border-line py-2 last:border-b-0">
    <span className="text-[0.88rem] text-ink-muted">{label}</span>
    <span className={`tabular-nums ${strong ? "font-display text-lg font-bold" : "font-semibold"}`}>
      {value}
    </span>
  </div>
);

/** A deadline reads very differently before and after it passes. */
const Deadline = ({ label, date, settled }: { label: string; date: string; settled: boolean }) => {
  const days = daysUntil(date);
  const overdue = !settled && days < 0;

  return (
    <p
      className={`flex items-center gap-2 text-[0.85rem] ${
        settled ? "text-emerald-400" : overdue ? "text-red-400" : "text-ink-muted"
      }`}
    >
      {settled ? (
        <CheckCircle2 size={15} aria-hidden="true" />
      ) : (
        overdue && <AlertTriangle size={15} aria-hidden="true" />
      )}
      {label}: {formatDateOnly(date)}
      {settled
        ? " — paid"
        : overdue
          ? ` — ${pluralize(Math.abs(days), "day")} overdue`
          : ` — ${pluralize(days, "day")} left`}
    </p>
  );
};

/**
 * The money side of a booking: what it costs, what has been paid, what is left
 * and by when. Recording a payment that settles the advance confirms the
 * reservation server-side, so the panel says so before it is pressed.
 */
const PaymentPanel = ({ reservation, canRecord, busy, onRecord }: PaymentPanelProps) => {
  const { payment, pricing } = reservation;
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const value = Number(amount);
  const valid = Number.isFinite(value) && value > 0 && value <= payment.balanceDue;

  const suggest = (suggested: number) => setAmount(String(suggested));

  return (
    <div>
      <Line label="Room" value={formatPrice(pricing.roomSubtotal)} />
      {pricing.servicesSubtotal > 0 && (
        <Line label="Services" value={formatPrice(pricing.servicesSubtotal)} />
      )}
      <Line label="Total" value={formatPrice(pricing.totalAmount)} strong />
      <Line label="Paid" value={formatPrice(payment.amountPaid)} />
      <Line label="Balance" value={formatPrice(payment.balanceDue)} strong />

      <div className="mt-4 flex flex-col gap-1.5">
        <Deadline
          label="Advance due"
          date={payment.advanceDeadline}
          settled={payment.advanceSettled}
        />
        <Deadline
          label="Balance due"
          date={payment.balanceDeadline}
          settled={payment.fullySettled}
        />
      </div>

      {!payment.advanceSettled && (
        <p className="mt-4 border border-warning/30 bg-warning/10 px-3 py-2 text-[0.85rem] text-amber-400">
          {formatPrice(payment.advanceAmount - payment.amountPaid)} more is needed to confirm this
          reservation and hold the room.
        </p>
      )}

      {canRecord && payment.balanceDue > 0 && (
        <div className="mt-6 border-t border-line pt-5">
          <div className={fieldGroup}>
            <label className={fieldLabel} htmlFor="payment-amount">
              Record a payment
            </label>
            <input
              id="payment-amount"
              type="number"
              min={0}
              max={payment.balanceDue}
              className={input}
              value={amount}
              placeholder="0"
              onChange={(event) => setAmount(event.target.value)}
            />
            <p className={fieldHint}>
              Up to the outstanding {formatPrice(payment.balanceDue)}.
            </p>
          </div>

          <div className={fieldGroup}>
            <label className={fieldLabel} htmlFor="payment-note">
              Reference (optional)
            </label>
            <input
              id="payment-note"
              type="text"
              className={input}
              value={note}
              placeholder="Cash at desk, card ending 4242..."
              onChange={(event) => setNote(event.target.value)}
            />
          </div>

          <div className={actionRow}>
            {!payment.advanceSettled && (
              <button
                type="button"
                className={buttonSecondary}
                onClick={() => suggest(payment.advanceAmount - payment.amountPaid)}
              >
                Advance ({formatPrice(payment.advanceAmount - payment.amountPaid)})
              </button>
            )}
            <button
              type="button"
              className={buttonSecondary}
              onClick={() => suggest(payment.balanceDue)}
            >
              Full balance
            </button>
            <button
              type="button"
              className={buttonPrimary}
              disabled={busy || !valid}
              onClick={() => {
                onRecord(value, note);
                setAmount("");
                setNote("");
              }}
            >
              <Wallet size={16} aria-hidden="true" /> {busy ? "Recording..." : "Record payment"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentPanel;
