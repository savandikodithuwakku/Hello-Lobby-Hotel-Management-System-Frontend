import { Link } from "react-router-dom";
import { AlertTriangle, BedDouble, LifeBuoy, Plus } from "lucide-react";
import AppShell from "../../../shared/components/AppShell.tsx";
import FilterPanel from "../../../shared/components/form/FilterPanel.tsx";
import SearchField from "../../../shared/components/form/SearchField.tsx";
import SelectField from "../../../shared/components/form/SelectField.tsx";
import Pagination from "../../../shared/components/Pagination.tsx";
import useApiData from "../../../shared/hooks/useApiData.ts";
import useUrlFilters from "../../../shared/hooks/useUrlFilters.ts";
import { buttonPrimary, link } from "../../../shared/ui/styles.ts";
import { formatResultCount } from "../../../shared/ui/format.ts";
import AlertMessage from "../../auth/components/AlertMessage.tsx";
import RequirePermission from "../../auth/components/RequirePermission.tsx";
import { PERMISSIONS } from "../../auth/constants/rbac.ts";
import { useAuthUser } from "../../auth/hooks/useAuth.ts";
import ticketsApi from "../services/tickets.api.ts";
import {
  DEFAULT_TICKET_SORT,
  PAGE_SIZE,
  TICKET_CATEGORY_LABELS,
  TICKET_CATEGORY_OPTIONS,
  TICKET_PRIORITY_OPTIONS,
  TICKET_SORT_OPTIONS,
  TICKET_STATUS_OPTIONS,
  formatSince,
} from "../constants/frontdesk.ts";
import { TicketPriorityPill, TicketStatusPill } from "../components/TicketPills.tsx";

interface TicketFilterState {
  search: string;
  status: string;
  category: string;
  priority: string;
  active: string;
  overdue: string;
  sort: string;
  page: number;
}

const readFilters = (params: URLSearchParams): TicketFilterState => ({
  search: params.get("search") || "",
  status: params.get("status") || "",
  category: params.get("category") || "",
  priority: params.get("priority") || "",
  active: params.get("active") || "",
  overdue: params.get("overdue") || "",
  sort: params.get("sort") || DEFAULT_TICKET_SORT,
  page: Number(params.get("page")) || 1,
});

const Tile = ({
  label,
  count,
  active,
  onClick,
  tone = "plain",
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  tone?: "plain" | "warn";
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`cursor-pointer border px-5 py-4 text-left transition-colors duration-300 ${
      active ? "border-brand bg-brand/5" : "border-line bg-surface hover:bg-surface-hover"
    }`}
  >
    <span
      className={`block font-display text-2xl font-bold tabular-nums ${
        tone === "warn" && count > 0 ? "text-red-700" : "text-ink"
      }`}
    >
      {count}
    </span>
    <span className="mt-1 block text-[0.82rem] tracking-wider text-ink-muted uppercase">
      {label}
    </span>
  </button>
);

const CELL = "px-4 py-3.5 align-middle text-[0.92rem]";
const MUTED_CELL = `${CELL} text-ink-muted`;

/**
 * Guest service tickets.
 *
 * Oldest first by default, because the ticket that has been waiting longest is
 * the one somebody should pick up - a list sorted newest-first quietly buries
 * exactly the tickets that need attention most.
 */
