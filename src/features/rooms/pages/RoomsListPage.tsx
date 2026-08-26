import { Link, useLocation } from "react-router-dom";
import { BedDouble, Plus } from "lucide-react";
import AppShell from "../../../shared/components/AppShell.tsx";
import Pagination from "../../../shared/components/Pagination.tsx";
import { PAGE_SIZE } from "../../../shared/constants/pagination.ts";
import useApiData from "../../../shared/hooks/useApiData.ts";
import useUrlFilters from "../../../shared/hooks/useUrlFilters.ts";
import { buttonPrimary, buttonSecondary, card } from "../../../shared/ui/styles.ts";
import AlertMessage from "../../auth/components/AlertMessage.tsx";
import RequirePermission from "../../auth/components/RequirePermission.tsx";
import { PERMISSIONS } from "../../auth/constants/rbac.ts";
import type { RouteState } from "../../auth/types.ts";
import { roomTypesApi, roomsApi } from "../services/rooms.api.ts";
import { DEFAULT_ROOM_SORT, STATUS_LABELS } from "../constants/rooms.ts";
import type { RoomFilterState } from "../types.ts";
import RoomFilters from "../components/RoomFilters.tsx";
import RoomTable from "../components/RoomTable.tsx";

/**
 * Filters live in the URL rather than in component state, so a filtered view of
 * the inventory can be bookmarked, shared, and survives the back button.
 */
const readFilters = (params: URLSearchParams): RoomFilterState => ({
  search: params.get("search") || "",
  roomType: params.get("roomType") || "",
  status: params.get("status") || "",
  floor: params.get("floor") || "",
  isActive: params.get("isActive") || "",
  sort: params.get("sort") || DEFAULT_ROOM_SORT,
  page: Number(params.get("page")) || 1,
});

/** One clickable count on the status strip above the table. */
const StatusTile = ({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={`flex cursor-pointer flex-col gap-1 border px-4 py-3 text-left transition-colors duration-300 ${
      active
        ? "border-brand bg-surface-hover"
        : "border-line bg-surface hover:border-line-focus hover:bg-surface-hover"
    }`}
  >
    <span className="font-display text-2xl font-bold tabular-nums">{count}</span>
    <span className="text-[0.78rem] tracking-[0.04em] text-ink-muted uppercase">{label}</span>
  </button>
);

const RoomsListPage = () => {
  const location = useLocation();
  const { filters, updateFilters, resetFilters } = useUrlFilters(readFilters);
  const notice = (location.state as RouteState | null)?.message || null;

  const { search, roomType, status, floor, isActive, sort, page } = filters;

  // The type list frames the filter bar and never changes with the filters, so
  // it is fetched once.
  const { data: roomTypes } = useApiData(
    () => roomTypesApi.list({ limit: 100, sort: "name" }).then((r) => r.data.roomTypes),
    []
  );

  const { data, loading, error } = useApiData(
    () =>
      Promise.all([
        roomsApi.list({ search, roomType, status, floor, isActive, sort, page, limit: PAGE_SIZE }),
        roomsApi.statistics(),
      ]).then(([list, stats]) => ({ ...list.data, statistics: stats.data })),
    [search, roomType, status, floor, isActive, sort, page]
  );

  return (
    <AppShell
      title="Rooms"
      actions={
        <>
          <RequirePermission permissions={[PERMISSIONS.ROOM_READ]}>
            <Link to="/room-types" className={buttonSecondary}>
              <BedDouble size={16} aria-hidden="true" /> Room types
            </Link>
          </RequirePermission>
          <RequirePermission permissions={[PERMISSIONS.ROOM_CREATE]}>
            <Link to="/rooms/new" className={buttonPrimary}>
              <Plus size={16} aria-hidden="true" /> Add room
            </Link>
          </RequirePermission>
        </>
      }
    >
      {data?.statistics && (
        <section
          className="mb-8 grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-4"
          aria-label="Inventory at a glance"
        >
          <StatusTile
            label="All rooms"
            count={data.statistics.active}
            active={status === ""}
            onClick={() => updateFilters({ status: "" })}
          />
          {(Object.entries(data.statistics.byStatus) as [keyof typeof STATUS_LABELS, number][]).map(
            ([key, count]) => (
              <StatusTile
                key={key}
                label={STATUS_LABELS[key]}
                count={count}
                active={status === key}
                onClick={() => updateFilters({ status: status === key ? "" : key })}
              />
            )
          )}
        </section>
      )}

      <div className={card}>
        <AlertMessage message={error?.message} errors={error?.errors} />
        {notice && <AlertMessage variant="success" message={notice} />}

        <RoomFilters
          filters={filters}
          roomTypes={roomTypes ?? []}
          onChange={updateFilters}
          onReset={resetFilters}
          resultCount={loading ? null : (data?.pagination.total ?? 0)}
        />

        <RoomTable rooms={data?.rooms ?? []} loading={loading} />

        <Pagination
          pagination={data?.pagination ?? null}
          disabled={loading}
          onPageChange={(nextPage) => updateFilters({ page: String(nextPage) })}
        />
      </div>
    </AppShell>
  );
};

export default RoomsListPage;
