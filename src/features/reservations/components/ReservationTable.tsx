import { Link } from "react-router-dom";
import { CalendarX } from "lucide-react";
import type { Reservation } from "../../../shared/api/types.ts";
import { link } from "../../../shared/ui/styles.ts";
import { formatPrice } from "../../../shared/ui/format.ts";
import ReservationStatusPill from "./ReservationStatusPill.tsx";
import { formatStay } from "../constants/reservations.ts";

const CELL = "border-b border-line px-4 py-3 text-left align-middle";
const MUTED_CELL = `${CELL} text-ink-muted`;

const ReservationRow = ({ reservation, showGuest }: { reservation: Reservation; showGuest: boolean }) => (
  <tr className="[&:last-child>td]:border-b-0 hover:bg-surface-hover">
    <td className={CELL}>
      <Link to={`/reservations/${reservation.id}`} className={`${link} font-mono text-[0.85rem]`}>
        {reservation.reference}
      </Link>
    </td>
    {showGuest && (
      <td className={MUTED_CELL}>
        {reservation.customer.name || "—"}
        <span className="block text-[0.78rem] text-ink-dim">{reservation.customer.email}</span>
      </td>
    )}
    <td className={MUTED_CELL}>
      {reservation.room.roomNumber ? `Room ${reservation.room.roomNumber}` : "—"}
      <span className="block text-[0.78rem] text-ink-dim">{reservation.roomType.name}</span>
    </td>
    <td className={`${CELL} whitespace-nowrap`}>
      {formatStay(reservation.checkIn, reservation.checkOut)}
      <span className="block text-[0.78rem] text-ink-dim">
        {reservation.nights} night{reservation.nights === 1 ? "" : "s"}, {reservation.guests} guest
        {reservation.guests === 1 ? "" : "s"}
      </span>
    </td>
    <td className={CELL}>
      <ReservationStatusPill status={reservation.status} />
    </td>
    <td className={`${CELL} whitespace-nowrap tabular-nums`}>
      {formatPrice(reservation.pricing.totalAmount)}
      {reservation.payment.balanceDue > 0 && (
        <span className="block text-[0.78rem] text-amber-400">
          {formatPrice(reservation.payment.balanceDue)} due
        </span>
      )}
    </td>
  </tr>
);

interface ReservationTableProps {
  reservations: Reservation[];
  loading: boolean;
  /** Hidden for a guest looking at their own bookings. */
  showGuest?: boolean;
  emptyHint?: string;
}

const ReservationTable = ({
  reservations,
  loading,
  showGuest = true,
  emptyHint,
}: ReservationTableProps) => {
  if (!loading && reservations.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 border border-line px-6 py-14 text-center text-ink-dim">
        <CalendarX size={28} aria-hidden="true" />
        <p className="font-semibold text-ink">No reservations found</p>
        <p className="max-w-[46ch] text-[0.88rem] text-ink-muted">
          {emptyHint || "Try a different search term or date range, or clear the filters."}
        </p>
      </div>
    );
  }

  const headings = [
    "Reference",
    ...(showGuest ? ["Guest"] : []),
    "Room",
    "Stay",
    "Status",
    "Total",
  ];

  return (
    <div className="overflow-x-auto border border-line" aria-busy={loading}>
      <table className="w-full min-w-[820px] border-collapse text-sm">
        <thead>
          <tr>
            {headings.map((heading) => (
              <th
                key={heading}
                scope="col"
                className={`${CELL} bg-surface-hover text-xs font-semibold tracking-[0.05em] whitespace-nowrap text-ink-muted uppercase`}
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {reservations.map((reservation) => (
            <ReservationRow
              key={reservation.id}
              reservation={reservation}
              showGuest={showGuest}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReservationTable;
