import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, LifeBuoy } from "lucide-react";
import type { TicketCategory, TicketPriority } from "../../../shared/api/types.ts";
import AppShell from "../../../shared/components/AppShell.tsx";
import useApiData from "../../../shared/hooks/useApiData.ts";
import useCreateForm from "../../../shared/hooks/useCreateForm.ts";
import {
  card,
  fieldGroup,
  fieldHint,
  fieldLabel,
  input,
  link,
  select,
} from "../../../shared/ui/styles.ts";
import AlertMessage from "../../auth/components/AlertMessage.tsx";
import FormField from "../../auth/components/FormField.tsx";
import SubmitButton from "../../auth/components/SubmitButton.tsx";
import { PERMISSIONS } from "../../auth/constants/rbac.ts";
import { useAuthUser } from "../../auth/hooks/useAuth.ts";
import reservationsApi from "../../reservations/services/reservations.api.ts";
import ticketsApi from "../services/tickets.api.ts";
import {
  ROOM_BLOCKING_CATEGORIES,
  TICKET_CATEGORY_OPTIONS,
  TICKET_PRIORITY_OPTIONS,
} from "../constants/frontdesk.ts";

/**
 * Raising a ticket.
 *
 * A guest names one of their own bookings and the server works out the room and
 * the guest from it - which is what stops somebody reporting a fault in a room
 * that is not theirs and having it taken out of service.
 *
 * Staff get the extra controls: priority, and whether the room can still be
 * sold tonight. Neither is a decision a guest should be making about the hotel's
 * inventory.
 */
const TicketCreatePage = () => {
  const { hasPermission } = useAuthUser();
  const canManage = hasPermission(PERMISSIONS.FRONTDESK_TICKET_MANAGE);

  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<TicketCategory>("maintenance");
  const [priority, setPriority] = useState<TicketPriority>("medium");
  const [reservation, setReservation] = useState("");
  const [blocksRoom, setBlocksRoom] = useState(false);

  const { submitting, error, submit } = useCreateForm();

  // Bookings the caller may attach this to. A guest sees only their own,
  // because that is all the API returns them.
  const { data: reservationData } = useApiData(
    () =>
      reservationsApi
        .list({ status: canManage ? "checked_in" : "", limit: 100, sort: "-createdAt" })
        .then((response) => response.data.reservations),
    [canManage]
  );

  const reservations = reservationData ?? [];
  const canBlock = canManage && ROOM_BLOCKING_CATEGORIES.includes(category);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    return submit(
      () =>
        ticketsApi.create({
          subject,
          description,
          category,
          ...(canManage ? { priority } : {}),
          ...(reservation ? { reservation } : {}),
          ...(canBlock && blocksRoom ? { blocksRoom: true } : {}),
        }),
      ({ ticket }) => ({
        to: `/tickets/${ticket.id}`,
        message: `Ticket ${ticket.reference} raised.`,
      })
    );
  };

  return (
    <AppShell title="Raise a ticket">
      <div className="mb-5">
        <Link to="/tickets" className={`${link} inline-flex items-center gap-1.5`}>
          <ArrowLeft size={16} aria-hidden="true" /> Back to tickets
        </Link>
      </div>

      <div className={`${card} max-w-2xl`}>
        <AlertMessage message={error?.message} errors={error?.errors} />

        <form onSubmit={handleSubmit} noValidate>
          <FormField
            label="Subject"
            value={subject}
            onChange={setSubject}
            placeholder="Air conditioner isn't working"
            maxLength={140}
            required
          />

          <div className={fieldGroup}>
            <label className={fieldLabel} htmlFor="ticket-description">
              What is wrong
            </label>
            <textarea
              id="ticket-description"
              className={`${input} min-h-32 py-3`}
              value={description}
              placeholder="It runs but blows warm air. The guest has been moved a fan in the meantime."
              maxLength={2000}
              onChange={(event) => setDescription(event.target.value)}
              required
            />
            <p className={fieldHint}>
              Whatever the next person needs to know before they walk into the room.
            </p>
          </div>

          <div className={fieldGroup}>
            <label className={fieldLabel} htmlFor="ticket-category">
              Category
            </label>
            <select
              id="ticket-category"
              className={select}
              value={category}
              onChange={(event) => setCategory(event.target.value as TicketCategory)}
            >
              {TICKET_CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className={fieldGroup}>
            <label className={fieldLabel} htmlFor="ticket-reservation">
              Booking {canManage ? "(optional)" : ""}
            </label>
            <select
              id="ticket-reservation"
              className={select}
              value={reservation}
              onChange={(event) => setReservation(event.target.value)}
              required={!canManage}
            >
              <option value="">
                {canManage ? "Not about a particular stay" : "Choose your booking"}
              </option>
              {reservations.map((booking) => (
                <option key={booking.id} value={booking.id}>
                  {booking.reference}
                  {booking.room.roomNumber ? ` — room ${booking.room.roomNumber}` : ""}
                </option>
              ))}
            </select>
            <p className={fieldHint}>
              {canManage
                ? "Naming a booking fills in the guest and the room automatically."
                : "The room is taken from the booking, so we know where to send somebody."}
            </p>
          </div>

          {canManage && (
            <div className={fieldGroup}>
              <label className={fieldLabel} htmlFor="ticket-priority">
                Priority
              </label>
              <select
                id="ticket-priority"
                className={select}
                value={priority}
                onChange={(event) => setPriority(event.target.value as TicketPriority)}
              >
                {TICKET_PRIORITY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className={fieldHint}>
                This sets how quickly somebody has to pick the ticket up, not how quickly it gets
                fixed.
              </p>
            </div>
          )}

          {canBlock && (
            <div className={fieldGroup}>
              <label className="flex cursor-pointer items-start gap-3 text-[0.92rem]">
                <input
                  type="checkbox"
                  className="mt-1 size-4 cursor-pointer"
                  checked={blocksRoom}
                  onChange={(event) => setBlocksRoom(event.target.checked)}
                />
                <span>
                  Take the room out of service
                  <span className="mt-1 block text-[0.82rem] text-ink-dim">
                    Nobody can be sold or given this room until the ticket is resolved. Resolving it
                    hands the room back to housekeeping automatically.
                  </span>
                </span>
              </label>
            </div>
          )}

          <SubmitButton loading={submitting} loadingLabel="Raising..." icon={LifeBuoy}>
            Raise ticket
          </SubmitButton>
        </form>
      </div>
    </AppShell>
  );
};

export default TicketCreatePage;
