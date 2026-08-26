import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ApiClientError } from "../api/httpClient.ts";
import type { ApiResponse } from "../api/types.ts";

/** Where to go once the record exists, and what to say when we get there. */
export interface CreatedDestination {
  to: string;
  message: string;
}

export interface CreateFormState {
  submitting: boolean;
  error: ApiClientError | null;
  /**
   * Sends the create request, then navigates to the new record.
   *
   * `destination` builds the target from the response, so the caller decides
   * where a new room, user or booking lands. The navigation replaces the form
   * in the history, so the back button does not return to a page that would
   * create a second copy.
   */
  submit: <TData>(
    action: () => Promise<ApiResponse<TData>>,
    destination: (data: TData) => CreatedDestination,
    /** Extra handling for a failure, e.g. clearing a choice the API rejected. */
    onError?: (error: ApiClientError) => void
  ) => Promise<void>;
}

/**
 * The shared behaviour of every "add a record" screen: disable the button,
 * clear the previous error, and either go to the new record or show what went
 * wrong.
 */
export const useCreateForm = (): CreateFormState => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<ApiClientError | null>(null);

  const submit = async <TData>(
    action: () => Promise<ApiResponse<TData>>,
    destination: (data: TData) => CreatedDestination,
    onError?: (error: ApiClientError) => void
  ): Promise<void> => {
    setError(null);
    setSubmitting(true);

    try {
      const response = await action();
      const { to, message } = destination(response.data);
      navigate(to, { replace: true, state: { message } });
    } catch (apiError) {
      setError(apiError as ApiClientError);
      onError?.(apiError as ApiClientError);
    } finally {
      setSubmitting(false);
    }
  };

  return { submitting, error, submit };
};

export default useCreateForm;
