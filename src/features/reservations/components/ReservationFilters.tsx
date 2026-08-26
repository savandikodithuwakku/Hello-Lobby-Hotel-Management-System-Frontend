import { useId } from "react";
import type { RoomType } from "../../../shared/api/types.ts";
import DateField from "../../../shared/components/form/DateField.tsx";
import FilterPanel from "../../../shared/components/form/FilterPanel.tsx";
import SearchField from "../../../shared/components/form/SearchField.tsx";
import SelectField from "../../../shared/components/form/SelectField.tsx";
import { formatResultCount } from "../../../shared/ui/format.ts";
import type { SelectOption } from "../../../shared/types/options.ts";
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
  const unpaidId = useId();

  const typeOptions: SelectOption[] = roomTypes.map((type) => ({
    value: type.id,
    label: type.name,
  }));

  return (
    <FilterPanel
      label="Filter reservations"
      gridClassName="grid grid-cols-1 gap-4 min-[900px]:grid-cols-3 min-[1280px]:grid-cols-6"
      resultSummary={formatResultCount(resultCount, "reservation")}
      hasFilters={Boolean(
        filters.search ||
          filters.status ||
          filters.roomType ||
          filters.from ||
          filters.to ||
          filters.unpaid
      )}
      onReset={onReset}
      footerExtra={
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
      }
    >
      <SearchField
        label="Search"
        placeholder={compact ? "Booking reference" : "Reference, guest or room"}
        value={filters.search}
        onChange={(search) => onChange({ search })}
      />

      <SelectField
        label="Status"
        placeholder="All statuses"
        options={STATUS_OPTIONS}
        value={filters.status}
        onChange={(status) => onChange({ status })}
      />

      {!compact && (
        <SelectField
          label="Room type"
          placeholder="All types"
          options={typeOptions}
          value={filters.roomType}
          onChange={(roomType) => onChange({ roomType })}
        />
      )}

      <DateField
        label="Staying from"
        value={filters.from}
        onChange={(from) => onChange({ from })}
      />

      <DateField label="Staying until" value={filters.to} onChange={(to) => onChange({ to })} />

      <SelectField
        label="Sort"
        options={SORT_OPTIONS}
        value={filters.sort}
        onChange={(sort) => onChange({ sort })}
      />
    </FilterPanel>
  );
};

export default ReservationFilters;
