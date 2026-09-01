import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

/**
 * The list table used by the rooms, room types, reservations and users screens.
 *
 * Every one of those screens shows the same thing: a scrollable bordered table
 * with an upper-case heading row, or a short "nothing here" panel when the list
 * comes back empty. Only the column names, the rows and the wording of the
 * empty panel change, so those are the props and the rest lives here.
 */

/** Padding, border and alignment for a normal table cell. */
export const CELL = "border-b border-line px-4 py-3 text-left align-middle";

/** The same cell in the dimmer colour used for secondary columns. */
export const MUTED_CELL = `${CELL} text-ink-muted`;

const HEADING_CELL = `${CELL} bg-surface-hover text-xs font-semibold tracking-[0.05em] whitespace-nowrap text-ink-muted uppercase`;

type EmptyState = {
  /** Drawn above the message, to make the empty panel readable at a glance. */
  icon: LucideIcon;
  /** One short line saying what is missing, e.g. "No rooms match these filters". */
  title: string;
  /** A sentence telling the reader what they can do about it. */
  hint: ReactNode;
};

type DataTableProps = {
  /** Column names, in order. Pass an empty string for a column of buttons. */
  headings: string[];
  /**
   * The Tailwind class fixing how narrow the table may get before it scrolls
   * sideways instead of squashing, e.g. `"min-w-[860px]"`. Each screen has a
   * different number of columns, so each passes its own.
   */
  minWidthClass: string;
  /** True while a request is in flight, so the table can be marked as busy. */
  loading: boolean;
  /** What to show when there are no rows. */
  empty: EmptyState;
  /** The `<tr>` rows to draw. */
  children: ReactNode;
  /** True when there is nothing to draw, which shows `empty` instead. */
  isEmpty: boolean;
};

const DataTable = ({
  headings,
  minWidthClass,
  loading,
  empty,
  isEmpty,
  children,
}: DataTableProps) => {
  // While the first request is still running the table is drawn empty rather
  // than as "nothing found", so the reader is not told the list is empty
  // before it has actually been fetched.
  if (!loading && isEmpty) {
    const { icon: Icon, title, hint } = empty;

    return (
      <div className="flex flex-col items-center gap-2 border border-line px-6 py-14 text-center text-ink-dim">
        <Icon size={28} aria-hidden="true" />
        <p className="font-semibold text-ink">{title}</p>
        <p className="max-w-[46ch] text-[0.88rem] text-ink-muted">{hint}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-line" aria-busy={loading}>
      <table className={`w-full border-collapse text-sm ${minWidthClass}`}>
        <thead>
          <tr>
            {headings.map((heading, index) => (
              // Headings are unique in every current table, but a blank name is
              // used for an action column, so the index keeps the key unique.
              <th key={heading || index} scope="col" className={HEADING_CELL}>
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
};

export default DataTable;
