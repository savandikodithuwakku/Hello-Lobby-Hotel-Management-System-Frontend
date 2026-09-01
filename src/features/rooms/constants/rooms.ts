import type { HousekeepingStatus, RoomOccupancy } from "../../../shared/api/types.ts";
import { toSelectOptions, type SelectOption } from "../../../shared/types/options.ts";

// Re-exported so a rooms screen imports its formatting from one place.
export { formatPrice, formatDateTime, formatOccupancy, CURRENCY } from "../../../shared/ui/format.ts";
export { PAGE_SIZE } from "../../../shared/constants/pagination.ts";
export type { SelectOption };

/**
 * A room's two statuses.
 *
 * `occupancy` is driven by bookings and is never chosen by hand - it is shown
 * so the desk can see who holds the room. `housekeeping` is the one staff act
 * on, and it is the only one this feature offers as a choice.
 */

export const OCCUPANCY_LABELS: Record<RoomOccupancy, string> = {
  vacant: "Vacant",
  reserved: "Reserved",
  occupied: "Occupied",
};

export const HOUSEKEEPING_LABELS: Record<HousekeepingStatus, string> = {
  clean: "Clean",
  dirty: "Dirty",
  cleaning: "Being cleaned",
  inspected: "Inspected",
  out_of_order: "Out of order",
};

/**
 * One complete class list per status - Tailwind only ships classes it can find
 * as literals, so these are never assembled at runtime.
 */
export const occupancyPill: Record<RoomOccupancy, string> = {
  vacant: "bg-success/10 text-emerald-700",
  reserved: "bg-brand/15 text-indigo-700",
  occupied: "bg-accent/10 text-fuchsia-700",
};

export const housekeepingPill: Record<HousekeepingStatus, string> = {
  clean: "bg-success/10 text-emerald-700",
  inspected: "bg-success/15 text-emerald-800",
  dirty: "bg-warning/10 text-amber-700",
  cleaning: "bg-brand/10 text-indigo-700",
  out_of_order: "bg-danger/10 text-red-700",
};

export const HOUSEKEEPING_OPTIONS: SelectOption<HousekeepingStatus>[] =
  toSelectOptions(HOUSEKEEPING_LABELS);

export const OCCUPANCY_OPTIONS: SelectOption<RoomOccupancy>[] = toSelectOptions(OCCUPANCY_LABELS);

export const ROOM_SORT_OPTIONS: SelectOption[] = [
  { value: "roomNumber", label: "Room number" },
  { value: "-roomNumber", label: "Room number (desc)" },
  { value: "floor", label: "Floor, lowest first" },
  { value: "-floor", label: "Floor, highest first" },
  { value: "price", label: "Price, lowest first" },
  { value: "-price", label: "Price, highest first" },
  { value: "-createdAt", label: "Recently added" },
];

export const ROOM_TYPE_SORT_OPTIONS: SelectOption[] = [
  { value: "basePrice", label: "Price, lowest first" },
  { value: "-basePrice", label: "Price, highest first" },
  { value: "name", label: "Name A-Z" },
  { value: "-name", label: "Name Z-A" },
  { value: "-maxOccupancy", label: "Sleeps most first" },
  { value: "-createdAt", label: "Recently added" },
];

export const ACTIVE_OPTIONS: SelectOption[] = [
  { value: "true", label: "Active only" },
  { value: "false", label: "Deactivated only" },
];

export const DEFAULT_ROOM_SORT = "roomNumber";
export const DEFAULT_ROOM_TYPE_SORT = "basePrice";

/** "Ground floor" reads better than "Floor 0" on a hotel screen. */
export const formatFloor = (floor: number): string => {
  if (floor === 0) return "Ground floor";
  if (floor < 0) return `Basement ${Math.abs(floor)}`;
  return `Floor ${floor}`;
};

