import { useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Archive,
  BedDouble,
  DoorClosed,
  Pencil,
  RotateCcw,
  Save,
  X,
} from "lucide-react";
import type { ApiResponse, RoomType } from "../../../shared/api/types.ts";
import AppShell from "../../../shared/components/AppShell.tsx";
import ConfirmPanel from "../../../shared/components/ConfirmPanel.tsx";
import useApiData from "../../../shared/hooks/useApiData.ts";
import useAsyncAction from "../../../shared/hooks/useAsyncAction.ts";
import DetailRow, { DetailList } from "../../../shared/components/DetailRow.tsx";
import { column, twoColumnGrid } from "../../../shared/ui/layout.ts";
import {
  actionRow,
  buttonDanger,
  buttonPrimary,
  buttonSecondary,
  card,
  cardTitle,
  link,
} from "../../../shared/ui/styles.ts";
import AlertMessage from "../../auth/components/AlertMessage.tsx";
import AuthLoadingScreen from "../../auth/components/AuthLoadingScreen.tsx";
import RequirePermission from "../../auth/components/RequirePermission.tsx";
import { PERMISSIONS } from "../../auth/constants/rbac.ts";
import type { RouteState } from "../../auth/types.ts";
import { roomTypesApi, type RoomTypePayload } from "../services/rooms.api.ts";
import { pluralize } from "../../../shared/ui/format.ts";
import { formatOccupancy, formatPrice } from "../constants/rooms.ts";
import RoomTypeForm from "../components/RoomTypeForm.tsx";

