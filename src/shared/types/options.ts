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
