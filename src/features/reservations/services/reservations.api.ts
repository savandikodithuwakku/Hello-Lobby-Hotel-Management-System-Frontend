import httpClient from "../../../shared/api/httpClient.ts";
import { toQueryString } from "../../../shared/api/query.ts";
import type {
  AvailabilityResult,
  Pagination,
  Reservation,
  ReservationHistoryEntry,
  ReservationStatistics,
} from "../../../shared/api/types.ts";

export interface AvailabilityParams {
  checkIn: string;
  checkOut: string;
  roomType?: string;
  guests?: number | string;
  floor?: string;
}

export interface ReservationListParams {
  search?: string;
  status?: string;
  customer?: string;
  room?: string;
  roomType?: string;
  from?: string;
  to?: string;
  unpaid?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface ReservationListResult {
  reservations: Reservation[];
  pagination: Pagination;
}

export interface ServiceLine {
  name: string;
  unitPrice: number;
  quantity: number;
}

export interface CreateReservationPayload {
  room: string;
  /** Staff only; the API refuses it from a guest booking for someone else. */
  customer?: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  additionalServices: ServiceLine[];
  specialRequests?: string;
}

export type UpdateReservationPayload = Partial<
  Pick<CreateReservationPayload, "room" | "checkIn" | "checkOut" | "guests" | "additionalServices" | "specialRequests">
>;

export const reservationsApi = {
  /** The double-booking check: only rooms free for the whole range come back. */
  availability: (params: AvailabilityParams) =>
    httpClient.get<AvailabilityResult>(`/reservations/availability${toQueryString(params)}`),

  occupancy: (checkIn: string, checkOut: string) =>
    httpClient.get<{
      sellableRooms: number;
      nights: { date: string; booked: number; free: number; occupancyRate: number }[];
    }>(`/reservations/occupancy${toQueryString({ checkIn, checkOut })}`),

  statistics: () => httpClient.get<ReservationStatistics>("/reservations/statistics"),

  list: (params: ReservationListParams) =>
    httpClient.get<ReservationListResult>(`/reservations${toQueryString(params)}`),

  get: (id: string) => httpClient.get<{ reservation: Reservation }>(`/reservations/${id}`),

  history: (id: string) =>
    httpClient.get<{ reference: string; history: ReservationHistoryEntry[] }>(
      `/reservations/${id}/history`
    ),

  create: (payload: CreateReservationPayload) =>
    httpClient.post<{ reservation: Reservation }>("/reservations", payload),

  update: (id: string, payload: UpdateReservationPayload) =>
    httpClient.patch<{ reservation: Reservation }>(`/reservations/${id}`, payload),

  confirm: (id: string, note?: string) =>
    httpClient.post<{ reservation: Reservation }>(`/reservations/${id}/confirm`, { note }),

  cancel: (id: string, reason?: string) =>
    httpClient.post<{ reservation: Reservation }>(`/reservations/${id}/cancel`, { reason }),

  checkIn: (id: string, note?: string) =>
    httpClient.post<{ reservation: Reservation }>(`/reservations/${id}/check-in`, { note }),

  checkOut: (id: string, note?: string) =>
    httpClient.post<{ reservation: Reservation }>(`/reservations/${id}/check-out`, { note }),

  complete: (id: string, note?: string) =>
    httpClient.post<{ reservation: Reservation }>(`/reservations/${id}/complete`, { note }),

  markNoShow: (id: string, note?: string) =>
    httpClient.post<{ reservation: Reservation }>(`/reservations/${id}/no-show`, { note }),

  /**
   * Records money against a booking. Paying the advance in full confirms the
   * reservation server-side, which is why the response carries it back.
   */
  recordPayment: (id: string, amount: number, note?: string) =>
    httpClient.patch<{
      reservation: Reservation;
      recorded: number;
      autoConfirmed: boolean;
    }>(`/reservations/${id}/payment`, { amount, note }),
};

export default reservationsApi;
