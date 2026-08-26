import FilterPanel from "../../../shared/components/form/FilterPanel.tsx";
import SearchField from "../../../shared/components/form/SearchField.tsx";
import SelectField from "../../../shared/components/form/SelectField.tsx";
import { formatResultCount } from "../../../shared/ui/format.ts";
import { ROLE_OPTIONS, SORT_OPTIONS, STATUS_OPTIONS } from "../constants/users.ts";
import type { UserFilterPatch, UserFilterState } from "../types.ts";

interface UserFiltersProps {
  filters: UserFilterState;
  onChange: (patch: UserFilterPatch) => void;
  onReset: () => void;
  /** `null` while the list is loading. */
  resultCount: number | null;
}

/** Search, role, status and sort controls for the user list. */
const UserFilters = ({ filters, onChange, onReset, resultCount }: UserFiltersProps) => (
  <FilterPanel
    label="Filter users"
    gridClassName="grid grid-cols-1 gap-4 min-[900px]:grid-cols-[minmax(220px,2fr)_repeat(3,minmax(150px,1fr))]"
    resultSummary={formatResultCount(resultCount, "user")}
    hasFilters={Boolean(filters.search || filters.role || filters.status)}
    onReset={onReset}
  >
    <SearchField
      label="Search"
      placeholder="Name, email or phone"
      value={filters.search}
      onChange={(search) => onChange({ search })}
    />

    <SelectField
      label="Role"
      placeholder="All roles"
      options={ROLE_OPTIONS}
      value={filters.role}
      onChange={(role) => onChange({ role })}
    />

    <SelectField
      label="Status"
      placeholder="All statuses"
      options={STATUS_OPTIONS}
      value={filters.status}
      onChange={(status) => onChange({ status })}
    />

    <SelectField
      label="Sort"
      options={SORT_OPTIONS}
      value={filters.sort}
      onChange={(sort) => onChange({ sort })}
    />
  </FilterPanel>
);

export default UserFilters;
