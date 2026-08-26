import { useCallback, useEffect, useId, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { DoorClosed, Plus, Search, X } from "lucide-react";
import { ApiClientError } from "../../../shared/api/httpClient.ts";
import type { Pagination as PaginationData, RoomType } from "../../../shared/api/types.ts";
import AppShell from "../../../shared/components/AppShell.tsx";
import Pagination from "../../../shared/components/Pagination.tsx";
import {
  buttonPrimary,
  buttonSecondary,
  buttonText,
  card,
  fieldLabel,
  inputWithIcon,
  select,
} from "../../../shared/ui/styles.ts";
import AlertMessage from "../../auth/components/AlertMessage.tsx";
import RequirePermission from "../../auth/components/RequirePermission.tsx";
import { PERMISSIONS } from "../../auth/constants/rbac.ts";
import type { RouteState } from "../../auth/types.ts";
import { roomTypesApi } from "../services/rooms.api.ts";
import {
  ACTIVE_OPTIONS,
  DEFAULT_ROOM_TYPE_SORT,
  PAGE_SIZE,
  ROOM_TYPE_SORT_OPTIONS,
} from "../constants/rooms.ts";
import type { RoomTypeFilterPatch, RoomTypeFilterState } from "../types.ts";
import RoomTypeTable from "../components/RoomTypeTable.tsx";

const readFilters = (params: URLSearchParams): RoomTypeFilterState => ({
  search: params.get("search") || "",
  isActive: params.get("isActive") || "",
  occupancy: params.get("occupancy") || "",
  sort: params.get("sort") || DEFAULT_ROOM_TYPE_SORT,
  page: Number(params.get("page")) || 1,
});

const RoomTypesListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const filters = readFilters(searchParams);
  const notice = (location.state as RouteState | null)?.message || null;

  const searchId = useId();
  const occupancyId = useId();
  const activeId = useId();
  const sortId = useId();

  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiClientError | null>(null);
  const [searchDraft, setSearchDraft] = useState(filters.search);

  const { search, isActive, occupancy, sort, page } = filters;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    roomTypesApi
      .list({ search, isActive, occupancy, sort, page, limit: PAGE_SIZE })
      .then((response) => {
        if (cancelled) return;
        setRoomTypes(response.data.roomTypes);
        setPagination(response.data.pagination);
        setError(null);
      })
      .catch((apiError: ApiClientError) => {
        if (cancelled) return;
        setError(apiError);
        setRoomTypes([]);
        setPagination(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [search, isActive, occupancy, sort, page]);

  const updateFilters = useCallback(
    (patch: RoomTypeFilterPatch) => {
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

  useEffect(() => {
    setSearchDraft(filters.search);
  }, [filters.search]);

  useEffect(() => {
    if (searchDraft === filters.search) return undefined;

    const timer = setTimeout(() => updateFilters({ search: searchDraft }), 350);
    return () => clearTimeout(timer);
  }, [searchDraft, filters.search, updateFilters]);

  const hasFilters = Boolean(filters.search || filters.isActive || filters.occupancy);

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

        <section className="mb-6" aria-label="Filter room types">
          <div className="grid grid-cols-1 gap-4 min-[900px]:grid-cols-[minmax(220px,2fr)_repeat(3,minmax(150px,1fr))]">
            <div>
              <label className={fieldLabel} htmlFor={searchId}>
                Search
              </label>
              <div className="relative flex items-center">
                <Search
                  className="pointer-events-none absolute left-4 text-ink-dim"
                  size={18}
                  aria-hidden="true"
                />
                <input
                  id={searchId}
                  type="search"
                  className={inputWithIcon}
                  placeholder="Name or description"
                  value={searchDraft}
                  onChange={(event) => setSearchDraft(event.target.value)}
                />
              </div>
            </div>

            <div>
              <label className={fieldLabel} htmlFor={occupancyId}>
                Sleeps at least
              </label>
              <input
                id={occupancyId}
                type="number"
                min={1}
                className={select}
                placeholder="Any"
                value={filters.occupancy}
                onChange={(event) => updateFilters({ occupancy: event.target.value })}
              />
            </div>

            <div>
              <label className={fieldLabel} htmlFor={activeId}>
                Catalogue
              </label>
              <select
                id={activeId}
                className={select}
                value={filters.isActive}
                onChange={(event) => updateFilters({ isActive: event.target.value })}
              >
                <option value="">Active and withdrawn</option>
                {ACTIVE_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {value === "false" ? "Withdrawn only" : label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={fieldLabel} htmlFor={sortId}>
                Sort
              </label>
              <select
                id={sortId}
                className={select}
                value={filters.sort}
                onChange={(event) => updateFilters({ sort: event.target.value })}
              >
                {ROOM_TYPE_SORT_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-4">
            <span className="text-[0.85rem] text-ink-muted">
              {loading
                ? "Loading..."
                : `${pagination?.total ?? 0} room type${pagination?.total === 1 ? "" : "s"} found`}
            </span>
            {hasFilters && (
              <button
                type="button"
                className={buttonText}
                onClick={() => setSearchParams({}, { replace: true })}
              >
                <X size={14} aria-hidden="true" /> Clear filters
              </button>
            )}
          </div>
        </section>

        <RoomTypeTable roomTypes={roomTypes} loading={loading} />

        <Pagination
          pagination={pagination}
          disabled={loading}
          onPageChange={(nextPage) => updateFilters({ page: String(nextPage) })}
        />
      </div>
    </AppShell>
  );
};

export default RoomTypesListPage;
