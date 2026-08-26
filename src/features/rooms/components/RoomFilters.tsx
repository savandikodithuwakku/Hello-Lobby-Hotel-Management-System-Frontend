import type { RoomType } from "../../../shared/api/types.ts";
import FilterPanel from "../../../shared/components/form/FilterPanel.tsx";
import NumberField from "../../../shared/components/form/NumberField.tsx";
import SearchField from "../../../shared/components/form/SearchField.tsx";
import SelectField from "../../../shared/components/form/SelectField.tsx";
import { formatResultCount } from "../../../shared/ui/format.ts";
import type { SelectOption } from "../../../shared/types/options.ts";
import {
  ACTIVE_OPTIONS,
  HOUSEKEEPING_OPTIONS,
  OCCUPANCY_OPTIONS,
  ROOM_SORT_OPTIONS,
} from "../constants/rooms.ts";
import type { RoomFilterPatch, RoomFilterState } from "../types.ts";

interface RoomFiltersProps {
  filters: RoomFilterState;
  roomTypes: RoomType[];
  onChange: (patch: RoomFilterPatch) => void;
  onReset: () => void;
  /** `null` while the list is loading. */
  resultCount: number | null;
}

/** Room number search plus type, status, floor and inventory filters. */
const RoomFilters = ({ filters, roomTypes, onChange, onReset, resultCount }: RoomFiltersProps) => {
  const typeOptions: SelectOption[] = roomTypes.map((type) => ({
    value: type.id,
    label: type.name,
  }));

  return (
    <FilterPanel
      label="Filter rooms"
      gridClassName="grid grid-cols-1 gap-4 min-[900px]:grid-cols-[minmax(200px,1.6fr)_repeat(3,minmax(140px,1fr))] min-[1280px]:grid-cols-[minmax(200px,1.6fr)_repeat(5,minmax(130px,1fr))]"
      resultSummary={formatResultCount(resultCount, "room")}
      hasFilters={Boolean(
        filters.search ||
        filters.roomType ||
        filters.occupancy ||
        filters.housekeeping ||
        filters.discrepant ||
        filters.floor ||
        filters.isActive
      )}
      onReset={onReset}
    >
      <SearchField
        label="Room number"
        placeholder="e.g. 205"
        value={filters.search}
        onChange={(search) => onChange({ search })}
      />

      <SelectField
        label="Room type"
        placeholder="All types"
        options={typeOptions}
        value={filters.roomType}
        onChange={(roomType) => onChange({ roomType })}
      />

      <SelectField
        label="Occupancy"
        placeholder="Anyone"
        options={OCCUPANCY_OPTIONS}
        value={filters.occupancy}
        onChange={(occupancy) => onChange({ occupancy })}
      />

      <SelectField
        label="Housekeeping"
        placeholder="Any state"
        options={HOUSEKEEPING_OPTIONS}
        value={filters.housekeeping}
        onChange={(housekeeping) => onChange({ housekeeping })}
      />

      <NumberField
        label="Floor"
        value={filters.floor}
        onChange={(floor) => onChange({ floor })}
      />

      <SelectField
        label="Inventory"
        placeholder="Active and removed"
        options={ACTIVE_OPTIONS}
        value={filters.isActive}
        onChange={(isActive) => onChange({ isActive })}
      />

      <SelectField
        label="Sort"
        options={ROOM_SORT_OPTIONS}
        value={filters.sort}
        onChange={(sort) => onChange({ sort })}
      />
    </FilterPanel>
  );
};

export default RoomFilters;
