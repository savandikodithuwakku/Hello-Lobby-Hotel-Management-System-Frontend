import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { ApiClientError } from "../../../shared/api/httpClient.ts";
import type { Pagination as PaginationData, User } from "../../../shared/api/types.ts";
import AppShell from "../../../shared/components/AppShell.tsx";
import { buttonPrimary, card } from "../../../shared/ui/styles.ts";
import AlertMessage from "../../auth/components/AlertMessage.tsx";
import RequirePermission from "../../auth/components/RequirePermission.tsx";
import { PERMISSIONS } from "../../auth/constants/rbac.ts";
import type { RouteState } from "../../auth/types.ts";
import usersApi from "../services/users.api.ts";
import { PAGE_SIZE } from "../constants/users.ts";
import type { UserFilterPatch, UserFilterState } from "../types.ts";
import UserFilters from "../components/UserFilters.tsx";
import UserTable from "../components/UserTable.tsx";
import Pagination from "../../../shared/components/Pagination.tsx";

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
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const filters = readFilters(searchParams);
  const notice = (location.state as RouteState | null)?.message || null;

  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiClientError | null>(null);

  const { search, role, status, sort, page } = filters;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    usersApi
      .list({ search, role, status, sort, page, limit: PAGE_SIZE })
      .then((response) => {
        if (cancelled) return;
        setUsers(response.data.users);
        setPagination(response.data.pagination);
        setError(null);
      })
      .catch((apiError: ApiClientError) => {
        if (cancelled) return;
        setError(apiError);
        setUsers([]);
        setPagination(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [search, role, status, sort, page]);

  // Any filter change returns to page one; changing the page keeps the filters.
  const updateFilters = useCallback(
    (patch: UserFilterPatch) => {
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

  const resetFilters = useCallback(() => setSearchParams({}, { replace: true }), [setSearchParams]);

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
          onReset={resetFilters}
          resultCount={loading ? null : (pagination?.total ?? 0)}
        />

        <UserTable users={users} loading={loading} />

        <Pagination
          pagination={pagination}
          disabled={loading}
          onPageChange={(nextPage) => updateFilters({ page: String(nextPage) })}
        />
      </div>
    </AppShell>
  );
};

export default UsersListPage;
