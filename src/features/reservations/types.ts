import type { FilterPatch } from "../../shared/hooks/useUrlFilters.ts";

/** The reservation-list filter set, mirrored one-for-one into the URL. */
export interface ReservationFilterState {
  search: string;
  status: string;
  roomType: string;
  from: string;
  to: string;
  unpaid: string;
  sort: string;
  page: number;
}

export type ReservationFilterPatch = FilterPatch<ReservationFilterState>;
