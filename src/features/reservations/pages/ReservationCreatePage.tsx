import { useEffect, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, CalendarCheck, User } from "lucide-react";
import type { AvailableRoom, User as AppUser } from "../../../shared/api/types.ts";
import AppShell from "../../../shared/components/AppShell.tsx";
import useApiData from "../../../shared/hooks/useApiData.ts";
import useCreateForm from "../../../shared/hooks/useCreateForm.ts";
import {
  card,
  cardTitle,
  fieldGroup,
  fieldHint,
  fieldLabel,
  input,
  link,
  select,
} from "../../../shared/ui/styles.ts";
import { column, twoColumnGrid } from "../../../shared/ui/layout.ts";
import { dayFromToday, formatNights, formatOccupancy, formatPrice } from "../../../shared/ui/format.ts";
import AlertMessage from "../../auth/components/AlertMessage.tsx";
import SubmitButton from "../../auth/components/SubmitButton.tsx";
import { PERMISSIONS, ROLES } from "../../auth/constants/rbac.ts";
import { useAuthUser } from "../../auth/hooks/useAuth.ts";
import usersApi from "../../users/services/users.api.ts";
import reservationsApi, { type ServiceLine } from "../services/reservations.api.ts";
import { estimateAdvance } from "../constants/reservations.ts";
import AvailabilitySearch, { type StayQuery } from "../components/AvailabilitySearch.tsx";
import ServicesEditor from "../components/ServicesEditor.tsx";

/**
 * Booking flow: pick the dates, see what is actually free, choose a room,
 * confirm. The availability step is not optional - a room can only be selected
 * from the API's own list of free rooms, so the form cannot offer a double
 * booking in the first place.
 */
