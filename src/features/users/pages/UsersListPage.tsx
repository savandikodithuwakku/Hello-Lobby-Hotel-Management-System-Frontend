import { Link, useLocation } from "react-router-dom";
import { UserPlus } from "lucide-react";
import AppShell from "../../../shared/components/AppShell.tsx";
import Pagination from "../../../shared/components/Pagination.tsx";
import { PAGE_SIZE } from "../../../shared/constants/pagination.ts";
import useApiData from "../../../shared/hooks/useApiData.ts";
import useUrlFilters from "../../../shared/hooks/useUrlFilters.ts";
import { buttonPrimary, card } from "../../../shared/ui/styles.ts";
import AlertMessage from "../../auth/components/AlertMessage.tsx";
import RequirePermission from "../../auth/components/RequirePermission.tsx";
import { PERMISSIONS } from "../../auth/constants/rbac.ts";
import type { RouteState } from "../../auth/types.ts";
import usersApi from "../services/users.api.ts";
import type { UserFilterState } from "../types.ts";
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
  const { filters, updateFilters, resetFilters } = useUrlFilters(readFilters);
  const notice = (location.state as RouteState | null)?.message || null;

  const { search, role, status, sort, page } = filters;

  const { data, loading, error } = useApiData(
    () => usersApi.list({ search, role, status, sort, page, limit: PAGE_SIZE }).then((r) => r.data),
    [search, role, status, sort, page]
  );

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
