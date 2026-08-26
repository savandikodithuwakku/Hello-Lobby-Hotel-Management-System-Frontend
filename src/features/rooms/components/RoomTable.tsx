import { Link } from "react-router-dom";
import { DoorClosed } from "lucide-react";
import type { Room } from "../../../shared/api/types.ts";
import { link } from "../../../shared/ui/styles.ts";
import RoomStatusPill from "./RoomStatusPill.tsx";
import { formatFloor, formatPrice } from "../constants/rooms.ts";

const CELL = "border-b border-line px-4 py-3 text-left align-middle";
const MUTED_CELL = `${CELL} text-ink-muted`;

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
      <RoomStatusPill status={room.status} />
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

const RoomTable = ({ rooms, loading }: { rooms: Room[]; loading: boolean }) => {
  if (!loading && rooms.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 border border-line px-6 py-14 text-center text-ink-dim">
        <DoorClosed size={28} aria-hidden="true" />
        <p className="font-semibold text-ink">No rooms match these filters</p>
        <p className="max-w-[44ch] text-[0.88rem] text-ink-muted">
          Try a different room number or status, or clear the filters to see the whole inventory.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-line" aria-busy={loading}>
      <table className="w-full min-w-[760px] border-collapse text-sm">
        <thead>
          <tr>
            {HEADINGS.map((heading) => (
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
          {rooms.map((room) => (
            <RoomRow key={room.id} room={room} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RoomTable;
