import { useEffect, useId, useState, type FormEvent } from "react";
import { BedDouble, CalendarSearch, Users } from "lucide-react";
import { ApiClientError } from "../../../shared/api/httpClient.ts";
import type { AvailableRoom, RoomType } from "../../../shared/api/types.ts";
import {
  buttonPrimary,
  fieldGroup,
  fieldHint,
  fieldLabel,
  input,
  select,
} from "../../../shared/ui/styles.ts";
import { dayFromToday, formatNights, formatPrice } from "../../../shared/ui/format.ts";
import AlertMessage from "../../auth/components/AlertMessage.tsx";
import { roomTypesApi } from "../../rooms/services/rooms.api.ts";
import reservationsApi from "../services/reservations.api.ts";

export interface StayQuery {
  checkIn: string;
  checkOut: string;
  guests: number;
  roomType: string;
}

interface AvailabilitySearchProps {
  stay: StayQuery;
  onStayChange: (stay: StayQuery) => void;
  selectedRoomId: string | null;
  onSelectRoom: (room: AvailableRoom) => void;
}

/**
 * Date-range search over free rooms.
 *
 * The list comes from the API's availability endpoint, which already removes
 * anything with an overlapping booking - the UI never decides what is free.
 * Each result carries its own quote for the requested nights.
 */
const AvailabilitySearch = ({
  stay,
  onStayChange,
  selectedRoomId,
  onSelectRoom,
}: AvailabilitySearchProps) => {
  const checkInId = useId();
  const checkOutId = useId();
  const guestsId = useId();
  const typeId = useId();

  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [rooms, setRooms] = useState<AvailableRoom[]>([]);
  const [nights, setNights] = useState(0);
  const [unavailable, setUnavailable] = useState(0);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiClientError | null>(null);

  useEffect(() => {
    roomTypesApi
      .list({ isActive: "true", limit: 100, sort: "name" })
      .then((response) => setRoomTypes(response.data.roomTypes))
      .catch(() => setRoomTypes([]));
  }, []);

  const search = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await reservationsApi.availability({
        checkIn: stay.checkIn,
        checkOut: stay.checkOut,
        guests: stay.guests,
        ...(stay.roomType ? { roomType: stay.roomType } : {}),
      });
      setRooms(response.data.rooms);
      setNights(response.data.nights);
      setUnavailable(response.data.unavailable);
    } catch (apiError) {
      setError(apiError as ApiClientError);
      setRooms([]);
    } finally {
      setSearched(true);
      setLoading(false);
    }
  };

  const setField = <TKey extends keyof StayQuery>(key: TKey, value: StayQuery[TKey]) =>
    onStayChange({ ...stay, [key]: value });

  return (
    <div>
      <form onSubmit={search} noValidate>
        <div className="grid grid-cols-1 gap-4 min-[900px]:grid-cols-4">
          <div className={fieldGroup}>
            <label className={fieldLabel} htmlFor={checkInId}>
              Check-in
            </label>
            <input
              id={checkInId}
              type="date"
              className={input}
              value={stay.checkIn}
              min={dayFromToday(0)}
              onChange={(event) => setField("checkIn", event.target.value)}
              required
            />
          </div>

          <div className={fieldGroup}>
            <label className={fieldLabel} htmlFor={checkOutId}>
              Check-out
            </label>
            <input
              id={checkOutId}
              type="date"
              className={input}
              value={stay.checkOut}
              min={stay.checkIn || dayFromToday(1)}
              onChange={(event) => setField("checkOut", event.target.value)}
              required
            />
          </div>

          <div className={fieldGroup}>
            <label className={fieldLabel} htmlFor={guestsId}>
              Guests
            </label>
            <input
              id={guestsId}
              type="number"
              min={1}
              className={input}
              value={stay.guests}
              onChange={(event) => setField("guests", Number(event.target.value) || 1)}
              required
            />
          </div>

          <div className={fieldGroup}>
            <label className={fieldLabel} htmlFor={typeId}>
              Room type
            </label>
            <select
              id={typeId}
              className={select}
              value={stay.roomType}
              onChange={(event) => setField("roomType", event.target.value)}
            >
              <option value="">Any type</option>
              {roomTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button type="submit" className={buttonPrimary} disabled={loading}>
          <CalendarSearch size={16} aria-hidden="true" />
          {loading ? "Searching..." : "Search availability"}
        </button>
        <p className={fieldHint}>
          Check-out is the morning the guest leaves, so a room freed on the 10th can be booked from
          the 10th.
        </p>
      </form>

      <div className="mt-6">
        <AlertMessage message={error?.message} errors={error?.errors} />

        {searched && !error && (
          <p className="mb-4 border-t border-line pt-4 text-[0.85rem] text-ink-muted">
            {rooms.length === 0
              ? "No rooms are free for those dates."
              : `${rooms.length} room${rooms.length === 1 ? "" : "s"} free for ${formatNights(nights)}`}
            {unavailable > 0 && (
              <span className="text-ink-dim">
                {" "}
                ({unavailable} already booked)
              </span>
            )}
          </p>
        )}

        <ul className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
          {rooms.map((room) => {
            const selected = room.id === selectedRoomId;

            return (
              <li key={room.id}>
                <button
                  type="button"
                  onClick={() => onSelectRoom(room)}
                  aria-pressed={selected}
                  className={`flex w-full cursor-pointer flex-col gap-2 border p-4 text-left transition-colors duration-300 ${
                    selected
                      ? "border-brand bg-surface-hover"
                      : "border-line bg-canvas hover:border-line-focus hover:bg-surface-hover"
                  }`}
                >
                  <span className="flex items-center justify-between gap-2">
                    <strong className="font-display text-lg">Room {room.roomNumber}</strong>
                    <span className="text-[0.78rem] text-ink-dim">Floor {room.floor}</span>
                  </span>

                  <span className="flex items-center gap-1.5 text-[0.85rem] text-ink-muted">
                    <BedDouble size={15} aria-hidden="true" />
                    {room.roomType.name}
                  </span>

                  <span className="flex items-center gap-1.5 text-[0.85rem] text-ink-muted">
                    <Users size={15} aria-hidden="true" />
                    Sleeps {room.roomType.maxOccupancy}
                  </span>

                  <span className="mt-1 border-t border-line pt-2 text-sm">
                    <strong className="tabular-nums">{formatPrice(room.quote.roomSubtotal)}</strong>
                    <span className="text-ink-dim">
                      {" "}
                      for {formatNights(room.quote.nights)}
                    </span>
                    <span className="block text-[0.78rem] text-ink-dim">
                      {formatPrice(room.quote.ratePerNight)} per night
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default AvailabilitySearch;
