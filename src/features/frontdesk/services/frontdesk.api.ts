import httpClient from "../../../shared/api/httpClient.ts";
import { toQueryString } from "../../../shared/api/query.ts";
import type {
  HousekeepingStatus,
  Invoice,
  Reservation,
  RoomOccupancy,
} from "../../../shared/api/types.ts";

/**
 * The front desk.
 *
 * Arrivals and departures are not reservation edits - they have conditions of
 * their own, spanning the booking, the room and the bill - so they live here
 * rather than under `/reservations`.
 */

/** Why a guest cannot be checked in or out yet. */
export interface FrontDeskBlocker {
  code: string;
  message: string;
  /** True only for the unpaid advance, which a manager may wave through. */
  overridable: boolean;
  outstanding?: number;
}

export interface ArrivalRow {
  reservation: Reservation;
  ready: boolean;
  blockers: FrontDeskBlocker[];
}

export interface DepartureRow extends ArrivalRow {
  balanceDue: number;
}

export interface FrontDeskBoard {
  date: string;
  arrivals: ArrivalRow[];
  departures: DepartureRow[];
  inHouse: Reservation[];
  counts: {
    arrivals: number;
    arrivalsBlocked: number;
    departures: number;
    departuresBlocked: number;
    inHouse: number;
  };
}

export interface CheckInPreview {
  reservation: Reservation;
  invoice: Invoice;
  ready: boolean;
  blockers: FrontDeskBlocker[];
}

export interface CheckOutPreview extends CheckInPreview {
  balanceDue: number;
}

export interface HousekeepingRoom {
  id: string;
  roomNumber: string;
  floor: number;
  roomType: string | null;
  occupancy: RoomOccupancy;
  housekeeping: HousekeepingStatus;
  housekeepingNote: string;
  housekeepingChangedAt: string;
  /** Empty, and not fit to sell. */
  discrepant: boolean;
}

export interface HousekeepingBoard {
  total: number;
  discrepant: number;
  counts: Record<HousekeepingStatus, number>;
  byHousekeeping: Record<HousekeepingStatus, HousekeepingRoom[]>;
}

export const frontdeskApi = {
  /** Today at a glance: arrivals, departures and who is in the building. */
  board: () => httpClient.get<FrontDeskBoard>("/front-desk/board"),

  /**
   * Every reason a guest cannot be checked in, before the desk tries. Changes
   * nothing, so it is safe to call as the screen loads.
   */
  arrival: (reservationId: string) =>
    httpClient.get<CheckInPreview>(`/front-desk/arrivals/${reservationId}`),

  /**
   * The guest has arrived. Pass an override reason only when a manager is
   * letting an unpaid advance through - it is recorded in the audit log.
   */
  checkIn: (reservationId: string, options: { note?: string; overrideReason?: string } = {}) =>
    httpClient.post<{ reservation: Reservation; invoice: Invoice; overridden: string[] }>(
      `/front-desk/arrivals/${reservationId}/check-in`,
      {
        note: options.note,
        ...(options.overrideReason ? { override: { reason: options.overrideReason } } : {}),
      }
    ),

  /** The final bill, including everything charged to the room during the stay. */
  departure: (reservationId: string) =>
    httpClient.get<CheckOutPreview>(`/front-desk/departures/${reservationId}`),

  /** The guest is leaving. Refused while anything is still outstanding. */
  checkOut: (reservationId: string, note?: string) =>
    httpClient.post<{ reservation: Reservation; invoice: Invoice }>(
      `/front-desk/departures/${reservationId}/check-out`,
      { note }
    ),

  /** Every room grouped by what needs doing to it. */
  housekeeping: (params: { floor?: string } = {}) =>
    httpClient.get<HousekeepingBoard>(`/front-desk/housekeeping${toQueryString(params)}`),
};

export default frontdeskApi;
