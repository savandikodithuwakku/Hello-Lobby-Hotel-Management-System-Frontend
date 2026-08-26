import { useCallback, useState } from "react";
import { ApiClientError } from "../api/httpClient.ts";
import type { ApiResponse } from "../api/types.ts";

export interface AsyncActionState {
  /** True while an action is in flight, so buttons can disable themselves. */
  busy: boolean;
  error: ApiClientError | null;
  /** The success message from the last action, shown as a green banner. */
  notice: string | null;
  setError: (error: ApiClientError | null) => void;
  setNotice: (notice: string | null) => void;
  /**
   * Runs one write against the API.
   *
   * `apply` receives the response payload so the screen can put the updated
   * record into its own state. The banner text is the API's own message unless
   * `message` overrides it. Returns whether the call succeeded, which is what
   * a caller needs to decide whether to close an editor or navigate away.
   */
  run: <TData>(
    action: () => Promise<ApiResponse<TData>>,
    apply?: (data: TData) => void,
    message?: string
  ) => Promise<boolean>;
}

/**
 * The write half of a detail screen.
 *
 * Save, deactivate, restore, change status, record a payment - every one of
 * them has to disable the buttons, clear the last error, show either a success
 * banner or the API's error, and re-enable the buttons afterwards. Each detail
 * page used to spell that out for itself; this is the single version.
 */
export const useAsyncAction = (initialNotice: string | null = null): AsyncActionState => {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<ApiClientError | null>(null);
  const [notice, setNotice] = useState<string | null>(initialNotice);

  const run = useCallback(
    async <TData>(
      action: () => Promise<ApiResponse<TData>>,
      apply?: (data: TData) => void,
      message?: string
    ): Promise<boolean> => {
      setBusy(true);
      // The previous failure is no longer relevant once a new attempt starts.
      setError(null);

      try {
        const response = await action();
        apply?.(response.data);
        setNotice(message ?? response.message);
        return true;
      } catch (apiError) {
        setError(apiError as ApiClientError);
        return false;
      } finally {
        setBusy(false);
      }
    },
    []
  );

  return { busy, error, notice, setError, setNotice, run };
};

export default useAsyncAction;
