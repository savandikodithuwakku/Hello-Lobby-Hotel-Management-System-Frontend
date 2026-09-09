import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BedDouble,
  Pencil,
  RotateCcw,
  Save,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import type { ApiClientError } from "../../../shared/api/httpClient.ts";
import type { ApiResponse, HousekeepingStatus, Room, RoomType } from "../../../shared/api/types.ts";
import AppShell from "../../../shared/components/AppShell.tsx";
import ConfirmPanel from "../../../shared/components/ConfirmPanel.tsx";
import DetailRow, { DetailList } from "../../../shared/components/DetailRow.tsx";
import {
  column,
  twoColumnGrid,
  actionRow,
  buttonDanger,
  buttonPrimary,
  buttonSecondary,
  card,
  cardTitle,
  fieldGroup,
  fieldHint,
  fieldLabel,
  input,
  link,
  select,
} from "../../../shared/ui/styles.ts";
import AlertMessage from "../../../shared/components/AlertMessage.tsx";
import LoadingScreen from "../../../shared/components/LoadingScreen.tsx";
import RequirePermission from "../../auth/components/RequirePermission.tsx";
import { PERMISSIONS } from "../../auth/context/authContext.ts";
import type { RouteState } from "../../../shared/types.ts";
import { roomTypesApi, roomsApi } from "../services/rooms.api.ts";
import {
  formatDateTime,
  formatFloor,
  formatOccupancy,
  formatPrice,
} from "../types.ts";
import RoomStatusPills from "../components/RoomStatusPill.tsx";
import StatusChangePanel from "../components/StatusChangePanel.tsx";
import FacilitiesEditor from "../components/FacilitiesEditor.tsx";

interface EditableForm {
  roomNumber: string;
  roomType: string;
  floor: string;
  price: string;
  facilities: string[];
}

const toEditableForm = (room: Room): EditableForm => ({
  roomNumber: room.roomNumber,
  roomType: room.roomType.id,
  floor: String(room.floor),
  price: room.price === null ? "" : String(room.price),
  facilities: [...room.facilities],
});