const TicketsListPage = () => {
  const { hasPermission } = useAuthUser();
  const canManage = hasPermission(PERMISSIONS.FRONTDESK_TICKET_MANAGE);

  const { filters, updateFilters, resetFilters } = useUrlFilters(readFilters);
  const { search, status, category, priority, active, overdue, sort, page } = filters;

  const { data, loading, error } = useApiData(
    () =>
      ticketsApi
        .list({ search, status, category, priority, active, overdue, sort, page, limit: PAGE_SIZE })
        .then((response) => response.data),
    [search, status, category, priority, active, overdue, sort, page]
  );

  const { data: statistics } = useApiData(
    () => (canManage ? ticketsApi.statistics().then((response) => response.data) : Promise.resolve(null)),
    [canManage]
  );

  const tickets = data?.tickets ?? [];

  return (
    <AppShell
      title="Service tickets"
      actions={
        <RequirePermission
          permissions={[PERMISSIONS.FRONTDESK_TICKET_MANAGE, PERMISSIONS.FRONTDESK_TICKET_CREATE]}
        >
          <Link to="/tickets/new" className={buttonPrimary}>
            <Plus size={16} aria-hidden="true" /> Raise a ticket
          </Link>
        </RequirePermission>
      }
    >
      <AlertMessage message={error?.message} errors={error?.errors} />

      {statistics && (
        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Ticket counts">
          <Tile
            label="Open work"
            count={statistics.active}
            active={active === "true"}
            onClick={() => updateFilters({ active: active === "true" ? "" : "true", overdue: "" })}
          />
          <Tile
            label="Overdue"
            count={statistics.overdue}
            tone="warn"
            active={overdue === "true"}
            onClick={() => updateFilters({ overdue: overdue === "true" ? "" : "true", active: "" })}
          />
          <Tile
            label="Unassigned"
            count={statistics.unassigned}
            active={false}
            onClick={() => updateFilters({ status: "", active: "true" })}
          />
          <Tile
            label="Urgent"
            count={statistics.byPriority.urgent}
            tone="warn"
            active={priority === "urgent"}
            onClick={() => updateFilters({ priority: priority === "urgent" ? "" : "urgent" })}
          />
        </section>
      )}

      <FilterPanel
        label="Filter tickets"
        gridClassName="grid gap-4 md:grid-cols-2 lg:grid-cols-5"
        resultSummary={formatResultCount(data?.pagination.total ?? null, "ticket")}
        onReset={resetFilters}
        hasFilters={Boolean(search || status || category || priority || active || overdue)}
      >
        <SearchField
          label="Search"
          placeholder="Reference or subject"
          value={search}
          onChange={(value) => updateFilters({ search: value })}
        />
        <SelectField
          label="Status"
          placeholder="Any status"
          options={TICKET_STATUS_OPTIONS}
          value={status}
          onChange={(value) => updateFilters({ status: value })}
        />
        <SelectField
          label="Category"
          placeholder="Any category"
          options={TICKET_CATEGORY_OPTIONS}
          value={category}
          onChange={(value) => updateFilters({ category: value })}
        />
        <SelectField
          label="Priority"
          placeholder="Any priority"
          options={TICKET_PRIORITY_OPTIONS}
          value={priority}
          onChange={(value) => updateFilters({ priority: value })}
        />
        <SelectField
          label="Sort"
          options={TICKET_SORT_OPTIONS}
          value={sort}
          onChange={(value) => updateFilters({ sort: value })}
        />
      </FilterPanel>

      {!loading && tickets.length === 0 ? (
        <div className="flex flex-col items-center gap-2 border border-line px-6 py-14 text-center text-ink-dim">
          <LifeBuoy size={28} aria-hidden="true" />
          <p className="font-semibold text-ink">No tickets match these filters</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-line bg-surface">
          <table className="w-full min-w-[54rem] border-collapse">
            <thead>
              <tr className="border-b border-line text-left">
                {["Ticket", "Subject", "Room", "Priority", "Status", "Waiting", "Assigned"].map(
                  (heading) => (
                    <th
                      key={heading}
                      className="px-4 py-3 text-[0.78rem] font-semibold tracking-wider text-ink-muted uppercase"
                    >
                      {heading}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="border-b border-line last:border-b-0">
                  <td className={CELL}>
                    <Link to={`/tickets/${ticket.id}`} className={link}>
                      {ticket.reference}
                    </Link>
                  </td>
                  <td className={CELL}>
                    {ticket.subject}
                    <span className="ml-2 text-[0.78rem] text-ink-dim">
                      {TICKET_CATEGORY_LABELS[ticket.category]}
                    </span>
                  </td>
                  <td className={MUTED_CELL}>
                    {ticket.room.roomNumber ? (
                      <span className="inline-flex items-center gap-1.5">
                        <BedDouble size={14} aria-hidden="true" /> {ticket.room.roomNumber}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className={CELL}>
                    <TicketPriorityPill priority={ticket.priority} />
                  </td>
                  <td className={CELL}>
                    <TicketStatusPill status={ticket.status} />
                  </td>
                  <td className={`${CELL} whitespace-nowrap tabular-nums`}>
                    {ticket.isOverdue ? (
                      <span className="inline-flex items-center gap-1.5 text-red-700">
                        <AlertTriangle size={14} aria-hidden="true" />
                        {formatSince(ticket.createdAt)}
                      </span>
                    ) : (
                      <span className="text-ink-muted">{formatSince(ticket.createdAt)}</span>
                    )}
                  </td>
                  <td className={MUTED_CELL}>{ticket.assignedTo?.name ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination
        pagination={data?.pagination ?? null}
        onPageChange={(next) => updateFilters({ page: String(next) })}
        disabled={loading}
      />
    </AppShell>
  );
};

export default TicketsListPage;
