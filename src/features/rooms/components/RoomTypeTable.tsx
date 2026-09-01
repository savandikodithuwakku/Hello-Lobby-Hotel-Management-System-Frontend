import { Link } from "react-router-dom";
import { BedDouble } from "lucide-react";
import type { RoomType } from "../../../shared/api/types.ts";
import DataTable, { CELL, MUTED_CELL } from "../../../shared/components/DataTable.tsx";
import { link } from "../../../shared/ui/styles.ts";
import { formatOccupancy, formatPrice } from "../constants/rooms.ts";
import { InactiveFlag } from "./RoomTable.tsx";

const RoomTypeRow = ({ roomType }: { roomType: RoomType }) => (
  <tr className="[&:last-child>td]:border-b-0 hover:bg-surface-hover">
    <td className={CELL}>
      <div className="flex items-center gap-3">
        {roomType.primaryImage ? (
          <img
            src={roomType.primaryImage}
            alt=""
            className="size-10 shrink-0 object-cover"
            loading="lazy"
          />
        ) : (
          <span className="flex size-10 shrink-0 items-center justify-center border border-line text-ink-dim">
            <BedDouble size={18} aria-hidden="true" />
          </span>
        )}
        <span>
          <Link to={`/room-types/${roomType.id}`} className={link}>
            {roomType.name}
          </Link>
          {!roomType.isActive && <InactiveFlag />}
        </span>
      </div>
    </td>
    <td className={`${CELL} whitespace-nowrap tabular-nums`}>{formatPrice(roomType.basePrice)}</td>
    <td className={`${MUTED_CELL} whitespace-nowrap`}>{formatOccupancy(roomType.maxOccupancy)}</td>
    <td className={`${MUTED_CELL} tabular-nums`}>{roomType.roomCount ?? 0}</td>
    <td className={MUTED_CELL}>
      {roomType.facilities.length === 0 ? "—" : roomType.facilities.slice(0, 3).join(", ")}
      {roomType.facilities.length > 3 && (
        <span className="text-ink-dim"> +{roomType.facilities.length - 3}</span>
      )}
    </td>
  </tr>
);

const HEADINGS = ["Room type", "Base price", "Sleeps", "Rooms", "Facilities"];

const RoomTypeTable = ({ roomTypes, loading }: { roomTypes: RoomType[]; loading: boolean }) => (
  <DataTable
    headings={HEADINGS}
    minWidthClass="min-w-[720px]"
    loading={loading}
    isEmpty={roomTypes.length === 0}
    empty={{
      icon: BedDouble,
      title: "No room types yet",
      hint: "Room types hold the price, occupancy and facilities that every room of that kind inherits. Add one before creating rooms.",
    }}
  >
    {roomTypes.map((roomType) => (
      <RoomTypeRow key={roomType.id} roomType={roomType} />
    ))}
  </DataTable>
);

export default RoomTypeTable;