const RoomDetailPage = () => {
  const { id = "" } = useParams<{ id: string }>();
  const location = useLocation();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<EditableForm | null>(null);
  const [confirmingRemoval, setConfirmingRemoval] = useState(false);

  // Every write returns the updated room, so the same piece of state holds the
  // loaded copy and every later version of it.
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<ApiClientError | null>(null);
  const [notice, setNotice] = useState<string | null>(
    (location.state as RouteState | null)?.message || null
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    roomsApi
      .get(id)
      .then((response) => {
        if (cancelled) return;
        setRoom(response.data.room);
        setError(null);
      })
      .catch((apiError: ApiClientError) => {
        if (cancelled) return;
        setError(apiError);
        setRoom(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  // The active types the edit form offers never change with the room.
  const [typeOptions, setTypeOptions] = useState<RoomType[]>([]);

  useEffect(() => {
    roomTypesApi
      .list({ isActive: "true", limit: 100, sort: "name" })
      .then((response) => setTypeOptions(response.data.roomTypes))
      .catch(() => setTypeOptions([]));
  }, []);

  /** Every write on this screen replaces the room shown above it. */
  const runRoomAction = async (
    action: () => Promise<ApiResponse<{ room: Room }>>
  ): Promise<boolean> => {
    setBusy(true);
    // The previous failure is no longer relevant once a new attempt starts.
    setError(null);

    try {
      const response = await action();
      setRoom(response.data.room);
      setNotice(response.message);
      return true;
    } catch (apiError) {
      setError(apiError as ApiClientError);
      return false;
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <LoadingScreen message="Loading room..." />;

  if (!room) {
    return (
      <AppShell title="Room">
        <div className={card}>
          <AlertMessage message={error?.message || "Room not found"} errors={error?.errors} />
          <Link to="/rooms" className={link}>
            Back to rooms
          </Link>
        </div>
      </AppShell>
    );
  }

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form) return;

    const saved = await runRoomAction(() =>
      roomsApi.update(id, {
        roomNumber: form.roomNumber,
        roomType: form.roomType,
        floor: Number(form.floor),
        price: form.price.trim() === "" ? null : Number(form.price),
        facilities: form.facilities,
      })
    );

    if (saved) setEditing(false);
  };

  const startEditing = () => {
    setForm(toEditableForm(room));
    setEditing(true);
  };

  const selectedType = typeOptions.find((type) => type.id === form?.roomType) || null;

  return (
    <AppShell
      title={`Room ${room.roomNumber}`}
      actions={
        !editing && (
          <RequirePermission permissions={[PERMISSIONS.ROOM_UPDATE]}>
            <button type="button" className={buttonSecondary} onClick={startEditing}>
              <Pencil size={16} aria-hidden="true" /> Edit room
            </button>
          </RequirePermission>
        )
      }
    >
      <div className="mb-5">
        <Link to="/rooms" className={`${link} inline-flex items-center gap-1.5`}>
          <ArrowLeft size={16} aria-hidden="true" /> Back to rooms
        </Link>
      </div>

      <AlertMessage message={error?.message} errors={error?.errors} />
      {notice && <AlertMessage variant="success" message={notice} />}

      {!room.isActive && (
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border border-line bg-surface p-5">
          <p className="text-[0.9rem] text-ink-muted">
            This room has been removed from the inventory. Its record is kept so past reservations
            still resolve, and it can be brought back at any time.
          </p>
          <RequirePermission permissions={[PERMISSIONS.ROOM_DELETE]}>
            <button
              type="button"
              className={buttonPrimary}
              disabled={busy}
              onClick={() => runRoomAction(() => roomsApi.restore(id))}
            >
              <RotateCcw size={16} aria-hidden="true" /> Restore room
            </button>
          </RequirePermission>
        </div>
      )}

      <div className={twoColumnGrid}>
        <div className={column}>
          <section className={card}>
            <h2 className={cardTitle}>
              <BedDouble size={20} aria-hidden="true" /> Room details
            </h2>

            {editing && form ? (
              <form onSubmit={handleSave} noValidate>
                <div className={fieldGroup}>
                  <label className={fieldLabel} htmlFor="edit-room-number">
                    Room number
                  </label>
                  <input
                    id="edit-room-number"
                    type="text"
                    className={input}
                    value={form.roomNumber}
                    maxLength={10}
                    onChange={(event) =>
                      setForm({ ...form, roomNumber: event.target.value })
                    }
                    required
                  />
                </div>

                <div className={fieldGroup}>
                  <label className={fieldLabel} htmlFor="edit-room-type">
                    Room type
                  </label>
                  <select
                    id="edit-room-type"
                    className={select}
                    value={form.roomType}
                    onChange={(event) => setForm({ ...form, roomType: event.target.value })}
                    required
                  >
                    {/* The current type is kept in the list even if withdrawn. */}
                    {!typeOptions.some((type) => type.id === room.roomType.id) && (
                      <option value={room.roomType.id}>{room.roomType.name} (withdrawn)</option>
                    )}
                    {typeOptions.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name} — {formatPrice(type.basePrice)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={fieldGroup}>
                  <label className={fieldLabel} htmlFor="edit-room-floor">
                    Floor
                  </label>
                  <input
                    id="edit-room-floor"
                    type="number"
                    className={input}
                    value={form.floor}
                    onChange={(event) => setForm({ ...form, floor: event.target.value })}
                    required
                  />
                </div>

                <div className={fieldGroup}>
                  <label className={fieldLabel} htmlFor="edit-room-price">
                    Price per night
                  </label>
                  <input
                    id="edit-room-price"
                    type="number"
                    className={input}
                    value={form.price}
                    min={0}
                    placeholder={selectedType ? String(selectedType.basePrice) : ""}
                    onChange={(event) => setForm({ ...form, price: event.target.value })}
                  />
                  <p className={fieldHint}>
                    Clear the box to drop the override and follow the room type again.
                  </p>
                </div>

                <FacilitiesEditor
                  label="Extra facilities"
                  facilities={form.facilities}
                  onChange={(facilities) => setForm({ ...form, facilities })}
                  inherited={selectedType?.facilities ?? []}
                />

                <div className={actionRow}>
                  <button
                    type="button"
                    className={buttonSecondary}
                    onClick={() => setEditing(false)}
                    disabled={busy}
                  >
                    <X size={16} aria-hidden="true" /> Cancel
                  </button>
                  <button type="submit" className={buttonPrimary} disabled={busy}>
                    <Save size={16} aria-hidden="true" /> {busy ? "Saving..." : "Save changes"}
                  </button>
                </div>
              </form>
            ) : (
              <DetailList>
                <DetailRow label="Status">
                  <RoomStatusPills occupancy={room.occupancy} housekeeping={room.housekeeping} />
                </DetailRow>
                <DetailRow label="Room type">
                  <Link to={`/room-types/${room.roomType.id}`} className={link}>
                    {room.roomType.name}
                  </Link>
                </DetailRow>
                <DetailRow label="Floor">{formatFloor(room.floor)}</DetailRow>
                <DetailRow label="Price per night">
                  {formatPrice(room.effectivePrice)}
                  {room.price === null && (
                    <span className="ml-2 text-[0.8rem] font-normal text-ink-dim">
                      inherited from {room.roomType.name}
                    </span>
                  )}
                </DetailRow>
                <DetailRow label="Sleeps">{formatOccupancy(room.roomType.maxOccupancy)}</DetailRow>
                <DetailRow label="Facilities">
                  {room.effectiveFacilities.length === 0
                    ? "—"
                    : room.effectiveFacilities.join(", ")}
                </DetailRow>
                <DetailRow label="Bookable now">{room.isBookable ? "Yes" : "No"}</DetailRow>
              </DetailList>
            )}
          </section>
        </div>

        <div className={column}>
          <section className={card}>
            <h2 className={cardTitle}>
              <Sparkles size={20} aria-hidden="true" /> Housekeeping
            </h2>

            <DetailList>
              <DetailRow label="Changed">{formatDateTime(room.housekeepingChangedAt)}</DetailRow>
              {room.housekeepingNote && (
                <DetailRow label="Note">{room.housekeepingNote}</DetailRow>
              )}
              {room.isDiscrepant && (
                <DetailRow label="Attention">
                  Standing empty but not fit to sell - this room cannot be booked tonight.
                </DetailRow>
              )}
            </DetailList>

            <div className="mt-6">
              <RequirePermission
                permissions={[PERMISSIONS.ROOM_MANAGE_STATUS]}
                fallback={
                  <p className="text-[0.85rem] text-ink-dim">
                    You do not have permission to change this room's status.
                  </p>
                }
              >
                <StatusChangePanel
                  current={room.housekeeping}
                  occupancy={room.occupancy}
                  allowed={room.isActive ? (room.allowedHousekeepingTransitions ?? []) : []}
                  busy={busy}
                  onSubmit={(housekeeping: HousekeepingStatus, note: string) =>
                    runRoomAction(() => roomsApi.changeHousekeeping(id, housekeeping, note))
                  }
                />
              </RequirePermission>
            </div>
          </section>

          {room.isActive && (
            <RequirePermission permissions={[PERMISSIONS.ROOM_DELETE]}>
              <section className={card}>
                <h2 className={cardTitle}>
                  <Trash2 size={20} aria-hidden="true" /> Remove from inventory
                </h2>

                {confirmingRemoval ? (
                  <ConfirmPanel
                    title={`Remove room ${room.roomNumber}?`}
                    description="The room stops appearing in availability but its record is kept, so past and future reservations still resolve. You can restore it later."
                    confirmLabel="Remove room"
                    confirmValue={room.roomNumber}
                    confirmHint={`Type ${room.roomNumber} to confirm`}
                    busy={busy}
                    onCancel={() => setConfirmingRemoval(false)}
                    onConfirm={async () => {
                      const done = await runRoomAction(() => roomsApi.deactivate(id));
                      if (done) setConfirmingRemoval(false);
                    }}
                  />
                ) : (
                  <>
                    <p className="mb-5 text-[0.88rem] text-ink-muted">
                      Rooms are never deleted outright. Removing one takes it out of the bookable
                      inventory while keeping its history intact.
                    </p>
                    <button
                      type="button"
                      className={buttonDanger}
                      onClick={() => setConfirmingRemoval(true)}
                      disabled={busy}
                    >
                      <Trash2 size={16} aria-hidden="true" /> Remove room
                    </button>
                  </>
                )}
              </section>
            </RequirePermission>
          )}
        </div>
      </div>
    </AppShell>
  );
};

export default RoomDetailPage;
