import { useEffect, useId, useState } from "react";
import { Search, X } from "lucide-react";
import type { RoomType } from "../../../shared/api/types.ts";
import { buttonText, fieldLabel, inputWithIcon, select } from "../../../shared/ui/styles.ts";
import { SORT_OPTIONS, STATUS_OPTIONS } from "../constants/reservations.ts";
import type { ReservationFilterPatch, ReservationFilterState } from "../types.ts";

interface ReservationFiltersProps {
  filters: ReservationFilterState;
  roomTypes: RoomType[];
  onChange: (patch: ReservationFilterPatch) => void;
  onReset: () => void;
  resultCount: number | null;
  /** A guest filtering their own bookings needs a smaller control set. */
  compact?: boolean;
}

/**
 * Search, status, room type, date window and an "unpaid only" switch.
 *
 * The date window uses the same overlap rule as availability: a stay is shown
 * when it touches the window at all, not only when it starts inside it.
 */
const ReservationFilters = ({
  filters,
  roomTypes,
  onChange,
  onReset,
  resultCount,
  compact = false,
}: ReservationFiltersProps) => {
  const searchId = useId();
  const statusId = useId();
  const typeId = useId();
  const fromId = useId();
  const toId = useId();
  const sortId = useId();
  const unpaidId = useId();

  const [searchDraft, setSearchDraft] = useState(filters.search);

  useEffect(() => {
    setSearchDraft(filters.search);
  }, [filters.search]);

  useEffect(() => {
    if (searchDraft === filters.search) return undefined;

    const timer = setTimeout(() => onChange({ search: searchDraft }), 350);
    return () => clearTimeout(timer);
  }, [searchDraft, filters.search, onChange]);

  const hasFilters = Boolean(
    filters.search || filters.status || filters.roomType || filters.from || filters.to || filters.unpaid
  );

  return (
    <section className="mb-6" aria-label="Filter reservations">
      <div className="grid grid-cols-1 gap-4 min-[900px]:grid-cols-3 min-[1280px]:grid-cols-6">
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
              placeholder={compact ? "Booking reference" : "Reference, guest or room"}
              value={searchDraft}
              onChange={(event) => setSearchDraft(event.target.value)}
            />
          </div>
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

        {!compact && (
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
        )}

        <div>
          <label className={fieldLabel} htmlFor={fromId}>
            Staying from
          </label>
          <input
            id={fromId}
            type="date"
            className={select}
            value={filters.from}
            onChange={(event) => onChange({ from: event.target.value })}
          />
        </div>

        <div>
          <label className={fieldLabel} htmlFor={toId}>
            Staying until
          </label>
          <input
            id={toId}
            type="date"
            className={select}
            value={filters.to}
            onChange={(event) => onChange({ to: event.target.value })}
          />
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
        <span className="flex flex-wrap items-center gap-5">
          <span className="text-[0.85rem] text-ink-muted">
            {resultCount === null
              ? "Loading..."
              : `${resultCount} reservation${resultCount === 1 ? "" : "s"} found`}
          </span>

          <label className="inline-flex cursor-pointer items-center gap-2 text-[0.85rem] text-ink-muted">
            <input
              id={unpaidId}
              type="checkbox"
              className="size-4 accent-brand"
              checked={filters.unpaid === "true"}
              onChange={(event) => onChange({ unpaid: event.target.checked ? "true" : "" })}
            />
            Outstanding balance only
          </label>
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

export default ReservationFilters;
