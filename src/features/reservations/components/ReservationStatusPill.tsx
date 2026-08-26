import type { ReservationStatus } from "../../../shared/api/types.ts";
import { statusPillBase } from "../../../shared/ui/styles.ts";
import { STATUS_HINTS, STATUS_LABELS, statusPill } from "../constants/reservations.ts";

/** Where a booking sits in its lifecycle. */
const ReservationStatusPill = ({ status }: { status: ReservationStatus }) => (
  <span className={`${statusPillBase} ${statusPill[status]}`} title={STATUS_HINTS[status]}>
    {STATUS_LABELS[status]}
  </span>
);

export default ReservationStatusPill;
