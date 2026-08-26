import { useState } from "react";
import { Lock, RefreshCw } from "lucide-react";
import type { HousekeepingStatus, RoomOccupancy } from "../../../shared/api/types.ts";
import {
  actionRow,
  buttonPrimary,
  fieldGroup,
  fieldHint,
  fieldLabel,
  input,
  select,
} from "../../../shared/ui/styles.ts";
import { HOUSEKEEPING_LABELS, OCCUPANCY_LABELS } from "../constants/rooms.ts";

interface StatusChangePanelProps {
  current: HousekeepingStatus;
  /** Who holds the room. Shown for context; never changed from here. */
  occupancy: RoomOccupancy;
  /** States the API will accept right now, straight from the room payload. */
  allowed: HousekeepingStatus[];
  busy: boolean;
  onSubmit: (housekeeping: HousekeepingStatus, note: string) => void;
}

/**
 * Housekeeping controls for one room.
 *
 * Only housekeeping is editable here. Whether somebody holds the room is not a
 * choice anyone makes on this screen - it moves because a booking was made, a
 * guest arrived or a guest left - so it is shown as context and nothing more.
 *
 * The choices come from the API's own transition list rather than being
 * hard-coded, so the panel can never offer a move the server would refuse.
 */
const StatusChangePanel = ({
  current,
  occupancy,
  allowed,
  busy,
  onSubmit,
}: StatusChangePanelProps) => {
  const [housekeeping, setHousekeeping] = useState<HousekeepingStatus | "">("");
  const [note, setNote] = useState("");

  if (allowed.length === 0) {
    return (
      <div className="flex items-start gap-3 border border-dashed border-line p-4 text-[0.88rem] text-ink-muted">
        <Lock size={18} aria-hidden="true" className="mt-0.5 text-ink-dim" />
        <p>
          This room is <strong>{HOUSEKEEPING_LABELS[current].toLowerCase()}</strong> and has no
          moves available from here.
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-4 text-[0.85rem] text-ink-muted">
        Currently <strong>{OCCUPANCY_LABELS[occupancy].toLowerCase()}</strong> and{" "}
        <strong>{HOUSEKEEPING_LABELS[current].toLowerCase()}</strong>. A room with a guest in it is
        still serviced every day, so these two move independently.
      </p>

      <div className={fieldGroup}>
        <label className={fieldLabel} htmlFor="room-housekeeping">
          Move to
        </label>
        <select
          id="room-housekeeping"
          className={select}
          value={housekeeping}
          onChange={(event) => setHousekeeping(event.target.value as HousekeepingStatus)}
        >
          <option value="">Choose a state</option>
          {allowed.map((option) => (
            <option key={option} value={option}>
              {HOUSEKEEPING_LABELS[option]}
            </option>
          ))}
        </select>
        <p className={fieldHint}>
          Whether the room is vacant, reserved or occupied is set by the booking attached to it, not
          from here.
        </p>
      </div>

      <div className={fieldGroup}>
        <label className={fieldLabel} htmlFor="room-housekeeping-note">
          Note (optional)
        </label>
        <input
          id="room-housekeeping-note"
          type="text"
          className={input}
          value={note}
          placeholder="Air conditioning repair, deep clean..."
          onChange={(event) => setNote(event.target.value)}
        />
      </div>

      <div className={actionRow}>
        <button
          type="button"
          className={buttonPrimary}
          disabled={busy || !housekeeping}
          onClick={() => {
            if (!housekeeping) return;
            onSubmit(housekeeping, note);
            setNote("");
            setHousekeeping("");
          }}
        >
          <RefreshCw size={16} aria-hidden="true" /> {busy ? "Updating..." : "Update"}
        </button>
      </div>
    </div>
  );
};

export default StatusChangePanel;
