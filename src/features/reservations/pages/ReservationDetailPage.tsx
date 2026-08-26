import { useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BedDouble,
  CalendarDays,
  CircleSlash,
  DoorOpen,
  History,
  LogOut,
  Wallet,
  XCircle,
} from "lucide-react";
import type { ApiResponse, Reservation } from "../../../shared/api/types.ts";
import AppShell from "../../../shared/components/AppShell.tsx";
import ConfirmPanel from "../../../shared/components/ConfirmPanel.tsx";
import useApiData from "../../../shared/hooks/useApiData.ts";
import useAsyncAction from "../../../shared/hooks/useAsyncAction.ts";
import DetailRow, { DetailList } from "../../../shared/components/DetailRow.tsx";
import { column, twoColumnGrid } from "../../../shared/ui/layout.ts";
import {
  buttonDanger,
  buttonPrimary,
  buttonSecondary,
  buttonStack,
  card,
  cardTitle,
  link,
} from "../../../shared/ui/styles.ts";
import { formatDateOnly, formatNights, formatPrice } from "../../../shared/ui/format.ts";
import AlertMessage from "../../auth/components/AlertMessage.tsx";
import AuthLoadingScreen from "../../auth/components/AuthLoadingScreen.tsx";
import RequirePermission from "../../auth/components/RequirePermission.tsx";
import { PERMISSIONS } from "../../auth/constants/rbac.ts";
import { useAuthUser } from "../../auth/hooks/useAuth.ts";
import type { RouteState } from "../../auth/types.ts";
import reservationsApi from "../services/reservations.api.ts";
import paymentsApi from "../../payments/services/payments.api.ts";
import { RESERVATION_STATUSES, STATUS_HINTS, formatStay } from "../constants/reservations.ts";
import ReservationStatusPill from "../components/ReservationStatusPill.tsx";
import PaymentPanel from "../components/PaymentPanel.tsx";
import HistoryTimeline from "../components/HistoryTimeline.tsx";

