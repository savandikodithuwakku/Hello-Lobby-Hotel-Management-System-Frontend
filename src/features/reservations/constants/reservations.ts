import type { ReservationStatus } from "../../../shared/api/types.ts";

export const RESERVATION_STATUSES = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  CHECKED_IN: "checked_in",
  CHECKED_OUT: "checked_out",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  NO_SHOW: "no_show",
} as const satisfies Record<string, ReservationStatus>;

export const STATUS_LABELS: Record<ReservationStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  checked_in: "Checked in",
  checked_out: "Checked out",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No show",
};

/** What each status means, shown as a tooltip and on the detail screen. */
export const STATUS_HINTS: Record<ReservationStatus, string> = {
  pending: "Held, waiting for the advance payment",
  confirmed: "Advance paid, the room is held",
  checked_in: "The guest is in the room",
  checked_out: "The guest has left, balance may still be owed",
  completed: "Closed and fully paid",
  cancelled: "Called off, the dates are free again",
  no_show: "The guest never arrived",
};

/** One complete class list per status; Tailwind needs literals. */
export const statusPill: Record<ReservationStatus, string> = {
  pending: "bg-warning/10 text-amber-400",
  confirmed: "bg-brand/15 text-indigo-300",
  checked_in: "bg-success/10 text-emerald-400",
  checked_out: "bg-accent/10 text-fuchsia-300",
  completed: "bg-ink-dim/15 text-ink-muted",
  cancelled: "bg-danger/10 text-red-400",
  no_show: "bg-danger/10 text-red-400",
};

export interface SelectOption<TValue extends string = string> {
  value: TValue;
  label: string;
}

export const STATUS_OPTIONS: SelectOption<ReservationStatus>[] = (
  Object.entries(STATUS_LABELS) as [ReservationStatus, string][]
).map(([value, label]) => ({ value, label }));

export const SORT_OPTIONS: SelectOption[] = [
  { value: "-createdAt", label: "Recently booked" },
  { value: "checkIn", label: "Arriving soonest" },
  { value: "-checkIn", label: "Arriving latest" },
  { value: "checkOut", label: "Departing soonest" },
  { value: "-totalAmount", label: "Highest value" },
];

export const PAGE_SIZE = 20;
export const DEFAULT_SORT = "-createdAt";

/** Mirrors the API's advance policy, for the quote shown before booking. */
export const ADVANCE_PERCENTAGE = 20;

export const estimateAdvance = (total: number): number =>
  Math.round(((total * ADVANCE_PERCENTAGE) / 100 + Number.EPSILON) * 100) / 100;

/** "26 Aug – 29 Aug" for a stay, since the year is usually obvious. */
export const formatStay = (checkIn: string, checkOut: string): string => {
  const options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
  const start = new Date(checkIn).toLocaleDateString(undefined, options);
  const end = new Date(checkOut).toLocaleDateString(undefined, options);
  return `${start} – ${end}`;
};

/** Days until a deadline; negative once it has passed. */
export const daysUntil = (value: string): number =>
  Math.ceil((new Date(value).getTime() - Date.now()) / 86_400_000);
