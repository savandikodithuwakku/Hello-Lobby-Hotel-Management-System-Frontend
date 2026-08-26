import type {
  BaggageStatus,
  TicketCategory,
  TicketPriority,
  TicketStatus,
} from "../../../shared/api/types.ts";
import { toSelectOptions, type SelectOption } from "../../../shared/types/options.ts";

// Re-exported so a front-desk screen imports its formatting from one place.
export { formatPrice, formatDateOnly, formatDateTime, CURRENCY } from "../../../shared/ui/format.ts";
export { PAGE_SIZE } from "../../../shared/constants/pagination.ts";
export type { SelectOption };

/* -------------------------------------------------------------------------- */
/* Tickets                                                                    */
/* -------------------------------------------------------------------------- */

export const TICKET_STATUSES = {
  OPEN: "open",
  ACKNOWLEDGED: "acknowledged",
  IN_PROGRESS: "in_progress",
  ON_HOLD: "on_hold",
  RESOLVED: "resolved",
  CLOSED: "closed",
  CANCELLED: "cancelled",
} as const satisfies Record<string, TicketStatus>;

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  open: "Open",
  acknowledged: "Acknowledged",
  in_progress: "In progress",
  on_hold: "On hold",
  resolved: "Resolved",
  closed: "Closed",
  cancelled: "Cancelled",
};

export const TICKET_CATEGORY_LABELS: Record<TicketCategory, string> = {
  maintenance: "Maintenance",
  housekeeping: "Housekeeping",
  amenities: "Amenities",
  noise: "Noise",
  internet: "Internet",
  food_and_drink: "Food and drink",
  billing: "Billing",
  security: "Security",
  other: "Other",
};

export const TICKET_PRIORITY_LABELS: Record<TicketPriority, string> = {
  urgent: "Urgent",
  high: "High",
  medium: "Medium",
  low: "Low",
};

/**
 * One complete class list per value - Tailwind only ships classes it can find
 * as literals in the source, so these are never assembled at runtime.
 */
export const ticketStatusPill: Record<TicketStatus, string> = {
  open: "bg-warning/10 text-amber-700",
  acknowledged: "bg-brand/15 text-indigo-700",
  in_progress: "bg-brand/10 text-indigo-700",
  on_hold: "bg-ink-dim/15 text-ink-muted",
  resolved: "bg-success/10 text-emerald-700",
  closed: "bg-ink-dim/10 text-ink-muted",
  cancelled: "bg-danger/10 text-red-700",
};

export const ticketPriorityPill: Record<TicketPriority, string> = {
  urgent: "bg-danger/15 text-red-700",
  high: "bg-warning/15 text-orange-700",
  medium: "bg-brand/10 text-indigo-700",
  low: "bg-ink-dim/10 text-ink-muted",
};

/** Ordering for the board: an urgent ticket never sits below a low one. */
export const PRIORITY_RANK: Record<TicketPriority, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};

/**
 * Categories that can take a room out of service.
 *
 * Mirrors the server's own list. Shown so the UI can explain why the option is
 * missing rather than silently hiding it; the API refuses either way.
 */
export const ROOM_BLOCKING_CATEGORIES: TicketCategory[] = [
  "maintenance",
  "housekeeping",
  "security",
];

export const TICKET_STATUS_OPTIONS: SelectOption<TicketStatus>[] =
  toSelectOptions(TICKET_STATUS_LABELS);

export const TICKET_CATEGORY_OPTIONS: SelectOption<TicketCategory>[] =
  toSelectOptions(TICKET_CATEGORY_LABELS);

export const TICKET_PRIORITY_OPTIONS: SelectOption<TicketPriority>[] =
  toSelectOptions(TICKET_PRIORITY_LABELS);

export const TICKET_SORT_OPTIONS: SelectOption[] = [
  { value: "createdAt", label: "Oldest first" },
  { value: "-createdAt", label: "Newest first" },
  { value: "respondBy", label: "Due soonest" },
];

/** Oldest first: the ticket waiting longest is the one to look at. */
export const DEFAULT_TICKET_SORT = "createdAt";

/* -------------------------------------------------------------------------- */
/* Baggage                                                                    */
/* -------------------------------------------------------------------------- */

export const BAGGAGE_STATUS_LABELS: Record<BaggageStatus, string> = {
  stored: "Stored",
  collected: "Collected",
  unclaimed: "Unclaimed",
};

export const baggageStatusPill: Record<BaggageStatus, string> = {
  stored: "bg-brand/10 text-indigo-700",
  collected: "bg-success/10 text-emerald-700",
  unclaimed: "bg-danger/10 text-red-700",
};

export const BAGGAGE_STATUS_OPTIONS: SelectOption<BaggageStatus>[] =
  toSelectOptions(BAGGAGE_STATUS_LABELS);

export const BAGGAGE_SORT_OPTIONS: SelectOption[] = [
  { value: "receivedAt", label: "Longest held first" },
  { value: "-receivedAt", label: "Most recent first" },
  { value: "-bagCount", label: "Most pieces first" },
];

/** Longest-held first: the bags most likely to have been forgotten. */
export const DEFAULT_BAGGAGE_SORT = "receivedAt";

/* -------------------------------------------------------------------------- */
/* Shared helpers                                                             */
/* -------------------------------------------------------------------------- */

/** "3 bags" / "1 bag" - the kind of thing said out loud at a desk. */
export const formatBags = (count: number): string => `${count} ${count === 1 ? "bag" : "bags"}`;

/**
 * How long ago something happened, in words.
 *
 * A response target measured in minutes reads badly as a timestamp: "overdue by
 * 3 hours" is what somebody needs to know, not that it was due at 14:05.
 */
export const formatSince = (value: string | null): string => {
  if (!value) return "—";

  const minutes = Math.round((Date.now() - new Date(value).getTime()) / 60000);
  const ago = Math.abs(minutes);

  if (ago < 1) return "just now";
  if (ago < 60) return `${ago} min`;
  if (ago < 1440) return `${Math.round(ago / 60)} hr`;
  return `${Math.round(ago / 1440)} d`;
};

/** How long until a deadline, or how far past it. */
export const formatUntil = (value: string): { text: string; late: boolean } => {
  const minutes = Math.round((new Date(value).getTime() - Date.now()) / 60000);

  return minutes < 0
    ? { text: `${formatSince(value)} overdue`, late: true }
    : { text: `${formatSince(new Date(Date.now() - minutes * 60000).toISOString())} left`, late: false };
};
