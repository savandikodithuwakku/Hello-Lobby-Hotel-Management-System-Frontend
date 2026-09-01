import { Link } from "react-router-dom";
import { DoorClosed } from "lucide-react";
import type { Room } from "../../../shared/api/types.ts";
import DataTable, { CELL, MUTED_CELL } from "../../../shared/components/DataTable.tsx";
import { link } from "../../../shared/ui/styles.ts";
import RoomStatusPills from "./RoomStatusPill.tsx";
import { formatFloor, formatPrice } from "../constants/rooms.ts";

/** Marks a room that has been taken out of the inventory but kept on record. */
export const InactiveFlag = () => (
  <span className="ml-2 inline-block border border-line bg-surface-hover px-1.5 py-0.5 text-[0.68rem] font-semibold tracking-[0.04em] text-ink-dim uppercase">
    removed
  </span>
);

const RoomRow = ({ room }: { room: Room }) => (
  <tr className="[&:last-child>td]:border-b-0 hover:bg-surface-hover">
    <td className={CELL}>
      <Link to={`/rooms/${room.id}`} className={link}>
        {room.roomNumber}
      </Link>
      {!room.isActive && <InactiveFlag />}
    </td>
    <td className={MUTED_CELL}>{room.roomType.name}</td>
    <td className={MUTED_CELL}>{formatFloor(room.floor)}</td>
    <td className={CELL}>
      <RoomStatusPills occupancy={room.occupancy} housekeeping={room.housekeeping} />
    </td>
    <td className={`${CELL} whitespace-nowrap tabular-nums`}>
      {formatPrice(room.effectivePrice)}
      {room.price === null && (
        <span className="ml-2 text-[0.72rem] text-ink-dim" title="Follows the room type's base price">
          from type
        </span>
      )}
    </td>
    <td className={`${MUTED_CELL} tabular-nums`}>{room.roomType.maxOccupancy}</td>
  </tr>
);

const HEADINGS = ["Room", "Type", "Floor", "Status", "Price / night", "Sleeps"];

const RoomTable = ({ rooms, loading }: { rooms: Room[]; loading: boolean }) => (
  <DataTable
    headings={HEADINGS}
    minWidthClass="min-w-[760px]"
    loading={loading}
    isEmpty={rooms.length === 0}
    empty={{
      icon: DoorClosed,
      title: "No rooms match these filters",
      hint: "Try a different room number or status, or clear the filters to see the whole inventory.",
    }}
  >
    {rooms.map((room) => (
      <RoomRow key={room.id} room={room} />
    ))}
  </DataTable>
);

export default RoomTable;
