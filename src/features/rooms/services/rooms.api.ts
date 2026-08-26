import httpClient from "../../../shared/api/httpClient.ts";
import { toQueryString } from "../../../shared/api/query.ts";
import type {
  CatalogRoomType,
  Pagination,
  Room,
  RoomStatistics,
  RoomStatus,
  RoomType,
  RoomTypeImage,
} from "../../../shared/api/types.ts";

/* -------------------------------------------------------------------------- */
/* Room types                                                                 */
/* -------------------------------------------------------------------------- */

export interface RoomTypeListParams {
  search?: string;
  isActive?: string;
  occupancy?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface RoomTypeListResult {
  roomTypes: RoomType[];
  pagination: Pagination;
}

export interface RoomTypePayload {
  name: string;
  description: string;
  basePrice: number;
  maxOccupancy: number;
  facilities: string[];
  images: Pick<RoomTypeImage, "url" | "alt" | "isPrimary">[];
}

export const roomTypesApi = {
  list: (params: RoomTypeListParams) =>
    httpClient.get<RoomTypeListResult>(`/room-types${toQueryString(params)}`),

  /**
   * The same endpoint seen by a guest. The API decides how much to return from
   * the caller's permissions, so this only narrows the type it is read back as.
   */
  browse: (params: RoomTypeListParams) =>
    httpClient.get<{ roomTypes: CatalogRoomType[]; pagination: Pagination }>(
      `/room-types${toQueryString(params)}`
    ),
  get: (id: string) => httpClient.get<{ roomType: RoomType }>(`/room-types/${id}`),
  create: (payload: RoomTypePayload) =>
    httpClient.post<{ roomType: RoomType }>("/room-types", payload),
  update: (id: string, payload: Partial<RoomTypePayload>) =>
    httpClient.patch<{ roomType: RoomType }>(`/room-types/${id}`, payload),
  /** Soft delete: the type is withdrawn from the catalogue, never removed. */
  deactivate: (id: string) => httpClient.delete<{ roomType: RoomType }>(`/room-types/${id}`),
  restore: (id: string) => httpClient.post<{ roomType: RoomType }>(`/room-types/${id}/restore`),
};

/* -------------------------------------------------------------------------- */
/* Rooms                                                                      */
/* -------------------------------------------------------------------------- */

export interface RoomListParams {
  search?: string;
  roomType?: string;
  status?: string;
  floor?: string;
  isActive?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface RoomListResult {
  rooms: Room[];
  pagination: Pagination;
}

export interface CreateRoomPayload {
  roomNumber: string;
  roomType: string;
  floor: number;
  price: number | null;
  facilities: string[];
}

export type UpdateRoomPayload = Partial<CreateRoomPayload>;

export const roomsApi = {
  list: (params: RoomListParams) => httpClient.get<RoomListResult>(`/rooms${toQueryString(params)}`),

  /** Rooms bookable right now. Date-range availability arrives with reservations. */
  available: (params: { roomType?: string; floor?: string; occupancy?: string }) =>
    httpClient.get<{ rooms: Room[]; total: number }>(`/rooms/available${toQueryString(params)}`),

  statistics: () => httpClient.get<RoomStatistics>("/rooms/statistics"),
  get: (id: string) => httpClient.get<{ room: Room }>(`/rooms/${id}`),
  create: (payload: CreateRoomPayload) => httpClient.post<{ room: Room }>("/rooms", payload),
  update: (id: string, payload: UpdateRoomPayload) =>
    httpClient.patch<{ room: Room }>(`/rooms/${id}`, payload),

  /** Housekeeping and maintenance moves only; bookings drive the rest. */
  changeStatus: (id: string, status: RoomStatus, note?: string) =>
    httpClient.patch<{ room: Room }>(`/rooms/${id}/status`, { status, note }),

  deactivate: (id: string, note?: string) =>
    httpClient.delete<{ room: Room }>(`/rooms/${id}`, note ? { note } : null),
  restore: (id: string) => httpClient.post<{ room: Room }>(`/rooms/${id}/restore`),
};
