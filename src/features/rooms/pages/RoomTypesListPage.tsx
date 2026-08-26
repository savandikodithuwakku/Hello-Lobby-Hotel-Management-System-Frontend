import { Link, useLocation } from "react-router-dom";
import { DoorClosed, Plus } from "lucide-react";
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
import { roomTypesApi } from "../services/rooms.api.ts";
import { DEFAULT_ROOM_TYPE_SORT } from "../constants/rooms.ts";
import type { RoomTypeFilterState } from "../types.ts";
import RoomTypeFilters from "../components/RoomTypeFilters.tsx";
import RoomTypeTable from "../components/RoomTypeTable.tsx";

const readFilters = (params: URLSearchParams): RoomTypeFilterState => ({
  search: params.get("search") || "",
  isActive: params.get("isActive") || "",
  occupancy: params.get("occupancy") || "",
  sort: params.get("sort") || DEFAULT_ROOM_TYPE_SORT,
  page: Number(params.get("page")) || 1,
});

const RoomTypesListPage = () => {
  const location = useLocation();
  const { filters, updateFilters, resetFilters } = useUrlFilters(readFilters);
  const notice = (location.state as RouteState | null)?.message || null;

  const { search, isActive, occupancy, sort, page } = filters;

  const { data, loading, error } = useApiData(
    () =>
      roomTypesApi
        .list({ search, isActive, occupancy, sort, page, limit: PAGE_SIZE })
        .then((r) => r.data),
    [search, isActive, occupancy, sort, page]
  );

  return (
    <AppShell
      title="Room types"
      actions={
        <>
          <Link to="/rooms" className={buttonSecondary}>
            <DoorClosed size={16} aria-hidden="true" /> Rooms
          </Link>
          <RequirePermission permissions={[PERMISSIONS.ROOM_TYPE_CREATE]}>
            <Link to="/room-types/new" className={buttonPrimary}>
              <Plus size={16} aria-hidden="true" /> Add room type
            </Link>
          </RequirePermission>
        </>
      }
    >
      <div className={card}>
        <AlertMessage message={error?.message} errors={error?.errors} />
        {notice && <AlertMessage variant="success" message={notice} />}

        <p className="mb-6 text-sm text-ink-muted">
          A room type carries the price, occupancy, facilities and photos that every room of that
          kind inherits. Individual rooms can override the price.
        </p>

        <RoomTypeFilters
          filters={filters}
          onChange={updateFilters}
          onReset={resetFilters}
          resultCount={loading ? null : (data?.pagination.total ?? 0)}
        />

        <RoomTypeTable roomTypes={data?.roomTypes ?? []} loading={loading} />

        <Pagination
          pagination={data?.pagination ?? null}
          disabled={loading}
          onPageChange={(nextPage) => updateFilters({ page: String(nextPage) })}
        />
      </div>
    </AppShell>
  );
};

export default RoomTypesListPage;
