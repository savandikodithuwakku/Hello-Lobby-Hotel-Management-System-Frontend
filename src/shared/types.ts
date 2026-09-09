/**
 * The small shared shapes and values that every feature needs.
 *
 * A dropdown option, the state carried between screens, and the page size the
 * lists use. None of the three is big enough to be worth its own file and its
 * own import line, and keeping them together means a screen reaches for one
 * import rather than three.
 */

/* ----------------------------------------------------------------- paging */

/**
 * How many rows every list screen asks the API for.
 *
 * One value for the whole app: the tables are the same size everywhere, so
 * separate copies of this number only invited them to drift apart.
 */
export const PAGE_SIZE = 20;

/* ---------------------------------------------------------------- options */

/**
 * One entry in a `<select>`.
 *
 * Every module builds dropdowns from lists of these - roles, statuses, sort
 * orders - so the shape is declared once instead of in each feature's
 * constants file.
 */
export interface SelectOption<TValue extends string = string> {
  value: TValue;
  label: string;
}

/**
 * Turns a `{ value: label }` map into the option list a `<select>` needs,
 * keeping the order of the map.
 */
export const toSelectOptions = <TValue extends string>(
  labels: Record<TValue, string>
): SelectOption<TValue>[] =>
  (Object.entries(labels) as [TValue, string][]).map(([value, label]) => ({ value, label }));

/* ------------------------------------------------------------ route state */

/**
 * State carried between screens through React Router's `location.state`.
 *
 * Router types it as `unknown`, so every reader casts to this shape rather
 * than reaching into an untyped object.
 */
export interface RouteState {
  /** Where a guard interrupted the user, so sign-in can send them back. */
  from?: { pathname: string };
  /** A one-off notice to show on the screen being navigated to. */
  message?: string;
  /** Pre-fills the address box on the resend-verification screen. */
  email?: string;
}

/* ---------------------------------------------------------------- filters */

/**
 * A partial update to a list screen's filter set. Omitted keys keep the value
 * they already have in the URL.
 */
export type FilterPatch<TState> = Partial<Record<keyof TState, string>>;
