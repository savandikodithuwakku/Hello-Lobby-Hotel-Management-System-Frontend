/** The user-list filter set, mirrored one-for-one into the URL query string. */
export interface UserFilterState {
  search: string;
  role: string;
  status: string;
  sort: string;
  page: number;
}

/** A partial update to the filter set; omitted keys keep their value. */
export type UserFilterPatch = Partial<Record<keyof UserFilterState, string>>;
