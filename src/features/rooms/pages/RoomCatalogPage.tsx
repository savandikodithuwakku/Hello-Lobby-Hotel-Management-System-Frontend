import { useEffect, useId, useState } from "react";
import { Link } from "react-router-dom";
import { BedDouble, CalendarSearch, Search, Users } from "lucide-react";
import { ApiClientError } from "../../../shared/api/httpClient.ts";
import type { CatalogRoomType } from "../../../shared/api/types.ts";
import AppShell from "../../../shared/components/AppShell.tsx";
import { buttonPrimary, card, fieldLabel, inputWithIcon, select } from "../../../shared/ui/styles.ts";
import AlertMessage from "../../auth/components/AlertMessage.tsx";
import { roomTypesApi } from "../services/rooms.api.ts";
import { formatOccupancy, formatPrice, ROOM_TYPE_SORT_OPTIONS } from "../constants/rooms.ts";

/**
 * The guest-facing catalogue.
 *
 * Guests see what the hotel sells - room types, prices, what each sleeps and
 * what it includes - and never the physical inventory. Room numbers and live
 * statuses are staff information: which rooms are occupied and which are empty
 * is not something to publish, and a guest is assigned a room at check-in
 * rather than picking one now.
 */
const RoomCatalogPage = () => {
  const searchId = useId();
  const guestsId = useId();
  const sortId = useId();

  const [roomTypes, setRoomTypes] = useState<CatalogRoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiClientError | null>(null);

  const [search, setSearch] = useState("");
  const [guests, setGuests] = useState("");
  const [sort, setSort] = useState("basePrice");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    // The API already limits a guest to types that are actually for sale.
    roomTypesApi
      .browse({ search, occupancy: guests, sort, limit: 50 })
      .then((response) => {
        if (cancelled) return;
        setRoomTypes(response.data.roomTypes);
        setError(null);
      })
      .catch((apiError: ApiClientError) => {
        if (cancelled) return;
        setError(apiError);
        setRoomTypes([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [search, guests, sort]);

  return (
    <AppShell title="Our rooms">
      <div className={card}>
        <AlertMessage message={error?.message} errors={error?.errors} />

        <section
          className="mb-8 grid grid-cols-1 gap-4 min-[900px]:grid-cols-[minmax(220px,2fr)_repeat(2,minmax(150px,1fr))]"
          aria-label="Filter rooms"
        >
          <div>
            <label className={fieldLabel} htmlFor={searchId}>
              Search
            </label>
            <div className="relative flex items-center">
              <Search
                className="pointer-events-none absolute left-4 text-ink-dim"
                size={18}
                aria-hidden="true"
              />
              <input
                id={searchId}
                type="search"
                className={inputWithIcon}
                placeholder="Suite, sea view, family..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </div>

          <div>
            <label className={fieldLabel} htmlFor={guestsId}>
              Guests
            </label>
            <input
              id={guestsId}
              type="number"
              min={1}
              className={select}
              placeholder="Any"
              value={guests}
              onChange={(event) => setGuests(event.target.value)}
            />
          </div>

          <div>
            <label className={fieldLabel} htmlFor={sortId}>
              Sort
            </label>
            <select
              id={sortId}
              className={select}
              value={sort}
              onChange={(event) => setSort(event.target.value)}
            >
              {ROOM_TYPE_SORT_OPTIONS.filter((option) => !option.value.includes("createdAt")).map(
                ({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                )
              )}
            </select>
          </div>
        </section>

        {!loading && roomTypes.length === 0 ? (
          <div className="flex flex-col items-center gap-2 border border-line px-6 py-14 text-center text-ink-dim">
            <BedDouble size={28} aria-hidden="true" />
            <p className="font-semibold text-ink">Nothing matches that search</p>
            <p className="max-w-[44ch] text-[0.88rem] text-ink-muted">
              Try a different term, or clear the guest count to see every room we offer.
            </p>
          </div>
        ) : (
          <ul
            className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6"
            aria-busy={loading}
          >
            {roomTypes.map((roomType) => (
              <li key={roomType.id} className="flex flex-col border border-line bg-canvas">
                {roomType.primaryImage ? (
                  <img
                    src={roomType.primaryImage}
                    alt={roomType.name}
                    className="h-44 w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-44 w-full items-center justify-center border-b border-line text-ink-dim">
                    <BedDouble size={32} aria-hidden="true" />
                  </div>
                )}

                <div className="flex flex-1 flex-col gap-3 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="font-display text-lg font-semibold">{roomType.name}</h2>
                    <span className="shrink-0 text-right">
                      <span className="block font-display text-lg font-bold tabular-nums">
                        {formatPrice(roomType.basePrice)}
                      </span>
                      <span className="text-[0.72rem] text-ink-dim">per night</span>
                    </span>
                  </div>

                  <p className="flex items-center gap-1.5 text-[0.85rem] text-ink-muted">
                    <Users size={15} aria-hidden="true" />
                    Sleeps {formatOccupancy(roomType.maxOccupancy)}
                  </p>

                  {roomType.description && (
                    <p className="text-[0.88rem] leading-relaxed text-ink-muted">
                      {roomType.description}
                    </p>
                  )}

                  {roomType.facilities.length > 0 && (
                    <ul className="flex flex-wrap gap-2 pt-2">
                      {roomType.facilities.map((facility) => (
                        <li
                          key={facility}
                          className="border border-line px-2.5 py-1 text-[0.78rem] text-ink-muted"
                        >
                          {facility}
                        </li>
                      ))}
                    </ul>
                  )}
                  <Link
                    to={`/reservations/new?roomType=${roomType.id}&guests=${Math.min(Number(guests) || 1, roomType.maxOccupancy)}`}
                    className={`${buttonPrimary} mt-auto`}
                  >
                    <CalendarSearch size={16} aria-hidden="true" /> Check dates
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-8 border-t border-line pt-6 text-[0.85rem] text-ink-dim">
          Pick a room type to see which dates are free. Your booking is held once the advance is
          paid, and the exact room is assigned when you arrive.
        </p>
      </div>
    </AppShell>
  );
};

export default RoomCatalogPage;
