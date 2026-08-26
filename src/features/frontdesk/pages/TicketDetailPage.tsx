import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, BedDouble, DoorClosed, LifeBuoy, MessageSquare, Send } from "lucide-react";
import type { ApiResponse, Ticket, TicketStatus } from "../../../shared/api/types.ts";
import AppShell from "../../../shared/components/AppShell.tsx";
import DetailRow, { DetailList } from "../../../shared/components/DetailRow.tsx";
import useApiData from "../../../shared/hooks/useApiData.ts";
import useAsyncAction from "../../../shared/hooks/useAsyncAction.ts";
import { column, twoColumnGrid } from "../../../shared/ui/layout.ts";
import {
  actionRow,
  buttonDanger,
  buttonPrimary,
  buttonSecondary,
  buttonStack,
  card,
  cardTitle,
  fieldGroup,
  fieldHint,
  fieldLabel,
  input,
  link,
  select,
} from "../../../shared/ui/styles.ts";
import { formatDateTime } from "../../../shared/ui/format.ts";
import AlertMessage from "../../auth/components/AlertMessage.tsx";
import AuthLoadingScreen from "../../auth/components/AuthLoadingScreen.tsx";
import RequirePermission from "../../auth/components/RequirePermission.tsx";
import { PERMISSIONS } from "../../auth/constants/rbac.ts";
import { useAuthUser } from "../../auth/hooks/useAuth.ts";
import ticketsApi from "../services/tickets.api.ts";
import {
  ROOM_BLOCKING_CATEGORIES,
  TICKET_CATEGORY_LABELS,
  TICKET_STATUS_LABELS,
  formatSince,
} from "../constants/frontdesk.ts";
import { TicketPriorityPill, TicketStatusPill } from "../components/TicketPills.tsx";

/** Statuses that need somebody to say what was actually done. */
const NEEDS_RESOLUTION: TicketStatus[] = ["resolved"];

