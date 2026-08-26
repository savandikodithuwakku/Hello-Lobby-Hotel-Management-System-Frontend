import { Link } from "react-router-dom";
import { BedDouble } from "lucide-react";
import type { RoomType } from "../../../shared/api/types.ts";
import { link } from "../../../shared/ui/styles.ts";
import { formatOccupancy, formatPrice } from "../constants/rooms.ts";
import { InactiveFlag } from "./RoomTable.tsx";

const CELL = "border-b border-line px-4 py-3 text-left align-middle";
const MUTED_CELL = `${CELL} text-ink-muted`;

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

const RoomTypeTable = ({ roomTypes, loading }: { roomTypes: RoomType[]; loading: boolean }) => {
  if (!loading && roomTypes.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 border border-line px-6 py-14 text-center text-ink-dim">
        <BedDouble size={28} aria-hidden="true" />
        <p className="font-semibold text-ink">No room types yet</p>
        <p className="max-w-[46ch] text-[0.88rem] text-ink-muted">
          Room types hold the price, occupancy and facilities that every room of that kind inherits.
          Add one before creating rooms.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-line" aria-busy={loading}>
      <table className="w-full min-w-[720px] border-collapse text-sm">
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
          {roomTypes.map((roomType) => (
            <RoomTypeRow key={roomType.id} roomType={roomType} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RoomTypeTable;
