import type { ReactNode } from "react";
import { X } from "lucide-react";
import { buttonText } from "../../ui/styles.ts";

interface FilterPanelProps {
  /** Read out to screen readers, e.g. "Filter rooms". */
  label: string;
  /** Tailwind grid classes for this screen's filter row. */
  gridClassName: string;
  children: ReactNode;
  /** The result count line. `null` while the list is loading. */
  resultSummary: string;
  /** Whether anything is filtered, which is when "Clear filters" appears. */
  hasFilters: boolean;
  onReset: () => void;
  /** Extra controls beside the count, such as an "unpaid only" checkbox. */
  footerExtra?: ReactNode;
}

/**
 * The frame every filter bar shares: a responsive row of controls, then a rule
 * with the result count on the left and "Clear filters" on the right.
 *
 * Each screen supplies its own controls and its own grid, because a screen with
 * six filters does not lay out like one with three.
 */
const FilterPanel = ({
  label,
  gridClassName,
  children,
  resultSummary,
  hasFilters,
  onReset,
  footerExtra,
}: FilterPanelProps) => (
  <section className="mb-6" aria-label={label}>
    <div className={gridClassName}>{children}</div>

    <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-4">
      <span className="flex flex-wrap items-center gap-5">
        <span className="text-[0.85rem] text-ink-muted">{resultSummary}</span>
        {footerExtra}
      </span>

      {hasFilters && (
        <button type="button" className={buttonText} onClick={onReset}>
          <X size={14} aria-hidden="true" /> Clear filters
        </button>
      )}
    </div>
  </section>
);

export default FilterPanel;
