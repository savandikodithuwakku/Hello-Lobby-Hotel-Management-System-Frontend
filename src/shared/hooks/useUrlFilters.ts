import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

/** A partial update to a filter set; omitted keys keep their current value. */
export type FilterPatch<TState> = Partial<Record<keyof TState, string>>;

export interface UrlFilters<TState> {
  /** The current filters, read back out of the URL. */
  filters: TState;
  /** Applies a patch. Any change other than the page returns to page one. */
  updateFilters: (patch: FilterPatch<TState>) => void;
  /** Clears every filter. */
  resetFilters: () => void;
}

/**
 * Keeps a list screen's filters in the URL query string rather than in
 * component state.
 *
 * That way a filtered list can be bookmarked, shared with a colleague, and
 * survives the back button - and the page reloads correctly on a refresh.
 * Every list screen needs exactly this, so the reader function is the only
 * thing a screen supplies.
 */
export const useUrlFilters = <TState>(
  readFilters: (params: URLSearchParams) => TState
): UrlFilters<TState> => {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(() => readFilters(searchParams), [readFilters, searchParams]);

  const updateFilters = useCallback(
    (patch: FilterPatch<TState>) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current);

          Object.entries(patch).forEach(([key, value]) => {
            // An empty value means "no filter", so the key leaves the URL
            // instead of sitting there as `?status=`.
            if (value) next.set(key, String(value));
            else next.delete(key);
          });

          // Narrowing the list while on page 5 would usually show nothing, so
          // any filter change other than the page itself goes back to page one.
          if (!("page" in patch)) next.delete("page");

          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const resetFilters = useCallback(() => setSearchParams({}, { replace: true }), [setSearchParams]);

  return { filters, updateFilters, resetFilters };
};

export default useUrlFilters;
