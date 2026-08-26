import httpClient from "../../../shared/api/httpClient.ts";
import { toQueryString } from "../../../shared/api/query.ts";
import type {
  Pagination,
  Ticket,
  TicketCategory,
  TicketPriority,
  TicketStatistics,
  TicketStatus,
} from "../../../shared/api/types.ts";

export interface TicketListParams {
  search?: string;
  status?: string;
  category?: string;
  priority?: string;
  room?: string;
  guest?: string;
  assignedTo?: string;
  active?: string;
  overdue?: string;
  unassigned?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface CreateTicketPayload {
  subject: string;
  description: string;
  category: TicketCategory;
  /** Staff only - a guest's ticket always starts at medium. */
  priority?: TicketPriority;
  /** Required for a guest: which of their bookings this is about. */
  reservation?: string;
  room?: string;
  guest?: string;
  /** Staff only: take the room out of service straight away. */
  blocksRoom?: boolean;
}

export const ticketsApi = {
  list: (params: TicketListParams = {}) =>
    httpClient.get<{ tickets: Ticket[]; pagination: Pagination }>(
      `/tickets${toQueryString(params)}`
    ),

  statistics: () => httpClient.get<TicketStatistics>("/tickets/statistics"),

  /** The category, priority and status lists the filters are built from. */
  options: () =>
    httpClient.get<{
      categories: TicketCategory[];
      priorities: TicketPriority[];
      statuses: TicketStatus[];
    }>("/tickets/options"),

  get: (id: string) => httpClient.get<{ ticket: Ticket }>(`/tickets/${id}`),

  create: (payload: CreateTicketPayload) =>
    httpClient.post<{ ticket: Ticket }>("/tickets", payload),

  update: (
    id: string,
    payload: Partial<Pick<CreateTicketPayload, "subject" | "description" | "category" | "priority">>
  ) => httpClient.patch<{ ticket: Ticket }>(`/tickets/${id}`, payload),

  /** `null` takes the ticket back off whoever had it. */
  assign: (id: string, assignedTo: string | null) =>
    httpClient.patch<{ ticket: Ticket }>(`/tickets/${id}/assignee`, { assignedTo }),

  /** Adding a note is the one write a guest performs on their own ticket. */
  comment: (id: string, note: string) =>
    httpClient.post<{ ticket: Ticket }>(`/tickets/${id}/comments`, { note }),

  /** Resolving needs a resolution - the server refuses without one. */
  changeStatus: (
    id: string,
    status: TicketStatus,
    options: { note?: string; resolution?: string } = {}
  ) => httpClient.post<{ ticket: Ticket }>(`/tickets/${id}/status`, { status, ...options }),

  /** Takes the room out of service because of this ticket, or gives it back. */
  setRoomBlock: (id: string, blocksRoom: boolean) =>
    httpClient.post<{ ticket: Ticket }>(`/tickets/${id}/room-block`, { blocksRoom }),
};

export default ticketsApi;
