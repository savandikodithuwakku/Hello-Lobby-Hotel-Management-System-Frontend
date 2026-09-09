import { useEffect, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { DoorClosed, Plus } from "lucide-react";
import AppShell from "../../../shared/components/AppShell.tsx";
import Pagination from "../../../shared/components/Pagination.tsx";
import { PAGE_SIZE, type RouteState } from "../../../shared/types.ts";
import { buttonPrimary, buttonSecondary, card } from "../../../shared/ui/styles.ts";
import AlertMessage from "../../../shared/components/AlertMessage.tsx";
import RequirePermission from "../../auth/components/RequirePermission.tsx";
import { PERMISSIONS } from "../../auth/context/authContext.ts";
import type { ApiClientError } from "../../../shared/api/httpClient.ts";
import { roomTypesApi, type RoomTypeListResult } from "../services/rooms.api.ts";
import {
  DEFAULT_ROOM_TYPE_SORT,
  type RoomTypeFilterPatch,
  type RoomTypeFilterState,
} from "../types.ts";
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
  const notice = (location.state as RouteState | null)?.message || null;

  const [searchParams, setSearchParams] = useSearchParams();
  const filters = readFilters(searchParams);

  const updateFilters = (patch: RoomTypeFilterPatch) => {
    const next = new URLSearchParams(searchParams);

    Object.entries(patch).forEach(([key, value]) => {
      // An empty value means "no filter", so the key leaves the URL entirely
      // instead of sitting there as `?status=`.
      if (value) next.set(key, value);
      else next.delete(key);
    });

    // Narrowing the list while on page 5 would usually show nothing, so any
    // change other than the page itself goes back to page one.
    if (!("page" in patch)) next.delete("page");

    setSearchParams(next, { replace: true });
  };

  const { search, isActive, occupancy, sort, page } = filters;

  const [data, setData] = useState<RoomTypeListResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiClientError | null>(null);

  useEffect(() => {
    // A slow first request must not overwrite the answer to a faster later one.
    let cancelled = false;
    setLoading(true);

    roomTypesApi
      .list({ search, isActive, occupancy, sort, page, limit: PAGE_SIZE })
      .then((response) => {
        if (cancelled) return;
        setData(response.data);
        setError(null);
      })
      .catch((apiError: ApiClientError) => {
        if (cancelled) return;
        setError(apiError);
        setData(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [search, isActive, occupancy, sort, page]);

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
          onReset={() => setSearchParams({}, { replace: true })}
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
