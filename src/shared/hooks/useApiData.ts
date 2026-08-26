import { useCallback, useEffect, useState } from "react";
import { ApiClientError } from "../api/httpClient.ts";

export interface ApiDataState<TData> {
  data: TData | null;
  loading: boolean;
  error: ApiClientError | null;
  /** Fetches again, e.g. after an action that changed the record. */
  reload: () => void;
}

/**
 * Loads data from the API and keeps the loading and error state beside it.
 *
 * The important part is the `cancelled` flag: if the filters change while a
 * request is still in flight, the answer to the *old* request must not be
 * written into state - otherwise a fast second search can be overwritten by a
 * slow first one. Every list and detail screen needs that guard, so it is
 * written once here instead of in each screen.
 *
 * `deps` works like the dependency array of `useEffect`: the request is sent
 * again whenever one of the values in it changes.
 */
export const useApiData = <TData>(
  load: () => Promise<TData>,
  deps: readonly unknown[]
): ApiDataState<TData> => {
  const [data, setData] = useState<TData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiClientError | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    load()
      .then((result) => {
        if (cancelled) return;
        setData(result);
        setError(null);
      })
      .catch((apiError: ApiClientError) => {
        if (cancelled) return;
        setError(apiError);
        setData(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // `load` is rebuilt on every render, so the caller's `deps` decide when to
    // refetch - exactly as they would with a hand-written effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadKey]);

  return { data, loading, error, reload };
};

export default useApiData;
