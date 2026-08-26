import { useState } from "react";
import { AlertTriangle, CheckCircle2, Wallet } from "lucide-react";
import type { PaymentMethod, PaymentMethodOption, Reservation } from "../../../shared/api/types.ts";
import type { RecordPaymentInput } from "../../payments/services/payments.api.ts";
import {
  actionRow,
  buttonPrimary,
  buttonSecondary,
  fieldGroup,
  fieldHint,
  fieldLabel,
  input,
  select,
} from "../../../shared/ui/styles.ts";
import { formatDateOnly, formatPrice, pluralize } from "../../../shared/ui/format.ts";
import { daysUntil } from "../constants/reservations.ts";

interface PaymentPanelProps {
  reservation: Reservation;
  /** False for a guest, who sees the amounts but cannot record a payment. */
  canRecord: boolean;
  busy: boolean;
  /**
   * The methods the server says can be used. Only the ones taken in person are
   * offered here - an online payment sends the guest out to a provider and is
   * started from the guest's own screen, not from the front desk.
   */
  methods: PaymentMethodOption[];
  onRecord: (input: RecordPaymentInput) => void;
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
const PaymentPanel = ({ reservation, canRecord, busy, methods, onRecord }: PaymentPanelProps) => {
  const { payment, pricing } = reservation;
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [note, setNote] = useState("");

  // Cash, the hotel's own card terminal, a bank transfer that has landed: money
  // a person already took, which the front desk is only writing down.
  const overTheCounter = methods.filter((option) => option.available && !option.requiresRedirect);

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
            <label className={fieldLabel} htmlFor="payment-method">
              How it was paid
            </label>
            <select
              id="payment-method"
              className={select}
              value={method}
              onChange={(event) => setMethod(event.target.value as PaymentMethod)}
            >
              {overTheCounter.map((option) => (
                <option key={option.method} value={option.method}>
                  {option.label}
                </option>
              ))}
            </select>
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
              placeholder="Bank slip or terminal receipt number"
              onChange={(event) => setNote(event.target.value)}
            />
            <p className={fieldHint}>
              Never enter card numbers here - only the reference the terminal or bank gave you.
            </p>
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
                onRecord({ amount: value, method, externalReference: note });
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
