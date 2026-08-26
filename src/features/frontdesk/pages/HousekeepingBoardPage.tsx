import { Link } from "react-router-dom";
import { AlertTriangle, ArrowLeft, Sparkles } from "lucide-react";
import type { HousekeepingStatus } from "../../../shared/api/types.ts";
import AppShell from "../../../shared/components/AppShell.tsx";
import useApiData from "../../../shared/hooks/useApiData.ts";
import useAsyncAction from "../../../shared/hooks/useAsyncAction.ts";
import {
  buttonSecondary,
  cardTitle,
  link,
  statusPillBase,
} from "../../../shared/ui/styles.ts";
import { formatDateTime } from "../../../shared/ui/format.ts";
import AlertMessage from "../../auth/components/AlertMessage.tsx";
import AuthLoadingScreen from "../../auth/components/AuthLoadingScreen.tsx";
import RequirePermission from "../../auth/components/RequirePermission.tsx";
import { PERMISSIONS } from "../../auth/constants/rbac.ts";
import { roomsApi } from "../../rooms/services/rooms.api.ts";
import {
  HOUSEKEEPING_LABELS,
  OCCUPANCY_LABELS,
  housekeepingPill,
  occupancyPill,
} from "../../rooms/constants/rooms.ts";
import frontdeskApi, { type HousekeepingRoom } from "../services/frontdesk.api.ts";

/**
 * The order the board reads in.
 *
 * Not the enum's order: this is the round a housekeeper actually works. What
 * needs doing comes first, what is finished comes last, and rooms nobody can
 * sell sit at the bottom where they are not mistaken for work in progress.
 */
const COLUMN_ORDER: HousekeepingStatus[] = [
  "dirty",
  "cleaning",
  "clean",
  "inspected",
  "out_of_order",
];

/** The move a housekeeper would make next from each state. */
const NEXT_STEP: Partial<Record<HousekeepingStatus, { to: HousekeepingStatus; label: string }>> = {
  dirty: { to: "cleaning", label: "Start cleaning" },
  cleaning: { to: "clean", label: "Mark clean" },
  clean: { to: "inspected", label: "Mark inspected" },
};

const RoomCard = ({
  room,
  busy,
  onAdvance,
}: {
  room: HousekeepingRoom;
  busy: boolean;
  onAdvance: (roomId: string, to: HousekeepingStatus) => void;
}) => {
  const next = NEXT_STEP[room.housekeeping];

  return (
    <li className="border border-line bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link to={`/rooms/${room.id}`} className={`${link} font-display text-base`}>
            {room.roomNumber}
          </Link>
          <p className="mt-0.5 text-[0.8rem] text-ink-dim">{room.roomType ?? "—"}</p>
        </div>
        <span className={`${statusPillBase} ${occupancyPill[room.occupancy]}`}>
          {OCCUPANCY_LABELS[room.occupancy]}
        </span>
      </div>

      {room.discrepant && (
        <p className="mt-3 flex items-start gap-1.5 text-[0.78rem] text-red-700">
          <AlertTriangle size={13} aria-hidden="true" className="mt-0.5 shrink-0" />
          Empty but not sellable
        </p>
      )}

      {room.housekeepingNote && (
        <p className="mt-2 text-[0.8rem] text-ink-muted">{room.housekeepingNote}</p>
      )}

      <p className="mt-2 text-[0.75rem] text-ink-dim">
        Since {formatDateTime(room.housekeepingChangedAt)}
      </p>

      {next && (
        <RequirePermission permissions={[PERMISSIONS.ROOM_MANAGE_STATUS]}>
          <button
            type="button"
            className={`${buttonSecondary} mt-3 w-full`}
            disabled={busy}
            onClick={() => onAdvance(room.id, next.to)}
          >
            {next.label}
          </button>
        </RequirePermission>
      )}
    </li>
  );
};

/**
 * Every room, grouped by what needs doing to it.
 *
 * The number that matters is at the top: rooms standing empty that cannot be
 * sold. Each of those is a room the hotel could be selling tonight and is not,
 * and it is only visible at all because occupancy and housekeeping are kept as
 * two separate facts about a room rather than one.
 */
const HousekeepingBoardPage = () => {
  const { data, loading, error: loadError, reload } = useApiData(
    () => frontdeskApi.housekeeping().then((response) => response.data),
    []
  );

  const { busy, error: actionError, notice, run } = useAsyncAction();
  const error = actionError ?? loadError;

  const advance = async (roomId: string, to: HousekeepingStatus) => {
    await run(() => roomsApi.changeHousekeeping(roomId, to));
    reload();
  };

  if (loading && !data) return <AuthLoadingScreen message="Loading housekeeping..." />;

  return (
    <AppShell
      title="Housekeeping"
      actions={
        <Link to="/front-desk" className={buttonSecondary}>
          <ArrowLeft size={16} aria-hidden="true" /> Front desk
        </Link>
      }
    >
      <AlertMessage message={error?.message} errors={error?.errors} />
      {notice && <AlertMessage variant="success" message={notice} />}

      {data && (
        <>
          {data.discrepant > 0 && (
            <p className="mb-6 flex items-start gap-2 border border-danger/30 bg-danger/5 px-4 py-3 text-[0.9rem] text-red-700">
              <AlertTriangle size={17} aria-hidden="true" className="mt-0.5 shrink-0" />
              <span>
                <strong>{data.discrepant}</strong> room{data.discrepant === 1 ? " is" : "s are"}{" "}
                standing empty but cannot be sold. Servicing them puts them back on sale tonight.
              </span>
            </p>
          )}

          <h2 className={cardTitle}>
            <Sparkles size={20} aria-hidden="true" /> {data.total} rooms
          </h2>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {COLUMN_ORDER.map((status) => {
              const rooms = data.byHousekeeping[status] ?? [];

              return (
                <section key={status}>
                  <header className="mb-3 flex items-center justify-between gap-3">
                    <span className={`${statusPillBase} ${housekeepingPill[status]}`}>
                      {HOUSEKEEPING_LABELS[status]}
                    </span>
                    <span className="text-[0.85rem] tabular-nums text-ink-muted">
                      {data.counts[status] ?? 0}
                    </span>
                  </header>

                  {rooms.length === 0 ? (
                    <p className="border border-dashed border-line px-4 py-6 text-center text-[0.85rem] text-ink-dim">
                      Nothing here
                    </p>
                  ) : (
                    <ul className="flex flex-col gap-3">
                      {rooms.map((room) => (
                        <RoomCard key={room.id} room={room} busy={busy} onAdvance={advance} />
                      ))}
                    </ul>
                  )}
                </section>
              );
            })}
          </div>
        </>
      )}
    </AppShell>
  );
};

export default HousekeepingBoardPage;
