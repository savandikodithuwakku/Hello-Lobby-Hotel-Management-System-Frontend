import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AlertTriangle, BedDouble, LifeBuoy, Plus } from "lucide-react";
import { FilterPanel, SearchField, SelectField } from "../../../shared/components/fields.tsx";
import AppShell from "../../../shared/components/AppShell.tsx";
import DataTable, { CELL, MUTED_CELL } from "../../../shared/components/DataTable.tsx";
import Pagination from "../../../shared/components/Pagination.tsx";
import { buttonPrimary, link } from "../../../shared/ui/styles.ts";
import { formatResultCount } from "../../../shared/ui/format.ts";
import AlertMessage from "../../../shared/components/AlertMessage.tsx";
import RequirePermission from "../../auth/components/RequirePermission.tsx";
import { PERMISSIONS, useAuthUser } from "../../auth/context/authContext.ts";
import type { ApiClientError } from "../../../shared/api/httpClient.ts";
import type { Pagination as PaginationInfo, Ticket, TicketStatistics } from "../../../shared/api/types.ts";
import type { FilterPatch } from "../../../shared/types.ts";
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
} from "../types.ts";
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

const HEADINGS = ["Ticket", "Subject", "Room", "Priority", "Status", "Waiting", "Assigned"];

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

  const [searchParams, setSearchParams] = useSearchParams();
  const filters = readFilters(searchParams);

  const updateFilters = (patch: FilterPatch<TicketFilterState>) => {
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

  const { search, status, category, priority, active, overdue, sort, page } = filters;

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiClientError | null>(null);

  useEffect(() => {
    // If the filters change while a request is still in flight, the answer to
    // the old request must not be written into state - otherwise a fast second
    // search can be overwritten by a slow first one.
    let cancelled = false;
    setLoading(true);

    ticketsApi
      .list({ search, status, category, priority, active, overdue, sort, page, limit: PAGE_SIZE })
      .then((response) => {
        if (cancelled) return;
        setTickets(response.data.tickets);
        setPagination(response.data.pagination);
        setError(null);
      })
      .catch((apiError: ApiClientError) => {
        if (cancelled) return;
        setError(apiError);
        setTickets([]);
        setPagination(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [search, status, category, priority, active, overdue, sort, page]);

  // The counts above the table are staff-only and do not move with the filters.
  const [statistics, setStatistics] = useState<TicketStatistics | null>(null);

  useEffect(() => {
    if (!canManage) return;

    ticketsApi
      .statistics()
      .then((response) => setStatistics(response.data))
      .catch(() => setStatistics(null));
  }, [canManage]);

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
        resultSummary={formatResultCount(pagination?.total ?? null, "ticket")}
        onReset={() => setSearchParams({}, { replace: true })}
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

      <DataTable
        headings={HEADINGS}
        minWidthClass="min-w-[54rem]"
        loading={loading}
        isEmpty={tickets.length === 0}
        empty={{
          icon: LifeBuoy,
          title: "No tickets match these filters",
          hint: "Clear the filters to see every ticket, or raise one if a guest needs something.",
        }}
      >
        {tickets.map((ticket) => (
          <tr key={ticket.id} className="[&:last-child>td]:border-b-0 hover:bg-surface-hover">
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
      </DataTable>

      <Pagination
        pagination={pagination}
        onPageChange={(next) => updateFilters({ page: String(next) })}
        disabled={loading}
      />
    </AppShell>
  );
};

export default TicketsListPage;
