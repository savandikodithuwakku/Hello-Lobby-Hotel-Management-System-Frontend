import { useState, type FormEvent } from "react";
import { AlertTriangle, Briefcase, HandCoins, Luggage, Plus } from "lucide-react";
import type { Baggage } from "../../../shared/api/types.ts";
import { FilterPanel, SearchField, SelectField } from "../../../shared/components/fields.tsx";
import AppShell from "../../../shared/components/AppShell.tsx";
import DataTable, { CELL } from "../../../shared/components/DataTable.tsx";
import Pagination from "../../../shared/components/Pagination.tsx";
import useApiData from "../../../shared/hooks/useApiData.ts";
import useAsyncAction from "../../../shared/hooks/useAsyncAction.ts";
import useUrlFilters from "../../../shared/hooks/useUrlFilters.ts";
import {
  actionRow,
  buttonPrimary,
  buttonSecondary,
  card,
  cardTitle,
  fieldGroup,
  fieldHint,
  fieldLabel,
  input,
  select,
  statusPillBase,
} from "../../../shared/ui/styles.ts";
import { formatDateTime, formatResultCount } from "../../../shared/ui/format.ts";
import AlertMessage from "../../../shared/components/AlertMessage.tsx";
import RequirePermission from "../../auth/components/RequirePermission.tsx";
import { PERMISSIONS } from "../../auth/constants/rbac.ts";
import { useAuthUser } from "../../auth/context/authContext.ts";
import reservationsApi from "../../reservations/services/reservations.api.ts";
import baggageApi from "../services/baggage.api.ts";
import {
  BAGGAGE_SORT_OPTIONS,
  BAGGAGE_STATUS_LABELS,
  BAGGAGE_STATUS_OPTIONS,
  DEFAULT_BAGGAGE_SORT,
  PAGE_SIZE,
  baggageStatusPill,
  formatBags,
} from "../constants/frontdesk.ts";

interface BaggageFilterState {
  search: string;
  status: string;
  sort: string;
  page: number;
}

const readFilters = (params: URLSearchParams): BaggageFilterState => ({
  search: params.get("search") || "",
  status: params.get("status") || "",
  sort: params.get("sort") || DEFAULT_BAGGAGE_SORT,
  page: Number(params.get("page")) || 1,
});

const HEADINGS = ["Tag", "Guest", "Pieces", "Where", "Taken in", "Status", ""];

/**
 * Baggage held at the desk.
 *
 * Two jobs on one screen, because they are the same job at a counter: taking
 * bags in and giving them back. The list leads with what has been held longest,
 * which is how a forgotten suitcase gets noticed at all.
 */
