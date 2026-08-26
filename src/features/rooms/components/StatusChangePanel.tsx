import { useState } from "react";
import { Lock, RefreshCw } from "lucide-react";
import type { RoomStatus } from "../../../shared/api/types.ts";
import {
  actionRow,
  buttonPrimary,
  fieldGroup,
  fieldHint,
  fieldLabel,
  input,
  select,
} from "../../../shared/ui/styles.ts";
import { STATUS_LABELS } from "../constants/rooms.ts";

interface StatusChangePanelProps {
  current: RoomStatus;
  /** Statuses the API will accept right now, straight from the room payload. */
  allowed: RoomStatus[];
  busy: boolean;
  onSubmit: (status: RoomStatus, note: string) => void;
}

/**
 * Housekeeping controls for one room.
 *
 * The choices come from the API's own transition list rather than being
 * hard-coded here, so the panel can never offer a move the server refuses -
 * including while a booking holds the room, when the list is empty.
 */
const StatusChangePanel = ({ current, allowed, busy, onSubmit }: StatusChangePanelProps) => {
  const [status, setStatus] = useState<RoomStatus | "">("");
  const [note, setNote] = useState("");

  if (allowed.length === 0) {
    return (
      <div className="flex items-start gap-3 border border-dashed border-line p-4 text-[0.88rem] text-ink-muted">
        <Lock size={18} aria-hidden="true" className="mt-0.5 text-ink-dim" />
        <p>
          This room is <strong>{STATUS_LABELS[current].toLowerCase()}</strong>. Its status is driven
          by the booking attached to it and returns to the housekeeping cycle automatically when the
          guest checks out or the reservation is cancelled.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className={fieldGroup}>
        <label className={fieldLabel} htmlFor="room-status">
          Move to
        </label>
        <select
          id="room-status"
          className={select}
          value={status}
          onChange={(event) => setStatus(event.target.value as RoomStatus)}
        >
          <option value="">Choose a status</option>
          {allowed.map((option) => (
            <option key={option} value={option}>
              {STATUS_LABELS[option]}
            </option>
          ))}
        </select>
        <p className={fieldHint}>
          Reserved and occupied are not listed: those are set by the reservation and check-in flows.
        </p>
      </div>

      <div className={fieldGroup}>
        <label className={fieldLabel} htmlFor="room-status-note">
          Note (optional)
        </label>
        <input
          id="room-status-note"
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
          disabled={busy || !status}
          onClick={() => {
            if (!status) return;
            onSubmit(status, note);
            setNote("");
            setStatus("");
          }}
        >
          <RefreshCw size={16} aria-hidden="true" /> {busy ? "Updating..." : "Update status"}
        </button>
      </div>
    </div>
  );
};

export default StatusChangePanel;
