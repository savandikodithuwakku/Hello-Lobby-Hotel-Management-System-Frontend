import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Pagination as PaginationData } from "../api/types.ts";
import { buttonSecondary } from "../ui/styles.ts";

interface PaginationProps {
  pagination: PaginationData | null;
  onPageChange: (page: number) => void;
  disabled: boolean;
}

const READOUT = "text-[0.85rem] text-ink-muted tabular-nums";

/**
 * Page controls for a server-paginated list. Deliberately simple: previous,
 * next and a position readout, which is all a table this size needs.
 */
const Pagination = ({ pagination, onPageChange, disabled }: PaginationProps) => {
  if (!pagination || pagination.total === 0) return null;

  const { page, limit, total, totalPages } = pagination;
  const first = (page - 1) * limit + 1;
  const last = Math.min(page * limit, total);

  return (
    <nav className="mt-5 flex flex-wrap items-center justify-between gap-4" aria-label="Pagination">
      <p className={READOUT}>
        Showing <strong>{first}</strong>&ndash;<strong>{last}</strong> of <strong>{total}</strong>
      </p>

      <div className="flex items-center gap-3">
        <button
          type="button"
          className={buttonSecondary}
          onClick={() => onPageChange(page - 1)}
          disabled={disabled || page <= 1}
        >
          <ChevronLeft size={16} aria-hidden="true" /> Previous
        </button>

        <span className={READOUT}>
          Page {page} of {totalPages}
        </span>

        <button
          type="button"
          className={buttonSecondary}
          onClick={() => onPageChange(page + 1)}
          disabled={disabled || page >= totalPages}
        >
          Next <ChevronRight size={16} aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
};

export default Pagination;