const BaggagePage = () => {
  const { hasPermission } = useAuthUser();
  const canManage = hasPermission(PERMISSIONS.FRONTDESK_BAGGAGE_MANAGE);

  const { filters, updateFilters, resetFilters } = useUrlFilters(readFilters);
  const { search, status, sort, page } = filters;

  const [storing, setStoring] = useState(false);
  const [collecting, setCollecting] = useState<Baggage | null>(null);

  // The "take bags in" form.
  const [bagCount, setBagCount] = useState("1");
  const [guestName, setGuestName] = useState("");
  const [reservation, setReservation] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");

  // The "hand bags back" form.
  const [collectedByName, setCollectedByName] = useState("");

  const { busy, error: actionError, notice, run } = useAsyncAction();

  const { data, loading, error: loadError, reload } = useApiData(
    () =>
      baggageApi
        .list({ search, status, sort, page, limit: PAGE_SIZE })
        .then((response) => response.data),
    [search, status, sort, page]
  );

  const { data: statistics, reload: reloadStatistics } = useApiData(
    () =>
      canManage
        ? baggageApi.statistics().then((response) => response.data)
        : Promise.resolve(null),
    [canManage]
  );

  const { data: reservationData } = useApiData(
    () =>
      canManage
        ? reservationsApi
            .list({ limit: 100, sort: "-createdAt" })
            .then((response) => response.data.reservations)
        : Promise.resolve([]),
    [canManage]
  );

  const error = actionError ?? loadError;
  const items = data?.baggage ?? [];

  const refresh = () => {
    reload();
    reloadStatistics();
  };

  const handleStore = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const done = await run(() =>
      baggageApi.store({
        bagCount: Number(bagCount),
        guestName: guestName.trim() || undefined,
        reservation: reservation || undefined,
        description: description.trim() || undefined,
        location: location.trim() || undefined,
      })
    );

    if (done) {
      setStoring(false);
      setBagCount("1");
      setGuestName("");
      setReservation("");
      setDescription("");
      setLocation("");
      refresh();
    }
  };

  const handleCollect = async () => {
    if (!collecting) return;

    const done = await run(() =>
      baggageApi.collect(collecting.id, { collectedByName: collectedByName.trim() || undefined })
    );

    if (done) {
      setCollecting(null);
      setCollectedByName("");
      refresh();
    }
  };

  return (
    <AppShell
      title="Baggage"
      actions={
        canManage && !storing ? (
          <button type="button" className={buttonPrimary} onClick={() => setStoring(true)}>
            <Plus size={16} aria-hidden="true" /> Take bags in
          </button>
        ) : null
      }
    >
      <AlertMessage message={error?.message} errors={error?.errors} />
      {notice && <AlertMessage variant="success" message={notice} />}

      {statistics && (
        <section className="mb-8 grid gap-4 sm:grid-cols-3" aria-label="Baggage held">
          <div className="border border-line bg-surface px-5 py-4">
            <p className="font-display text-2xl font-bold tabular-nums">{statistics.heldNow}</p>
            <p className="mt-1 text-[0.82rem] tracking-wider text-ink-muted uppercase">
              Lots held now
            </p>
          </div>
          <div className="border border-line bg-surface px-5 py-4">
            <p className="font-display text-2xl font-bold tabular-nums">{statistics.piecesHeld}</p>
            <p className="mt-1 text-[0.82rem] tracking-wider text-ink-muted uppercase">
              Pieces behind the desk
            </p>
          </div>
          <div className="border border-line bg-surface px-5 py-4">
            <p
              className={`font-display text-2xl font-bold tabular-nums ${
                statistics.unclaimed > 0 ? "text-red-700" : "text-ink"
              }`}
            >
              {statistics.unclaimed}
            </p>
            <p className="mt-1 text-[0.82rem] tracking-wider text-ink-muted uppercase">
              Unclaimed over {statistics.unclaimedAfterDays} days
            </p>
          </div>
        </section>
      )}

      {storing && (
        <section className={`${card} mb-8`}>
          <h2 className={cardTitle}>
            <Luggage size={20} aria-hidden="true" /> Take bags in
          </h2>

          <form onSubmit={handleStore} noValidate>
            <div className="grid gap-4 md:grid-cols-2">
              <div className={fieldGroup}>
                <label className={fieldLabel} htmlFor="bag-count">
                  How many pieces
                </label>
                <input
                  id="bag-count"
                  type="number"
                  min={1}
                  max={30}
                  className={input}
                  value={bagCount}
                  onChange={(event) => setBagCount(event.target.value)}
                  required
                />
              </div>

              <div className={fieldGroup}>
                <label className={fieldLabel} htmlFor="bag-reservation">
                  Booking (optional)
                </label>
                <select
                  id="bag-reservation"
                  className={select}
                  value={reservation}
                  onChange={(event) => setReservation(event.target.value)}
                >
                  <option value="">No booking - a walk-in</option>
                  {(reservationData ?? []).map((booking) => (
                    <option key={booking.id} value={booking.id}>
                      {booking.reference} — {booking.customer.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={fieldGroup}>
              <label className={fieldLabel} htmlFor="bag-guest-name">
                Whose bags they are
              </label>
              <input
                id="bag-guest-name"
                type="text"
                className={input}
                value={guestName}
                placeholder="Name to write on the ticket"
                onChange={(event) => setGuestName(event.target.value)}
              />
              <p className={fieldHint}>
                Not needed if you picked a booking - the guest comes from that. Required for a
                walk-in, because bags recorded against nobody cannot be given back.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className={fieldGroup}>
                <label className={fieldLabel} htmlFor="bag-description">
                  What they look like
                </label>
                <input
                  id="bag-description"
                  type="text"
                  className={input}
                  value={description}
                  placeholder="Two black suitcases and a rucksack"
                  onChange={(event) => setDescription(event.target.value)}
                />
              </div>

              <div className={fieldGroup}>
                <label className={fieldLabel} htmlFor="bag-location">
                  Where they are
                </label>
                <input
                  id="bag-location"
                  type="text"
                  className={input}
                  value={location}
                  placeholder="Store room B, shelf 3"
                  onChange={(event) => setLocation(event.target.value)}
                />
              </div>
            </div>

            <div className={actionRow}>
              <button
                type="button"
                className={buttonSecondary}
                disabled={busy}
                onClick={() => setStoring(false)}
              >
                Cancel
              </button>
              <button type="submit" className={buttonPrimary} disabled={busy}>
                <Luggage size={16} aria-hidden="true" /> {busy ? "Saving..." : "Take them in"}
              </button>
            </div>
          </form>
        </section>
      )}

      {collecting && (
        <section className={`${card} mb-8`}>
          <h2 className={cardTitle}>
            <HandCoins size={20} aria-hidden="true" /> Hand back {collecting.tag}
          </h2>

          <p className="mb-4 text-[0.9rem] text-ink-muted">
            {formatBags(collecting.bagCount)} for <strong>{collecting.guestName}</strong>
            {collecting.description ? ` — ${collecting.description}` : ""}
            {collecting.location ? `, held at ${collecting.location}` : ""}.
          </p>

          <div className={fieldGroup}>
            <label className={fieldLabel} htmlFor="collected-by">
              Who is taking them
            </label>
            <input
              id="collected-by"
              type="text"
              className={input}
              value={collectedByName}
              placeholder="The guest, a driver, a colleague..."
              onChange={(event) => setCollectedByName(event.target.value)}
            />
            <p className={fieldHint}>
              Worth writing down: it is not always the guest, and "somebody collected them" is no
              answer when a guest comes back for bags that have gone.
            </p>
          </div>

          <div className={actionRow}>
            <button
              type="button"
              className={buttonSecondary}
              disabled={busy}
              onClick={() => {
                setCollecting(null);
                setCollectedByName("");
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              className={buttonPrimary}
              disabled={busy}
              onClick={handleCollect}
            >
              {busy ? "Saving..." : "Hand them back"}
            </button>
          </div>
        </section>
      )}

      <FilterPanel
        label="Filter baggage"
        gridClassName="grid gap-4 md:grid-cols-3"
        resultSummary={formatResultCount(data?.pagination.total ?? null, "record")}
        hasFilters={Boolean(search || status)}
        onReset={resetFilters}
      >
        <SearchField
          label="Search"
          placeholder="Tag, name or description"
          value={search}
          onChange={(value) => updateFilters({ search: value })}
        />
        <SelectField
          label="Status"
          placeholder="Any status"
          options={BAGGAGE_STATUS_OPTIONS}
          value={status}
          onChange={(value) => updateFilters({ status: value })}
        />
        <SelectField
          label="Sort"
          options={BAGGAGE_SORT_OPTIONS}
          value={sort}
          onChange={(value) => updateFilters({ sort: value })}
        />
      </FilterPanel>

      <DataTable
        headings={HEADINGS}
        minWidthClass="min-w-[52rem]"
        loading={loading}
        isEmpty={items.length === 0}
        empty={{
          icon: Briefcase,
          title: "Nothing matches these filters",
          hint: "Clear the filters to see every record, including bags already handed back.",
        }}
      >
        {items.map((item) => (
          <tr key={item.id} className="[&:last-child>td]:border-b-0 hover:bg-surface-hover">
            <td className={`${CELL} font-semibold`}>{item.tag}</td>
            <td className={CELL}>
              {item.guestName}
              {item.reservation.reference && (
                <span className="ml-2 text-[0.78rem] text-ink-dim">
                  {item.reservation.reference}
                </span>
              )}
            </td>
            <td className={`${CELL} tabular-nums`}>
              {item.bagCount}
              {item.description && (
                <span className="ml-2 text-[0.78rem] text-ink-dim">{item.description}</span>
              )}
            </td>
            <td className={`${CELL} text-ink-muted`}>{item.location || "—"}</td>
            <td className={`${CELL} whitespace-nowrap text-ink-muted`}>
              {formatDateTime(item.receivedAt)}
              {!item.isCollected && item.daysHeld > 0 && (
                <span className="ml-2 text-[0.78rem] text-ink-dim">{item.daysHeld}d held</span>
              )}
            </td>
            <td className={CELL}>
              <span className={`${statusPillBase} ${baggageStatusPill[item.status]}`}>
                {item.status === "unclaimed" && <AlertTriangle size={12} aria-hidden="true" />}
                {BAGGAGE_STATUS_LABELS[item.status]}
              </span>
            </td>
            <td className={CELL}>
              {item.isCollected ? (
                <span className="text-[0.8rem] text-ink-dim">
                  {item.collectedByName || "collected"}
                </span>
              ) : (
                <RequirePermission permissions={[PERMISSIONS.FRONTDESK_BAGGAGE_MANAGE]}>
                  <button
                    type="button"
                    className={buttonSecondary}
                    disabled={busy}
                    onClick={() => setCollecting(item)}
                  >
                    Hand back
                  </button>
                </RequirePermission>
              )}
            </td>
          </tr>
        ))}
      </DataTable>

      <Pagination
        pagination={data?.pagination ?? null}
        onPageChange={(next) => updateFilters({ page: String(next) })}
        disabled={loading}
      />
    </AppShell>
  );
};

export default BaggagePage;
