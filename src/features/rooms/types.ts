/** The room-list filter set, mirrored one-for-one into the URL query string. */
export interface RoomFilterState {
  search: string;
  roomType: string;
  status: string;
  floor: string;
  isActive: string;
  sort: string;
  page: number;
}

/** The room-type-list filter set. */
export interface RoomTypeFilterState {
  search: string;
  isActive: string;
  occupancy: string;
  sort: string;
  page: number;
}

/** A partial update to a filter set; omitted keys keep their value. */
export type FilterPatch<TState> = Partial<Record<keyof TState, string>>;

export type RoomFilterPatch = FilterPatch<RoomFilterState>;
export type RoomTypeFilterPatch = FilterPatch<RoomTypeFilterState>;