const TicketDetailPage = () => {
  const { id = "" } = useParams<{ id: string }>();
  const { hasPermission } = useAuthUser();
  const canManage = hasPermission(PERMISSIONS.FRONTDESK_TICKET_MANAGE);

  const { data: loaded, loading, error: loadError } = useApiData(
    () => ticketsApi.get(id).then((response) => response.data.ticket),
    [id]
  );

  const [edited, setEdited] = useState<Ticket | null>(null);
  const ticket = edited ?? loaded;

  const [note, setNote] = useState("");
  const [nextStatus, setNextStatus] = useState<TicketStatus | "">("");
  const [resolution, setResolution] = useState("");

  const { busy, error: actionError, notice, run } = useAsyncAction();
  const error = actionError ?? loadError;

  const runTicketAction = (action: () => Promise<ApiResponse<{ ticket: Ticket }>>) =>
    run(action, (data) => setEdited(data.ticket));

  if (loading && !ticket) return <AuthLoadingScreen message="Loading ticket..." />;

  if (!ticket) {
    return (
      <AppShell title="Ticket">
        <div className={card}>
          <AlertMessage message={error?.message || "Ticket not found"} errors={error?.errors} />
          <Link to="/tickets" className={link}>
            Back to tickets
          </Link>
        </div>
      </AppShell>
    );
  }

  const allowed = ticket.allowedTransitions ?? [];
  const canBlockRoom = Boolean(ticket.room.id) && ROOM_BLOCKING_CATEGORIES.includes(ticket.category);
  const resolutionNeeded = nextStatus !== "" && NEEDS_RESOLUTION.includes(nextStatus);

  return (
    <AppShell title={`Ticket ${ticket.reference}`}>
      <div className="mb-5">
        <Link to="/tickets" className={`${link} inline-flex items-center gap-1.5`}>
          <ArrowLeft size={16} aria-hidden="true" /> Back to tickets
        </Link>
      </div>

      <AlertMessage message={error?.message} errors={error?.errors} />
      {notice && <AlertMessage variant="success" message={notice} />}

      <div className={twoColumnGrid}>
        <div className={column}>
          <section className={card}>
            <h2 className={cardTitle}>
              <LifeBuoy size={20} aria-hidden="true" /> {ticket.subject}
            </h2>

            <DetailList>
              <DetailRow label="Status">
                <span className="flex flex-wrap items-center gap-2">
                  <TicketStatusPill status={ticket.status} />
                  <TicketPriorityPill priority={ticket.priority} />
                  {ticket.isOverdue && (
                    <span className="text-[0.82rem] font-normal text-red-700">
                      waiting {formatSince(ticket.createdAt)} — past its response target
                    </span>
                  )}
                </span>
              </DetailRow>
              <DetailRow label="Category">{TICKET_CATEGORY_LABELS[ticket.category]}</DetailRow>
              <DetailRow label="Raised">
                {formatDateTime(ticket.createdAt)}
                <span className="ml-2 text-[0.82rem] font-normal text-ink-dim">
                  by {ticket.reportedBy.name ?? "—"}
                </span>
              </DetailRow>
              {ticket.guest.name && <DetailRow label="Guest">{ticket.guest.name}</DetailRow>}
              {ticket.room.roomNumber && (
                <DetailRow label="Room">
                  <span className="flex items-center gap-2">
                    <BedDouble size={16} aria-hidden="true" />
                    <RequirePermission
                      permissions={[PERMISSIONS.ROOM_READ]}
                      fallback={<>Room {ticket.room.roomNumber}</>}
                    >
                      <Link to={`/rooms/${ticket.room.id}`} className={link}>
                        Room {ticket.room.roomNumber}
                      </Link>
                    </RequirePermission>
                  </span>
                </DetailRow>
              )}
              {ticket.reservation.reference && (
                <DetailRow label="Booking">
                  <Link to={`/reservations/${ticket.reservation.id}`} className={link}>
                    {ticket.reservation.reference}
                  </Link>
                </DetailRow>
              )}
              <DetailRow label="Assigned to">{ticket.assignedTo?.name ?? "Nobody yet"}</DetailRow>
              {ticket.responseMinutes !== null && (
                <DetailRow label="Picked up after">{ticket.responseMinutes} min</DetailRow>
              )}
            </DetailList>

            <div className="mt-6 border-t border-line pt-5">
              <p className="text-[0.82rem] tracking-wider text-ink-muted uppercase">What happened</p>
              <p className="mt-2 leading-relaxed whitespace-pre-line">{ticket.description}</p>
            </div>

            {ticket.resolution && (
              <div className="mt-6 border border-success/30 bg-success/5 p-4">
                <p className="text-[0.82rem] tracking-wider text-emerald-700 uppercase">
                  What was done
                </p>
                <p className="mt-2 leading-relaxed whitespace-pre-line">{ticket.resolution}</p>
              </div>
            )}
          </section>

          <section className={card}>
            <h2 className={cardTitle}>
              <MessageSquare size={20} aria-hidden="true" /> Updates
            </h2>

            <ol className="flex flex-col gap-4">
              {ticket.updates.map((update, index) => (
                <li key={`${update.at}-${index}`} className="border-l-2 border-line pl-4">
                  <p className="text-[0.8rem] text-ink-dim">
                    {formatDateTime(update.at)} · {update.by.name ?? "System"}
                    {update.status && (
                      <span className="ml-2 text-ink-muted">
                        → {TICKET_STATUS_LABELS[update.status]}
                      </span>
                    )}
                  </p>
                  <p className="mt-1 text-[0.92rem]">{update.note}</p>
                </li>
              ))}
            </ol>

            <div className="mt-6 border-t border-line pt-5">
              <div className={fieldGroup}>
                <label className={fieldLabel} htmlFor="ticket-note">
                  Add a note
                </label>
                <input
                  id="ticket-note"
                  type="text"
                  className={input}
                  value={note}
                  placeholder="Called the guest, engineer booked for 3pm..."
                  onChange={(event) => setNote(event.target.value)}
                />
              </div>

              <div className={actionRow}>
                <button
                  type="button"
                  className={buttonPrimary}
                  disabled={busy || !note.trim()}
                  onClick={async () => {
                    const done = await runTicketAction(() => ticketsApi.comment(id, note.trim()));
                    if (done) setNote("");
                  }}
                >
                  <Send size={16} aria-hidden="true" /> Add note
                </button>
              </div>
            </div>
          </section>
        </div>

        <div className={column}>
          {canManage && allowed.length > 0 && (
            <section className={card}>
              <h2 className={cardTitle}>Move it along</h2>

              <div className={fieldGroup}>
                <label className={fieldLabel} htmlFor="ticket-status">
                  New status
                </label>
                <select
                  id="ticket-status"
                  className={select}
                  value={nextStatus}
                  onChange={(event) => setNextStatus(event.target.value as TicketStatus)}
                >
                  <option value="">Choose a status</option>
                  {allowed.map((status) => (
                    <option key={status} value={status}>
                      {TICKET_STATUS_LABELS[status]}
                    </option>
                  ))}
                </select>
              </div>

              {resolutionNeeded && (
                <div className={fieldGroup}>
                  <label className={fieldLabel} htmlFor="ticket-resolution">
                    What was done
                  </label>
                  <input
                    id="ticket-resolution"
                    type="text"
                    className={input}
                    value={resolution}
                    placeholder="Replaced the thermostat"
                    onChange={(event) => setResolution(event.target.value)}
                  />
                  <p className={fieldHint}>
                    Required. A ticket closed with no explanation tells the next person nothing,
                    and the guest less.
                  </p>
                </div>
              )}

              <div className={actionRow}>
                <button
                  type="button"
                  className={buttonPrimary}
                  disabled={busy || !nextStatus || (resolutionNeeded && !resolution.trim())}
                  onClick={async () => {
                    if (!nextStatus) return;

                    const done = await runTicketAction(() =>
                      ticketsApi.changeStatus(id, nextStatus, {
                        resolution: resolution.trim() || undefined,
                      })
                    );

                    if (done) {
                      setNextStatus("");
                      setResolution("");
                    }
                  }}
                >
                  Update ticket
                </button>
              </div>
            </section>
          )}

          {canManage && canBlockRoom && (
            <section className={card}>
              <h2 className={cardTitle}>
                <DoorClosed size={20} aria-hidden="true" /> The room
              </h2>

              <p className="mb-4 text-[0.88rem] text-ink-muted">
                {ticket.blocksRoom
                  ? `Room ${ticket.room.roomNumber} is out of order because of this ticket. Resolving it hands the room back to housekeeping automatically.`
                  : `Room ${ticket.room.roomNumber} is still sellable. Take it out of service if a guest should not be given it tonight.`}
              </p>

              <RequirePermission permissions={[PERMISSIONS.ROOM_MANAGE_STATUS]}>
                <div className={buttonStack}>
                  <button
                    type="button"
                    className={ticket.blocksRoom ? buttonSecondary : buttonDanger}
                    disabled={busy}
                    onClick={() =>
                      runTicketAction(() => ticketsApi.setRoomBlock(id, !ticket.blocksRoom))
                    }
                  >
                    {ticket.blocksRoom ? "Hand the room back" : "Take the room out of service"}
                  </button>
                </div>
              </RequirePermission>
            </section>
          )}
        </div>
      </div>
    </AppShell>
  );
};

export default TicketDetailPage;
