import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { CalendarPlus } from "lucide-react";
import { ApiClientError } from "../../../shared/api/httpClient.ts";
import type {
  Pagination as PaginationData,
  Reservation,
  ReservationStatistics,
  RoomType,
} from "../../../shared/api/types.ts";
import AppShell from "../../../shared/components/AppShell.tsx";
import Pagination from "../../../shared/components/Pagination.tsx";
import { buttonPrimary, card } from "../../../shared/ui/styles.ts";
import { formatPrice } from "../../../shared/ui/format.ts";
import AlertMessage from "../../auth/components/AlertMessage.tsx";
import RequirePermission from "../../auth/components/RequirePermission.tsx";
import { PERMISSIONS } from "../../auth/constants/rbac.ts";
import { useAuth } from "../../auth/hooks/useAuth.ts";
import type { RouteState } from "../../auth/types.ts";
import { roomTypesApi } from "../../rooms/services/rooms.api.ts";
import reservationsApi from "../services/reservations.api.ts";
import { DEFAULT_SORT, PAGE_SIZE } from "../constants/reservations.ts";
import type { ReservationFilterPatch, ReservationFilterState } from "../types.ts";
import ReservationFilters from "../components/ReservationFilters.tsx";
import ReservationTable from "../components/ReservationTable.tsx";

const readFilters = (params: URLSearchParams): ReservationFilterState => ({
  search: params.get("search") || "",
  status: params.get("status") || "",
  roomType: params.get("roomType") || "",
  from: params.get("from") || "",
  to: params.get("to") || "",
  unpaid: params.get("unpaid") || "",
  sort: params.get("sort") || DEFAULT_SORT,
  page: Number(params.get("page")) || 1,
});

const Tile = ({ label, value, hint }: { label: string; value: string; hint?: string }) => (
  <div className="flex flex-col gap-1 border border-line bg-surface px-4 py-3">
    <span className="font-display text-2xl font-bold tabular-nums">{value}</span>
    <span className="text-[0.78rem] tracking-[0.04em] text-ink-muted uppercase">{label}</span>
    {hint && <span className="text-[0.75rem] text-ink-dim">{hint}</span>}
  </div>
);

/**
 * One list for everybody.
 *
 * A guest holding only `reservation:read_own` gets the same screen; the API
 * narrows the results to their own bookings, so there is no second "my
 * bookings" page to keep in step.
 */
const ReservationsListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const filters = readFilters(searchParams);
  const notice = (location.state as RouteState | null)?.message || null;
  const { hasPermission } = useAuth();

  const isStaff = hasPermission(PERMISSIONS.RESERVATION_READ);

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [statistics, setStatistics] = useState<ReservationStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiClientError | null>(null);

  const { search, status, roomType, from, to, unpaid, sort, page } = filters;

  useEffect(() => {
    if (!isStaff) return;

    roomTypesApi
      .list({ limit: 100, sort: "name" })
      .then((response) => setRoomTypes(response.data.roomTypes))
      .catch(() => setRoomTypes([]));

    reservationsApi
      .statistics()
      .then((response) => setStatistics(response.data))
      .catch(() => setStatistics(null));
  }, [isStaff]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    reservationsApi
      .list({ search, status, roomType, from, to, unpaid, sort, page, limit: PAGE_SIZE })
      .then((response) => {
        if (cancelled) return;
        setReservations(response.data.reservations);
        setPagination(response.data.pagination);
        setError(null);
      })
      .catch((apiError: ApiClientError) => {
        if (cancelled) return;
        setError(apiError);
        setReservations([]);
        setPagination(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [search, status, roomType, from, to, unpaid, sort, page]);

  const updateFilters = useCallback(
    (patch: ReservationFilterPatch) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current);
          Object.entries(patch).forEach(([key, value]) => {
            if (value) next.set(key, value);
            else next.delete(key);
          });
          if (!("page" in patch)) next.delete("page");
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  return (
    <AppShell
      title={isStaff ? "Reservations" : "My bookings"}
      actions={
        <RequirePermission permissions={[PERMISSIONS.RESERVATION_CREATE]}>
          <Link to="/reservations/new" className={buttonPrimary}>
            <CalendarPlus size={16} aria-hidden="true" /> New booking
          </Link>
        </RequirePermission>
      }
    >
      {statistics && (
        <section
          className="mb-8 grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-4"
          aria-label="Today at a glance"
        >
          <Tile label="Arriving today" value={String(statistics.arrivalsToday)} />
          <Tile label="Departing today" value={String(statistics.departuresToday)} />
          <Tile label="In house" value={String(statistics.inHouse)} />
          <Tile label="Pending" value={String(statistics.byStatus.pending)} hint="awaiting advance" />
          <Tile
            label="Outstanding"
            value={formatPrice(statistics.outstanding.amount)}
            hint={`${statistics.outstanding.count} booking${statistics.outstanding.count === 1 ? "" : "s"}`}
          />
        </section>
      )}

      <div className={card}>
        <AlertMessage message={error?.message} errors={error?.errors} />
        {notice && <AlertMessage variant="success" message={notice} />}

        <ReservationFilters
          filters={filters}
          roomTypes={roomTypes}
          onChange={updateFilters}
          onReset={() => setSearchParams({}, { replace: true })}
          resultCount={loading ? null : (pagination?.total ?? 0)}
          compact={!isStaff}
        />

        <ReservationTable
          reservations={reservations}
          loading={loading}
          showGuest={isStaff}
          emptyHint={
            isStaff
              ? undefined
              : "You have no bookings matching these filters. Browse the rooms to make one."
          }
        />

        <Pagination
          pagination={pagination}
          disabled={loading}
          onPageChange={(nextPage) => updateFilters({ page: String(nextPage) })}
        />
      </div>
    </AppShell>
  );
};

export default ReservationsListPage;
