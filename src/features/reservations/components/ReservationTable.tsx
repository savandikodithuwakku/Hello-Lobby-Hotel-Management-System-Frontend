import { Link } from "react-router-dom";
import { CalendarX } from "lucide-react";
import type { Reservation } from "../../../shared/api/types.ts";
import DataTable, { CELL, MUTED_CELL } from "../../../shared/components/DataTable.tsx";
import { link } from "../../../shared/ui/styles.ts";
import { formatNights, formatOccupancy, formatPrice } from "../../../shared/ui/format.ts";
import ReservationStatusPill from "./ReservationStatusPill.tsx";
import { formatStay } from "../constants/reservations.ts";

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
        {formatNights(reservation.nights)}, {formatOccupancy(reservation.guests)}
      </span>
    </td>
    <td className={CELL}>
      <ReservationStatusPill status={reservation.status} />
    </td>
    <td className={`${CELL} whitespace-nowrap tabular-nums`}>
      {formatPrice(reservation.pricing.totalAmount)}
      {reservation.payment.balanceDue > 0 && (
        <span className="block text-[0.78rem] text-amber-700">
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
}: ReservationTableProps) => (
  <DataTable
    headings={[
      "Reference",
      ...(showGuest ? ["Guest"] : []),
      "Room",
      "Stay",
      "Status",
      "Total",
    ]}
    minWidthClass="min-w-[820px]"
    loading={loading}
    isEmpty={reservations.length === 0}
    empty={{
      icon: CalendarX,
      title: "No reservations found",
      hint: emptyHint || "Try a different search term or date range, or clear the filters.",
    }}
  >
    {reservations.map((reservation) => (
      <ReservationRow key={reservation.id} reservation={reservation} showGuest={showGuest} />
    ))}
  </DataTable>
);

export default ReservationTable;
