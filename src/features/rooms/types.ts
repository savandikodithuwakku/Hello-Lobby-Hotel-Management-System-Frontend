/** The room-list filter set, mirrored one-for-one into the URL query string. */
export interface RoomFilterState {
  search: string;
  roomType: string;
  /** Who holds the room - driven by bookings. */
  occupancy: string;
  /** Whether it is fit to sell - driven by housekeeping. */
  housekeeping: string;
  /** "true" to show only rooms standing empty that cannot be sold. */
  discrepant: string;
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
