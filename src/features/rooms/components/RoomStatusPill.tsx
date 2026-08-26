import type { RoomStatus } from "../../../shared/api/types.ts";
import { statusPillBase } from "../../../shared/ui/styles.ts";
import { STATUS_LABELS, statusPill } from "../constants/rooms.ts";

/** The room's live status, coloured by what it means for the front desk. */
const RoomStatusPill = ({ status }: { status: RoomStatus }) => (
  <span className={`${statusPillBase} ${statusPill[status]}`}>{STATUS_LABELS[status]}</span>
);

export default RoomStatusPill;