const RoomTypeDetailPage = () => {
  const { id = "" } = useParams<{ id: string }>();
  const location = useLocation();

  const [editing, setEditing] = useState(false);
  const [confirmingWithdrawal, setConfirmingWithdrawal] = useState(false);

  const { data: loaded, loading, error: loadError } = useApiData(
    () => roomTypesApi.get(id).then((r) => r.data.roomType),
    [id]
  );

  // Every write returns the updated type, so it replaces the loaded copy.
  const [edited, setEdited] = useState<RoomType | null>(null);
  const roomType = edited ?? loaded;

  const { busy, error: actionError, notice, run } = useAsyncAction(
    (location.state as RouteState | null)?.message || null
  );

  const error = actionError ?? loadError;

  const runTypeAction = (action: () => Promise<ApiResponse<{ roomType: RoomType }>>) =>
    run(action, (data) => setEdited(data.roomType));

  if (loading) return <AuthLoadingScreen message="Loading room type..." />;

  if (!roomType) {
    return (
      <AppShell title="Room type">
        <div className={card}>
          <AlertMessage message={error?.message || "Room type not found"} errors={error?.errors} />
          <Link to="/room-types" className={link}>
            Back to room types
          </Link>
        </div>
      </AppShell>
    );
  }

  const handleSave = async (payload: RoomTypePayload) => {
    const saved = await runTypeAction(() => roomTypesApi.update(id, payload));
    if (saved) setEditing(false);
  };

  const roomCount = roomType.activeRoomCount ?? roomType.roomCount ?? 0;

  return (
    <AppShell
      title={roomType.name}
      actions={
        !editing && (
          <>
            <Link to={`/rooms?roomType=${roomType.id}`} className={buttonSecondary}>
              <DoorClosed size={16} aria-hidden="true" /> View rooms
            </Link>
            <RequirePermission permissions={[PERMISSIONS.ROOM_TYPE_UPDATE]}>
              <button type="button" className={buttonSecondary} onClick={() => setEditing(true)}>
                <Pencil size={16} aria-hidden="true" /> Edit
              </button>
            </RequirePermission>
          </>
        )
      }
    >
      <div className="mb-5">
        <Link to="/room-types" className={`${link} inline-flex items-center gap-1.5`}>
          <ArrowLeft size={16} aria-hidden="true" /> Back to room types
        </Link>
      </div>

      <AlertMessage message={error?.message} errors={error?.errors} />
      {notice && <AlertMessage variant="success" message={notice} />}

      {!roomType.isActive && (
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border border-line bg-surface p-5">
          <p className="text-[0.9rem] text-ink-muted">
            This type has been withdrawn from the catalogue. No new rooms can be created against it,
            and its existing records are kept.
          </p>
          <RequirePermission permissions={[PERMISSIONS.ROOM_TYPE_UPDATE]}>
            <button
              type="button"
              className={buttonPrimary}
              disabled={busy}
              onClick={() => runTypeAction(() => roomTypesApi.restore(id))}
            >
              <RotateCcw size={16} aria-hidden="true" /> Restore type
            </button>
          </RequirePermission>
        </div>
      )}

      <div className={twoColumnGrid}>
        <div className={column}>
          <section className={card}>
            <h2 className={cardTitle}>
              <BedDouble size={20} aria-hidden="true" /> Room type
            </h2>

            {editing ? (
              <RoomTypeForm
                roomType={roomType}
                onSubmit={handleSave}
                actions={
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
                }
              />
            ) : (
              <DetailList>
                <DetailRow label="Base price">{formatPrice(roomType.basePrice)}</DetailRow>
                <DetailRow label="Sleeps">{formatOccupancy(roomType.maxOccupancy)}</DetailRow>
                <DetailRow label="Rooms">
                  <Link to={`/rooms?roomType=${roomType.id}`} className={link}>
                    {pluralize(roomCount, "room")}
                  </Link>
                </DetailRow>
                <DetailRow label="Facilities">
                  {roomType.facilities.length === 0 ? "—" : roomType.facilities.join(", ")}
                </DetailRow>
                <DetailRow label="Description">{roomType.description || "—"}</DetailRow>
              </DetailList>
            )}
          </section>

          {!editing && roomType.images.length > 0 && (
            <section className={card}>
              <h2 className={cardTitle}>Photos</h2>
              <ul className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3">
                {roomType.images.map((image) => (
                  <li key={image.url} className="border border-line">
                    <img
                      src={image.url}
                      alt={image.alt || `${roomType.name} photograph`}
                      className="h-36 w-full object-cover"
                      loading="lazy"
                    />
                    {image.isPrimary && (
                      <p className="border-t border-line px-2 py-1 text-[0.7rem] tracking-[0.04em] text-amber-700 uppercase">
                        Primary
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <div className={column}>
          {roomType.isActive && (
            <RequirePermission permissions={[PERMISSIONS.ROOM_TYPE_DELETE]}>
              <section className={card}>
                <h2 className={cardTitle}>
                  <Archive size={20} aria-hidden="true" /> Withdraw from catalogue
                </h2>

                {confirmingWithdrawal ? (
                  <ConfirmPanel
                    title={`Withdraw ${roomType.name}?`}
                    description="The type stops accepting new rooms but is never deleted, so existing rooms and reservations keep their meaning. You can restore it later."
                    confirmLabel="Withdraw type"
                    confirmValue={roomType.name}
                    confirmHint={`Type ${roomType.name} to confirm`}
                    busy={busy}
                    onCancel={() => setConfirmingWithdrawal(false)}
                    onConfirm={async () => {
                      const done = await runTypeAction(() => roomTypesApi.deactivate(id));
                      if (done) setConfirmingWithdrawal(false);
                    }}
                  />
                ) : (
                  <>
                    <p className="mb-5 text-[0.88rem] text-ink-muted">
                      {roomCount > 0
                        ? `${roomCount} active room${roomCount === 1 ? " uses" : "s use"} this type. Move or remove them first - the API will refuse otherwise.`
                        : "No active rooms use this type, so it can be withdrawn."}
                    </p>
                    <button
                      type="button"
                      className={buttonDanger}
                      onClick={() => setConfirmingWithdrawal(true)}
                      disabled={busy}
                    >
                      <Archive size={16} aria-hidden="true" /> Withdraw type
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

export default RoomTypeDetailPage;
