import { useEffect, useId, useState } from "react";
import { Search, X } from "lucide-react";
import type { RoomType } from "../../../shared/api/types.ts";
import { buttonText, fieldLabel, inputWithIcon, select } from "../../../shared/ui/styles.ts";
import { ACTIVE_OPTIONS, ROOM_SORT_OPTIONS, STATUS_OPTIONS } from "../constants/rooms.ts";
import type { RoomFilterPatch, RoomFilterState } from "../types.ts";

interface RoomFiltersProps {
  filters: RoomFilterState;
  roomTypes: RoomType[];
  onChange: (patch: RoomFilterPatch) => void;
  onReset: () => void;
  /** `null` while the list is loading. */
  resultCount: number | null;
}

/**
 * Room number search plus type, status, floor and activity filters.
 *
 * The search box is debounced so typing a room number does not fire a request
 * per keystroke; the selects apply immediately because each change is deliberate.
 */
const RoomFilters = ({ filters, roomTypes, onChange, onReset, resultCount }: RoomFiltersProps) => {
  const searchId = useId();
  const typeId = useId();
  const statusId = useId();
  const floorId = useId();
  const activeId = useId();
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

  const hasFilters = Boolean(
    filters.search || filters.roomType || filters.status || filters.floor || filters.isActive
  );

  return (
    <section className="mb-6" aria-label="Filter rooms">
      <div className="grid grid-cols-1 gap-4 min-[900px]:grid-cols-[minmax(200px,1.6fr)_repeat(3,minmax(140px,1fr))] min-[1280px]:grid-cols-[minmax(200px,1.6fr)_repeat(5,minmax(130px,1fr))]">
        <div>
          <label className={fieldLabel} htmlFor={searchId}>
            Room number
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
              placeholder="e.g. 205"
              value={searchDraft}
              onChange={(event) => setSearchDraft(event.target.value)}
            />
          </div>
        </div>

        <div>
          <label className={fieldLabel} htmlFor={typeId}>
            Room type
          </label>
          <select
            id={typeId}
            className={select}
            value={filters.roomType}
            onChange={(event) => onChange({ roomType: event.target.value })}
          >
            <option value="">All types</option>
            {roomTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
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
          <label className={fieldLabel} htmlFor={floorId}>
            Floor
          </label>
          <input
            id={floorId}
            type="number"
            className={select}
            placeholder="Any"
            value={filters.floor}
            onChange={(event) => onChange({ floor: event.target.value })}
          />
        </div>

        <div>
          <label className={fieldLabel} htmlFor={activeId}>
            Inventory
          </label>
          <select
            id={activeId}
            className={select}
            value={filters.isActive}
            onChange={(event) => onChange({ isActive: event.target.value })}
          >
            <option value="">Active and removed</option>
            {ACTIVE_OPTIONS.map(({ value, label }) => (
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
            {ROOM_SORT_OPTIONS.map(({ value, label }) => (
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
            : `${resultCount} room${resultCount === 1 ? "" : "s"} found`}
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

export default RoomFilters;