const ReservationDetailPage = () => {
  const { id = "" } = useParams<{ id: string }>();
  const location = useLocation();
  const { user: actor, hasPermission } = useAuthUser();

  const [confirmingCancel, setConfirmingCancel] = useState(false);

  const { data: loaded, loading, error: loadError } = useApiData(
    () => reservationsApi.get(id).then((r) => r.data.reservation),
    [id]
  );

  // The audit trail is reloaded after every action, because each one adds an
  // entry to it.
  const { data: historyData, reload: reloadHistory } = useApiData(
    () => reservationsApi.history(id).then((r) => r.data.history),
    [id]
  );

  // Which ways of paying the server can actually handle. Asked for rather than
  // hard-coded, so the form never offers a method that would be refused.
  const { data: methodData } = useApiData(
    () => paymentsApi.methods().then((r) => r.data.methods),
    []
  );

  // Every action returns the updated booking, so it replaces the loaded copy.
  const [edited, setEdited] = useState<Reservation | null>(null);
  const reservation = edited ?? loaded;
  const history = historyData ?? [];

  const { busy, error: actionError, notice, run } = useAsyncAction(
    (location.state as RouteState | null)?.message || null
  );

  const error = actionError ?? loadError;

  /** Every action updates the booking shown and refreshes its history. */
  const runReservationAction = async (
    action: () => Promise<ApiResponse<{ reservation: Reservation }>>
  ) => {
    const done = await run(action, (data) => setEdited(data.reservation));
    reloadHistory();
    return done;
  };

  if (loading) return <AuthLoadingScreen message="Loading reservation..." />;

  if (!reservation) {
    return (
      <AppShell title="Reservation">
        <div className={card}>
          <AlertMessage message={error?.message || "Reservation not found"} errors={error?.errors} />
          <Link to="/reservations" className={link}>
            Back to reservations
          </Link>
        </div>
      </AppShell>
    );
  }

  const { status, payment, allowedTransitions = [] } = reservation;
  const isOwner = reservation.customer.id === actor.id;
  const canCancel =
    (isOwner || hasPermission(PERMISSIONS.RESERVATION_CANCEL)) &&
    allowedTransitions.includes(RESERVATION_STATUSES.CANCELLED);

  return (
    <AppShell title={`Booking ${reservation.reference}`}>
      <div className="mb-5">
        <Link to="/reservations" className={`${link} inline-flex items-center gap-1.5`}>
          <ArrowLeft size={16} aria-hidden="true" /> Back to reservations
        </Link>
      </div>

      <AlertMessage message={error?.message} errors={error?.errors} />
      {notice && <AlertMessage variant="success" message={notice} />}

      <div className={twoColumnGrid}>
        <div className={column}>
          <section className={card}>
            <h2 className={cardTitle}>
              <CalendarDays size={20} aria-hidden="true" /> Stay
            </h2>

            <DetailList>
              <DetailRow label="Status">
                <span className="flex flex-wrap items-center gap-3">
                  <ReservationStatusPill status={status} />
                  <span className="text-[0.82rem] font-normal text-ink-dim">
                    {STATUS_HINTS[status]}
                  </span>
                </span>
              </DetailRow>
              <DetailRow label="Dates">
                {formatStay(reservation.checkIn, reservation.checkOut)}
                <span className="ml-2 text-[0.82rem] font-normal text-ink-dim">
                  {formatNights(reservation.nights)}
                </span>
              </DetailRow>
              <DetailRow label="Check-in">{formatDateOnly(reservation.checkIn)}</DetailRow>
              <DetailRow label="Check-out">{formatDateOnly(reservation.checkOut)}</DetailRow>
              <DetailRow label="Guests">{reservation.guests}</DetailRow>
              <DetailRow label="Room">
                <span className="flex items-center gap-2">
                  <BedDouble size={16} aria-hidden="true" />
                  {reservation.room.roomNumber ? (
                    <RequirePermission
                      permissions={[PERMISSIONS.ROOM_READ]}
                      fallback={<>Room {reservation.room.roomNumber}</>}
                    >
                      <Link to={`/rooms/${reservation.room.id}`} className={link}>
                        Room {reservation.room.roomNumber}
                      </Link>
                    </RequirePermission>
                  ) : (
                    "—"
                  )}
                  <span className="text-[0.82rem] font-normal text-ink-dim">
                    {reservation.roomType.name}
                  </span>
                </span>
              </DetailRow>
              {reservation.customer.name && (
                <DetailRow label="Guest">
                  {reservation.customer.name}
                  <span className="ml-2 text-[0.82rem] font-normal text-ink-dim">
                    {reservation.customer.email}
                  </span>
                </DetailRow>
              )}
              {reservation.specialRequests && (
                <DetailRow label="Requests">{reservation.specialRequests}</DetailRow>
              )}
              {reservation.cancellationReason && (
                <DetailRow label="Cancelled because">{reservation.cancellationReason}</DetailRow>
              )}
            </DetailList>

            {reservation.additionalServices.length > 0 && (
              <div className="mt-6 border-t border-line pt-5">
                <h3 className="mb-3 text-[0.85rem] font-semibold tracking-[0.05em] text-ink-muted uppercase">
                  Additional services
                </h3>
                <ul className="flex flex-col gap-2 text-sm">
                  {reservation.additionalServices.map((service) => (
                    <li key={service.name} className="flex justify-between gap-4">
                      <span className="text-ink-muted">
                        {service.name}
                        {service.quantity > 1 && ` × ${service.quantity}`}
                      </span>
                      <span className="tabular-nums">{formatPrice(service.lineTotal)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          <section className={card}>
            <h2 className={cardTitle}>
              <History size={20} aria-hidden="true" /> History
            </h2>
            <HistoryTimeline entries={history} />
          </section>
        </div>

        <div className={column}>
          <section className={card}>
            <h2 className={cardTitle}>
              <Wallet size={20} aria-hidden="true" /> Payment
            </h2>
            <PaymentPanel
              reservation={reservation}
              canRecord={hasPermission(PERMISSIONS.PAYMENT_CREATE)}
              busy={busy}
              methods={methodData ?? []}
              // The payment response carries the updated booking, so recording
              // money goes through the same path as any other action. The bill
              // itself is issued by the server on first use.
              onRecord={(input) =>
                runReservationAction(() => paymentsApi.recordPayment(id, input))
              }
            />
          </section>

          {allowedTransitions.length > 0 && (
            <section className={card}>
              <h2 className={cardTitle}>Front desk</h2>

              <div className={buttonStack}>
                {allowedTransitions.includes(RESERVATION_STATUSES.CONFIRMED) && (
                  <RequirePermission permissions={[PERMISSIONS.RESERVATION_UPDATE]}>
                    <button
                      type="button"
                      className={buttonPrimary}
                      disabled={busy || !payment.advanceSettled}
                      title={
                        payment.advanceSettled
                          ? undefined
                          : "The advance must be paid before confirming"
                      }
                      onClick={() => runReservationAction(() => reservationsApi.confirm(id))}
                    >
                      Confirm booking
                    </button>
                  </RequirePermission>
                )}

                {allowedTransitions.includes(RESERVATION_STATUSES.CHECKED_IN) && (
                  <RequirePermission permissions={[PERMISSIONS.FRONTDESK_CHECKIN]}>
                    <button
                      type="button"
                      className={buttonPrimary}
                      disabled={busy}
                      onClick={() => runReservationAction(() => reservationsApi.checkIn(id))}
                    >
                      <DoorOpen size={16} aria-hidden="true" /> Check in
                    </button>
                  </RequirePermission>
                )}

                {allowedTransitions.includes(RESERVATION_STATUSES.CHECKED_OUT) && (
                  <RequirePermission permissions={[PERMISSIONS.FRONTDESK_CHECKOUT]}>
                    <button
                      type="button"
                      className={buttonPrimary}
                      disabled={busy}
                      onClick={() => runReservationAction(() => reservationsApi.checkOut(id))}
                    >
                      <LogOut size={16} aria-hidden="true" /> Check out
                    </button>
                  </RequirePermission>
                )}

                {allowedTransitions.includes(RESERVATION_STATUSES.COMPLETED) && (
                  <RequirePermission permissions={[PERMISSIONS.RESERVATION_UPDATE]}>
                    <button
                      type="button"
                      className={buttonPrimary}
                      disabled={busy || !payment.fullySettled}
                      title={
                        payment.fullySettled ? undefined : "Settle the balance before completing"
                      }
                      onClick={() => runReservationAction(() => reservationsApi.complete(id))}
                    >
                      Complete booking
                    </button>
                  </RequirePermission>
                )}

                {allowedTransitions.includes(RESERVATION_STATUSES.NO_SHOW) && (
                  <RequirePermission permissions={[PERMISSIONS.RESERVATION_UPDATE]}>
                    <button
                      type="button"
                      className={buttonSecondary}
                      disabled={busy}
                      onClick={() => runReservationAction(() => reservationsApi.markNoShow(id))}
                    >
                      <CircleSlash size={16} aria-hidden="true" /> Mark as no-show
                    </button>
                  </RequirePermission>
                )}
              </div>
            </section>
          )}

          {canCancel && (
            <section className={card}>
              <h2 className={cardTitle}>
                <XCircle size={20} aria-hidden="true" /> Cancel
              </h2>

              {confirmingCancel ? (
                <ConfirmPanel
                  title={`Cancel ${reservation.reference}?`}
                  description="The dates are released immediately and the room becomes bookable again. The booking stays on record as cancelled."
                  confirmLabel="Cancel booking"
                  busy={busy}
                  onCancel={() => setConfirmingCancel(false)}
                  onConfirm={async () => {
                    const done = await runReservationAction(() =>
                      reservationsApi.cancel(id, "Cancelled from the reservation screen")
                    );
                    if (done) setConfirmingCancel(false);
                  }}
                />
              ) : (
                <>
                  <p className="mb-5 text-[0.88rem] text-ink-muted">
                    Cancelling frees the dates straight away so another guest can book them.
                  </p>
                  <button
                    type="button"
                    className={buttonDanger}
                    onClick={() => setConfirmingCancel(true)}
                    disabled={busy}
                  >
                    <XCircle size={16} aria-hidden="true" /> Cancel booking
                  </button>
                </>
              )}
            </section>
          )}
        </div>
      </div>
    </AppShell>
  );
};

export default ReservationDetailPage;