const ReservationCreatePage = () => {
  const [searchParams] = useSearchParams();
  const { user: actor, hasPermission } = useAuthUser();

  const isStaff = hasPermission(PERMISSIONS.RESERVATION_READ);

  const [stay, setStay] = useState<StayQuery>({
    checkIn: searchParams.get("checkIn") || dayFromToday(1),
    checkOut: searchParams.get("checkOut") || dayFromToday(2),
    guests: Number(searchParams.get("guests")) || 1,
    roomType: searchParams.get("roomType") || "",
  });

  const [room, setRoom] = useState<AvailableRoom | null>(null);
  const [customerId, setCustomerId] = useState("");
  const [services, setServices] = useState<ServiceLine[]>([]);
  const [specialRequests, setSpecialRequests] = useState("");

  const { submitting, error, submit } = useCreateForm();

  // Staff book on behalf of a guest, so they need the customer list.
  const { data: customerList } = useApiData<AppUser[]>(
    () =>
      isStaff
        ? usersApi
            .list({ role: ROLES.CUSTOMER, status: "active", limit: 100, sort: "name" })
            .then((r) => r.data.users)
        : Promise.resolve([]),
    [isStaff]
  );

  const customers = customerList ?? [];

  // A room chosen for one date range means nothing for another.
  useEffect(() => {
    setRoom(null);
  }, [stay.checkIn, stay.checkOut, stay.guests, stay.roomType]);

  const servicesTotal = services.reduce(
    (sum, service) => sum + service.unitPrice * service.quantity,
    0
  );
  const total = (room?.quote.roomSubtotal ?? 0) + servicesTotal;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!room) return undefined;

    return submit(
      () =>
        reservationsApi.create({
          room: room.id,
          checkIn: stay.checkIn,
          checkOut: stay.checkOut,
          guests: stay.guests,
          additionalServices: services,
          specialRequests,
          ...(isStaff && customerId ? { customer: customerId } : {}),
        }),
      ({ reservation }) => ({
        to: `/reservations/${reservation.id}`,
        message: `Booking ${reservation.reference} created. It is held until the advance is paid.`,
      }),
      // The room may have been taken between the search and the submit, so the
      // choice is cleared and the operator sends the search again.
      (apiError) => {
        if (apiError.status === 409) setRoom(null);
      }
    );
  };

  return (
    <AppShell title="New booking">
      <div className="mb-5">
        <Link to="/reservations" className={`${link} inline-flex items-center gap-1.5`}>
          <ArrowLeft size={16} aria-hidden="true" /> Back to reservations
        </Link>
      </div>

      <div className={twoColumnGrid}>
        <div className={column}>
          <section className={card}>
            <h2 className={cardTitle}>1. Find a free room</h2>
            <AvailabilitySearch
              stay={stay}
              onStayChange={setStay}
              selectedRoomId={room?.id ?? null}
              onSelectRoom={setRoom}
            />
          </section>
        </div>

        <div className={column}>
          <section className={card}>
            <h2 className={cardTitle}>2. Confirm the details</h2>

            <AlertMessage message={error?.message} errors={error?.errors} />

            {!room ? (
              <p className="text-[0.88rem] text-ink-muted">
                Search the dates on the left and choose a room to continue.
              </p>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <div className="mb-5 border border-line bg-canvas p-4">
                  <p className="font-display text-lg font-semibold">Room {room.roomNumber}</p>
                  <p className="text-[0.85rem] text-ink-muted">
                    {room.roomType.name} · {formatNights(room.quote.nights)} ·{" "}
                    {formatOccupancy(stay.guests)}
                  </p>
                </div>

                {isStaff && (
                  <div className={fieldGroup}>
                    <label className={fieldLabel} htmlFor="reservation-customer">
                      Guest
                    </label>
                    <select
                      id="reservation-customer"
                      className={select}
                      value={customerId}
                      onChange={(event) => setCustomerId(event.target.value)}
                    >
                      <option value="">{actor.name} (me)</option>
                      {customers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name} — {customer.email}
                        </option>
                      ))}
                    </select>
                    <p className={fieldHint}>
                      <User size={12} className="mr-1 inline" aria-hidden="true" />
                      Who the booking is for. Leave as yourself for a walk-in you own.
                    </p>
                  </div>
                )}

                <ServicesEditor services={services} onChange={setServices} />

                <div className={fieldGroup}>
                  <label className={fieldLabel} htmlFor="reservation-requests">
                    Special requests
                  </label>
                  <textarea
                    id="reservation-requests"
                    className={`${input} min-h-20 resize-y py-3`}
                    value={specialRequests}
                    maxLength={500}
                    placeholder="High floor, late arrival, allergies..."
                    onChange={(event) => setSpecialRequests(event.target.value)}
                  />
                </div>

                <dl className="mb-6 border-t border-line pt-4 text-sm">
                  <div className="flex justify-between py-1">
                    <dt className="text-ink-muted">Room</dt>
                    <dd className="tabular-nums">{formatPrice(room.quote.roomSubtotal)}</dd>
                  </div>
                  {servicesTotal > 0 && (
                    <div className="flex justify-between py-1">
                      <dt className="text-ink-muted">Services</dt>
                      <dd className="tabular-nums">{formatPrice(servicesTotal)}</dd>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-line py-2">
                    <dt className="font-semibold">Total</dt>
                    <dd className="font-display text-lg font-bold tabular-nums">
                      {formatPrice(total)}
                    </dd>
                  </div>
                  <div className="flex justify-between py-1">
                    <dt className="text-ink-muted">Advance to confirm</dt>
                    <dd className="tabular-nums text-amber-400">
                      {formatPrice(estimateAdvance(total))}
                    </dd>
                  </div>
                </dl>

                <SubmitButton
                  loading={submitting}
                  icon={CalendarCheck}
                  loadingLabel="Creating booking..."
                >
                  Create booking
                </SubmitButton>
                <p className={fieldHint}>
                  The room is held as pending until the advance is paid; the API confirms it
                  automatically once it is.
                </p>
              </form>
            )}
          </section>
        </div>
      </div>
    </AppShell>
  );
};

export default ReservationCreatePage;
