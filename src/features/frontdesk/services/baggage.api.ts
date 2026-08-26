import httpClient from "../../../shared/api/httpClient.ts";
import { toQueryString } from "../../../shared/api/query.ts";
import type { Baggage, BaggageStatistics, Pagination } from "../../../shared/api/types.ts";

export interface BaggageListParams {
  search?: string;
  status?: string;
  guest?: string;
  reservation?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface StoreBaggagePayload {
  bagCount: number;
  /** Either an account or a written-down name is required. */
  guest?: string;
  guestName?: string;
  reservation?: string;
  description?: string;
  location?: string;
  note?: string;
}

export const baggageApi = {
  list: (params: BaggageListParams = {}) =>
    httpClient.get<{ baggage: Baggage[]; pagination: Pagination }>(
      `/baggage${toQueryString(params)}`
    ),

  statistics: () => httpClient.get<BaggageStatistics>("/baggage/statistics"),

  get: (id: string) => httpClient.get<{ baggage: Baggage }>(`/baggage/${id}`),

  /** How the desk actually finds bags: somebody hands over a paper tag. */
  byTag: (tag: string) =>
    httpClient.get<{ baggage: Baggage }>(`/baggage/tag/${encodeURIComponent(tag)}`),

  /** The response carries the tag number to write on the guest's ticket. */
  store: (payload: StoreBaggagePayload) =>
    httpClient.post<{ baggage: Baggage }>("/baggage", payload),

  update: (
    id: string,
    payload: Partial<Pick<StoreBaggagePayload, "bagCount" | "description" | "location" | "note">>
  ) => httpClient.patch<{ baggage: Baggage }>(`/baggage/${id}`, payload),

  /** Who took them is recorded: it is not always the guest. */
  collect: (id: string, options: { collectedByName?: string; note?: string } = {}) =>
    httpClient.post<{ baggage: Baggage }>(`/baggage/${id}/collect`, options),
};

export default baggageApi;
