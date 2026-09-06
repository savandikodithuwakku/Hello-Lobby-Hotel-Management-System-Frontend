import type { FilterPatch } from "../../shared/hooks/useUrlFilters.ts";

/** The user-list filter set, mirrored one-for-one into the URL query string. */
export interface UserFilterState {
  search: string;
  role: string;
  status: string;
  sort: string;
  page: number;
}

export type UserFilterPatch = FilterPatch<UserFilterState>;
