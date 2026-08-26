import { Link } from "react-router-dom";
import { BedDouble, DoorOpen, LogOut, Sparkles, Users } from "lucide-react";
import AppShell from "../../../shared/components/AppShell.tsx";
import useApiData from "../../../shared/hooks/useApiData.ts";
import useAsyncAction from "../../../shared/hooks/useAsyncAction.ts";
import { card, cardTitle, buttonSecondary, link } from "../../../shared/ui/styles.ts";
import { formatDateOnly } from "../../../shared/ui/format.ts";
import AlertMessage from "../../auth/components/AlertMessage.tsx";
import AuthLoadingScreen from "../../auth/components/AuthLoadingScreen.tsx";
import { PERMISSIONS } from "../../auth/constants/rbac.ts";
import { useAuthUser } from "../../auth/hooks/useAuth.ts";
import frontdeskApi from "../services/frontdesk.api.ts";
import ArrivalCard from "../components/ArrivalCard.tsx";
import DepartureCard from "../components/DepartureCard.tsx";

const Tile = ({
  label,
  count,
  tone = "plain",
}: {
  label: string;
  count: number;
  tone?: "plain" | "warn";
}) => (
  <div className="border border-line bg-surface px-5 py-4">
    <p
      className={`font-display text-2xl font-bold tabular-nums ${
        tone === "warn" && count > 0 ? "text-red-700" : "text-ink"
      }`}
    >
      {count}
    </p>
    <p className="mt-1 text-[0.82rem] tracking-wider text-ink-muted uppercase">{label}</p>
  </div>
);

const EmptyRow = ({ message }: { message: string }) => (
  <p className="border border-dashed border-line px-5 py-10 text-center text-[0.9rem] text-ink-dim">
    {message}
  </p>
);

/**
 * Today, at the desk.
 *
 * Arrivals and departures arrive from the API already checked and already
 * ordered so that anything blocked sits at the top - the desk should see what
 * needs sorting out before it sees what is fine.
 */
const FrontDeskBoardPage = () => {
  const { hasPermission } = useAuthUser();

  const { data, loading, error: loadError, reload } = useApiData(
    () => frontdeskApi.board().then((response) => response.data),
    []
  );

  const { busy, error: actionError, notice, run } = useAsyncAction();
  const error = actionError ?? loadError;

  const checkIn = async (reservationId: string, overrideReason?: string) => {
    await run(() => frontdeskApi.checkIn(reservationId, { overrideReason }));
    reload();
  };

  const checkOut = async (reservationId: string) => {
    await run(() => frontdeskApi.checkOut(reservationId));
    reload();
  };

  if (loading && !data) return <AuthLoadingScreen message="Loading the front desk..." />;

  const counts = data?.counts;

  return (
    <AppShell
      title="Front desk"
      actions={
        hasPermission(PERMISSIONS.ROOM_MANAGE_STATUS) ? (
          <Link to="/front-desk/housekeeping" className={buttonSecondary}>
            <Sparkles size={16} aria-hidden="true" /> Housekeeping
          </Link>
        ) : null
      }
    >
      <AlertMessage message={error?.message} errors={error?.errors} />
      {notice && <AlertMessage variant="success" message={notice} />}

      {data && (
        <>
          <p className="mb-5 text-[0.9rem] text-ink-muted">{formatDateOnly(data.date)}</p>

          <section
            className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
            aria-label="Today at a glance"
          >
            <Tile label="Arrivals" count={counts?.arrivals ?? 0} />
            <Tile label="Arrivals blocked" count={counts?.arrivalsBlocked ?? 0} tone="warn" />
            <Tile label="Departures" count={counts?.departures ?? 0} />
            <Tile label="In house" count={counts?.inHouse ?? 0} />
          </section>

          <div className="grid gap-8 lg:grid-cols-2">
            <section>
              <h2 className={cardTitle}>
                <DoorOpen size={20} aria-hidden="true" /> Arriving today
              </h2>

              <div className="flex flex-col gap-4">
                {data.arrivals.length === 0 ? (
                  <EmptyRow message="Nobody is due to arrive today." />
                ) : (
                  data.arrivals.map((row) => (
                    <ArrivalCard
                      key={row.reservation.id}
                      row={row}
                      busy={busy}
                      canOverride={hasPermission(PERMISSIONS.FRONTDESK_OVERRIDE_PAYMENT)}
                      onCheckIn={checkIn}
                    />
                  ))
                )}
              </div>
            </section>

            <section>
              <h2 className={cardTitle}>
                <LogOut size={20} aria-hidden="true" /> Leaving today
              </h2>

              <div className="flex flex-col gap-4">
                {data.departures.length === 0 ? (
                  <EmptyRow message="Nobody is due to leave today." />
                ) : (
                  data.departures.map((row) => (
                    <DepartureCard
                      key={row.reservation.id}
                      row={row}
                      busy={busy}
                      onCheckOut={checkOut}
                    />
                  ))
                )}
              </div>
            </section>
          </div>

          <section className={`${card} mt-8`}>
            <h2 className={cardTitle}>
              <Users size={20} aria-hidden="true" /> In house
            </h2>

            {data.inHouse.length === 0 ? (
              <p className="text-[0.9rem] text-ink-dim">Nobody is staying tonight.</p>
            ) : (
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {data.inHouse.map((reservation) => (
                  <li
                    key={reservation.id}
                    className="flex items-center justify-between gap-3 border border-line px-4 py-3"
                  >
                    <span className="flex items-center gap-2 text-[0.9rem]">
                      <BedDouble size={15} aria-hidden="true" className="text-ink-dim" />
                      <strong>{reservation.room.roomNumber ?? "—"}</strong>
                      <span className="text-ink-muted">{reservation.customer.name}</span>
                    </span>
                    <Link to={`/reservations/${reservation.id}`} className={`${link} text-[0.85rem]`}>
                      Open
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </AppShell>
  );
};

export default FrontDeskBoardPage;
