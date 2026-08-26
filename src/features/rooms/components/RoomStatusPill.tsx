import type { HousekeepingStatus, RoomOccupancy } from "../../../shared/api/types.ts";
import { statusPillBase } from "../../../shared/ui/styles.ts";
import {
  HOUSEKEEPING_LABELS,
  OCCUPANCY_LABELS,
  housekeepingPill,
  occupancyPill,
} from "../constants/rooms.ts";

/**
 * A room's two statuses, shown as two pills.
 *
 * They are deliberately not merged into one badge. "Occupied" and "dirty" are
 * both true of the same room most mornings, and collapsing them into a single
 * word is what made housekeeping impossible to record in the first place.
 */

export const OccupancyPill = ({ occupancy }: { occupancy: RoomOccupancy }) => (
  <span className={`${statusPillBase} ${occupancyPill[occupancy]}`}>
    {OCCUPANCY_LABELS[occupancy]}
  </span>
);

export const HousekeepingPill = ({ housekeeping }: { housekeeping: HousekeepingStatus }) => (
  <span className={`${statusPillBase} ${housekeepingPill[housekeeping]}`}>
    {HOUSEKEEPING_LABELS[housekeeping]}
  </span>
);

interface RoomStatusPillsProps {
  occupancy: RoomOccupancy;
  housekeeping: HousekeepingStatus;
}

const RoomStatusPills = ({ occupancy, housekeeping }: RoomStatusPillsProps) => (
  <span className="inline-flex flex-wrap items-center gap-1.5">
    <OccupancyPill occupancy={occupancy} />
    <HousekeepingPill housekeeping={housekeeping} />
  </span>
);

export default RoomStatusPills;
