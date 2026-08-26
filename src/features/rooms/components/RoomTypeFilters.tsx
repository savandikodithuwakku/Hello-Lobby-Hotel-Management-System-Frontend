import FilterPanel from "../../../shared/components/form/FilterPanel.tsx";
import NumberField from "../../../shared/components/form/NumberField.tsx";
import SearchField from "../../../shared/components/form/SearchField.tsx";
import SelectField from "../../../shared/components/form/SelectField.tsx";
import { formatResultCount } from "../../../shared/ui/format.ts";
import { ROOM_TYPE_SORT_OPTIONS } from "../constants/rooms.ts";
import type { RoomTypeFilterPatch, RoomTypeFilterState } from "../types.ts";

interface RoomTypeFiltersProps {
  filters: RoomTypeFilterState;
  onChange: (patch: RoomTypeFilterPatch) => void;
  onReset: () => void;
  /** `null` while the list is loading. */
  resultCount: number | null;
}

/**
 * Catalogue filters for the room-type list.
 *
 * The activity filter says "withdrawn" rather than "deactivated": a room type
 * is a thing the hotel sells, so taking one off the list is a catalogue
 * decision rather than an inventory one.
 */
const CATALOGUE_OPTIONS = [
  { value: "true", label: "Active only" },
  { value: "false", label: "Withdrawn only" },
];

const RoomTypeFilters = ({ filters, onChange, onReset, resultCount }: RoomTypeFiltersProps) => (
  <FilterPanel
    label="Filter room types"
    gridClassName="grid grid-cols-1 gap-4 min-[900px]:grid-cols-[minmax(220px,2fr)_repeat(3,minmax(150px,1fr))]"
    resultSummary={formatResultCount(resultCount, "room type")}
    hasFilters={Boolean(filters.search || filters.isActive || filters.occupancy)}
    onReset={onReset}
  >
    <SearchField
      label="Search"
      placeholder="Name or description"
      value={filters.search}
      onChange={(search) => onChange({ search })}
    />

    <NumberField
      label="Sleeps at least"
      min={1}
      value={filters.occupancy}
      onChange={(occupancy) => onChange({ occupancy })}
    />

    <SelectField
      label="Catalogue"
      placeholder="Active and withdrawn"
      options={CATALOGUE_OPTIONS}
      value={filters.isActive}
      onChange={(isActive) => onChange({ isActive })}
    />

    <SelectField
      label="Sort"
      options={ROOM_TYPE_SORT_OPTIONS}
      value={filters.sort}
      onChange={(sort) => onChange({ sort })}
    />
  </FilterPanel>
);

export default RoomTypeFilters;
