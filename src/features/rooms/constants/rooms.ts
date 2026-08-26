import type { RoomStatus } from "../../../shared/api/types.ts";
import { toSelectOptions, type SelectOption } from "../../../shared/types/options.ts";

// Re-exported so a rooms screen imports its formatting from one place.
export { formatPrice, formatDateTime, formatOccupancy, CURRENCY } from "../../../shared/ui/format.ts";
export { PAGE_SIZE } from "../../../shared/constants/pagination.ts";
export type { SelectOption };

export const ROOM_STATUSES = {
  AVAILABLE: "available",
  RESERVED: "reserved",
  OCCUPIED: "occupied",
  CLEANING: "cleaning",
  MAINTENANCE: "maintenance",
  OUT_OF_SERVICE: "out_of_service",
} as const satisfies Record<string, RoomStatus>;

export const STATUS_LABELS: Record<RoomStatus, string> = {
  available: "Available",
  reserved: "Reserved",
  occupied: "Occupied",
  cleaning: "Cleaning",
  maintenance: "Maintenance",
  out_of_service: "Out of service",
};

/**
 * One complete class list per status - Tailwind only ships classes it can find
 * as literals, so these are never assembled at runtime.
 */
export const statusPill: Record<RoomStatus, string> = {
  available: "bg-success/10 text-emerald-400",
  reserved: "bg-brand/15 text-indigo-300",
  occupied: "bg-accent/10 text-fuchsia-300",
  cleaning: "bg-warning/10 text-amber-400",
  maintenance: "bg-warning/10 text-orange-300",
  out_of_service: "bg-danger/10 text-red-400",
};

/**
 * Statuses the reservation and check-in flows own. They are shown but never
 * offered as a manual choice, matching the rule the API enforces.
 */
export const RESERVATION_CONTROLLED_STATUSES: RoomStatus[] = [
  ROOM_STATUSES.RESERVED,
  ROOM_STATUSES.OCCUPIED,
];

export const STATUS_OPTIONS: SelectOption<RoomStatus>[] = toSelectOptions(STATUS_LABELS);

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

