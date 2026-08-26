import type { ReservationHistoryEntry } from "../../../shared/api/types.ts";
import { formatDateTime } from "../../../shared/ui/format.ts";
import { STATUS_LABELS, statusPill } from "../constants/reservations.ts";

/**
 * The booking's audit trail: every status change in order, with who made it and
 * any note they left. Read-only by design - history is appended, never edited.
 */
const HistoryTimeline = ({ entries }: { entries: ReservationHistoryEntry[] }) => {
  if (entries.length === 0) {
    return <p className="text-[0.85rem] text-ink-dim">No changes recorded yet.</p>;
  }

  return (
    <ol className="flex flex-col">
      {entries.map((entry, index) => (
        <li key={`${entry.status}-${entry.at}-${index}`} className="flex gap-4">
          <div className="flex flex-col items-center">
            <span className={`mt-1.5 size-2.5 shrink-0 ${statusPill[entry.status]}`} />
            {index < entries.length - 1 && <span className="w-px flex-1 bg-line" />}
          </div>

          <div className="pb-6">
            <p className="text-[0.92rem] font-semibold">{STATUS_LABELS[entry.status]}</p>
            <p className="text-[0.8rem] text-ink-dim">
              {formatDateTime(entry.at)}
              {entry.by.name && ` · ${entry.by.name}`}
            </p>
            {entry.note && <p className="mt-1 text-[0.85rem] text-ink-muted">{entry.note}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
};

export default HistoryTimeline;
