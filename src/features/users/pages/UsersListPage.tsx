import { useEffect, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { UserPlus } from "lucide-react";
import AppShell from "../../../shared/components/AppShell.tsx";
import Pagination from "../../../shared/components/Pagination.tsx";
import { PAGE_SIZE, type RouteState } from "../../../shared/types.ts";
import { buttonPrimary, card } from "../../../shared/ui/styles.ts";
import AlertMessage from "../../../shared/components/AlertMessage.tsx";
import RequirePermission from "../../auth/components/RequirePermission.tsx";
import { PERMISSIONS } from "../../auth/context/authContext.ts";
import type { ApiClientError } from "../../../shared/api/httpClient.ts";
import usersApi, { type UserListResult } from "../services/users.api.ts";
import type { UserFilterPatch, UserFilterState } from "../types.ts";
import UserFilters from "../components/UserFilters.tsx";
import UserTable from "../components/UserTable.tsx";

const DEFAULT_SORT = "-createdAt";

/**
 * Filters live in the URL rather than in component state, so a filtered list
 * can be bookmarked, shared, and survives the back button.
 */
const readFilters = (params: URLSearchParams): UserFilterState => ({
  search: params.get("search") || "",
  role: params.get("role") || "",
  status: params.get("status") || "",
  sort: params.get("sort") || DEFAULT_SORT,
  page: Number(params.get("page")) || 1,
});

const UsersListPage = () => {
  const location = useLocation();
  const notice = (location.state as RouteState | null)?.message || null;

  const [searchParams, setSearchParams] = useSearchParams();
  const filters = readFilters(searchParams);
  const { search, role, status, sort, page } = filters;

  const updateFilters = (patch: UserFilterPatch) => {
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

  const [data, setData] = useState<UserListResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiClientError | null>(null);

  useEffect(() => {
    // If the filters change while a request is still in flight, the answer to
    // the old request must not be written into state - otherwise a fast second
    // search can be overwritten by a slow first one.
    let cancelled = false;
    setLoading(true);

    usersApi
      .list({ search, role, status, sort, page, limit: PAGE_SIZE })
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
  }, [search, role, status, sort, page]);

  return (
    <AppShell
      title="Users"
      actions={
        <RequirePermission permissions={[PERMISSIONS.USER_CREATE]}>
          <Link to="/users/new" className={buttonPrimary}>
            <UserPlus size={16} aria-hidden="true" /> Add user
          </Link>
        </RequirePermission>
      }
    >
      <div className={card}>
        <AlertMessage message={error?.message} errors={error?.errors} />
        {notice && <AlertMessage variant="success" message={notice} />}

        <UserFilters
          filters={filters}
          onChange={updateFilters}
          onReset={() => setSearchParams({}, { replace: true })}
          resultCount={loading ? null : (data?.pagination.total ?? 0)}
        />

        <UserTable users={data?.users ?? []} loading={loading} />

        <Pagination
          pagination={data?.pagination ?? null}
          disabled={loading}
          onPageChange={(nextPage) => updateFilters({ page: String(nextPage) })}
        />
      </div>
    </AppShell>
  );
};

export default UsersListPage;
