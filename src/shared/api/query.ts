/**
 * Builds the query string for a list request.
 *
 * Empty filters are dropped, so the URL only carries what the user actually
 * chose and two identical searches produce an identical URL. Every feature's
 * API module used to keep its own copy of this; this is the one definition.
 */
export const toQueryString = (params: object = {}): string => {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  });

  const query = search.toString();
  return query ? `?${query}` : "";
};

export default toQueryString;
