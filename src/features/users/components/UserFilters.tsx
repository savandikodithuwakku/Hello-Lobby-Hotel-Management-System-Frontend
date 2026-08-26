import { useEffect, useId, useState } from "react";
import { Search, X } from "lucide-react";
import { buttonText, fieldLabel, inputWithIcon, select } from "../../../shared/ui/styles.ts";
import { ROLE_OPTIONS, SORT_OPTIONS, STATUS_OPTIONS } from "../constants/users.ts";
import type { UserFilterPatch, UserFilterState } from "../types.ts";

interface UserFiltersProps {
  filters: UserFilterState;
  onChange: (patch: UserFilterPatch) => void;
  onReset: () => void;
  /** `null` while the list is loading. */
  resultCount: number | null;
}

/**
 * Search, role, status and sort controls.
 *
 * The search box is debounced so typing a name does not fire a request per
 * keystroke; the selects apply immediately because each change is deliberate.
 */
const UserFilters = ({ filters, onChange, onReset, resultCount }: UserFiltersProps) => {
  const searchId = useId();
  const roleId = useId();
  const statusId = useId();
  const sortId = useId();

  const [searchDraft, setSearchDraft] = useState(filters.search);

  // Keep the box in step when the parent resets the filters.
  useEffect(() => {
    setSearchDraft(filters.search);
  }, [filters.search]);

  useEffect(() => {
    if (searchDraft === filters.search) return undefined;

    const timer = setTimeout(() => onChange({ search: searchDraft }), 350);
    return () => clearTimeout(timer);
  }, [searchDraft, filters.search, onChange]);

  const hasFilters = Boolean(filters.search || filters.role || filters.status);

  return (
    <section className="mb-6" aria-label="Filter users">
      <div className="grid grid-cols-1 gap-4 min-[900px]:grid-cols-[minmax(220px,2fr)_repeat(3,minmax(150px,1fr))]">
        <div>
          <label className={fieldLabel} htmlFor={searchId}>
            Search
          </label>
          <div className="relative flex items-center">
            <Search
              className="pointer-events-none absolute left-4 text-ink-dim"
              size={18}
              aria-hidden="true"
            />
            <input
              id={searchId}
              type="search"
              className={inputWithIcon}
              placeholder="Name, email or phone"
              value={searchDraft}
              onChange={(event) => setSearchDraft(event.target.value)}
            />
          </div>
        </div>

        <div>
          <label className={fieldLabel} htmlFor={roleId}>
            Role
          </label>
          <select
            id={roleId}
            className={select}
            value={filters.role}
            onChange={(event) => onChange({ role: event.target.value })}
          >
            <option value="">All roles</option>
            {ROLE_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={fieldLabel} htmlFor={statusId}>
            Status
          </label>
          <select
            id={statusId}
            className={select}
            value={filters.status}
            onChange={(event) => onChange({ status: event.target.value })}
          >
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={fieldLabel} htmlFor={sortId}>
            Sort
          </label>
          <select
            id={sortId}
            className={select}
            value={filters.sort}
            onChange={(event) => onChange({ sort: event.target.value })}
          >
            {SORT_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-4">
        <span className="text-[0.85rem] text-ink-muted">
          {resultCount === null
            ? "Loading..."
            : `${resultCount} user${resultCount === 1 ? "" : "s"} found`}
        </span>
        {hasFilters && (
          <button type="button" className={buttonText} onClick={onReset}>
            <X size={14} aria-hidden="true" /> Clear filters
          </button>
        )}
      </div>
    </section>
  );
};

export default UserFilters;
