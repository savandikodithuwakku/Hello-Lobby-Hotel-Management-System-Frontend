/**
 * Formatting shared by every module that shows money or dates.
 *
 * Currency lives here rather than in a feature: rooms quote it, reservations
 * total it and payments will settle it, so there is one place to change it.
 */
export const CURRENCY = "LKR";

export const formatPrice = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return "—";

  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: CURRENCY,
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatDateTime = (value: string | null): string => {
  if (!value) return "—";
  return new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
};

export const formatDateOnly = (value: string | null): string => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, { dateStyle: "medium" });
};

/** `yyyy-mm-dd`, the shape every date input and the API expect. */
export const toDateInput = (value: Date | string): string =>
  new Date(value).toISOString().slice(0, 10);

/** Today plus `offset` days, as `yyyy-mm-dd`. */
export const dayFromToday = (offset = 0): string => {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + offset);
  return toDateInput(date);
};

/**
 * "1 room" / "3 rooms". English plurals are mostly a trailing "s", so the
 * irregular ones pass their own plural.
 */
export const pluralize = (count: number, singular: string, plural = `${singular}s`): string =>
  `${count} ${count === 1 ? singular : plural}`;

export const formatNights = (nights: number): string => pluralize(nights, "night");

export const formatOccupancy = (guests: number): string => pluralize(guests, "guest");

/**
 * The line under a filter bar. `null` means the list is still loading, which is
 * why the count is optional rather than defaulting to zero.
 */
export const formatResultCount = (count: number | null, noun: string, plural?: string): string =>
  count === null ? "Loading..." : `${pluralize(count, noun, plural)} found`;
