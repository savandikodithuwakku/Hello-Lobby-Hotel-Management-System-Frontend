import type { TicketPriority, TicketStatus } from "../../../shared/api/types.ts";
import { statusPillBase } from "../../../shared/ui/styles.ts";
import {
  TICKET_PRIORITY_LABELS,
  TICKET_STATUS_LABELS,
  ticketPriorityPill,
  ticketStatusPill,
} from "../constants/frontdesk.ts";

export const TicketStatusPill = ({ status }: { status: TicketStatus }) => (
  <span className={`${statusPillBase} ${ticketStatusPill[status]}`}>
    {TICKET_STATUS_LABELS[status]}
  </span>
);

export const TicketPriorityPill = ({ priority }: { priority: TicketPriority }) => (
  <span className={`${statusPillBase} ${ticketPriorityPill[priority]}`}>
    {TICKET_PRIORITY_LABELS[priority]}
  </span>
);
