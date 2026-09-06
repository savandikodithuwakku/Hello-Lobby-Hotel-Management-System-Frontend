import { useEffect, useId, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { Eye, EyeOff, Search, X, type LucideIcon } from "lucide-react";
import {
  buttonText,
  fieldGroup,
  fieldHint,
  fieldLabel,
  input,
  inputWithIcon,
  select,
} from "../ui/styles.ts";
import type { SelectOption } from "../types.ts";

/**
 * Every labelled control the app puts in a form or a filter bar.
 *
 * They live in one file because they are variations on a single idea - a label,
 * a control, and a change handler - and because six files of thirty lines each
 * made a reader open six tabs to compare controls that should look and behave
 * alike. `FilterPanel` is here too: it is the frame these controls sit in.
 */

/* ------------------------------------------------------------- text input */

interface FormFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "id" | "className"> {
  label: string;
  icon?: LucideIcon;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
}

/**
 * Labelled input with an optional leading icon and a password visibility
 * toggle, so every auth form stays consistent and accessible.
 */
export const FormField = ({
  label,
  type = "text",
  icon: Icon,
  hint,
  value,
  onChange,
  ...inputProps
}: FormFieldProps) => {
  const id = useId();
  const [revealed, setRevealed] = useState(false);
  const isPassword = type === "password";

  return (
    <div className={fieldGroup}>
      <label className={fieldLabel} htmlFor={id}>
        {label}
      </label>
      <div className="relative flex items-center">
        {Icon && (
          <Icon
            className="pointer-events-none absolute left-4 text-ink-dim"
            size={20}
            aria-hidden="true"
          />
        )}
        <input
          id={id}
          type={isPassword && revealed ? "text" : type}
          className={Icon ? inputWithIcon : input}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          {...inputProps}
        />
        {isPassword && (
          <button
            type="button"
            className="absolute right-4 flex cursor-pointer items-center text-ink-dim transition-colors duration-300 hover:text-ink"
            onClick={() => setRevealed((current) => !current)}
            aria-label={revealed ? "Hide password" : "Show password"}
          >
            {revealed ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
      {hint && <p className={fieldHint}>{hint}</p>}
    </div>
  );
};

/* ---------------------------------------------------------------- search */

interface SearchFieldProps {
  label: string;
  placeholder: string;
  /** The value currently in the URL, i.e. the search that has been applied. */
  value: string;
  onChange: (value: string) => void;
  /** How long to wait after the last keystroke before searching. */
  delayMs?: number;
}

/**
 * A debounced search box.
 *
 * What the operator types is held locally and only handed upwards once they
 * stop typing, so a five-letter room number is one request rather than five.
 * The local value follows the applied one whenever the parent changes it, which
 * is what makes "Clear filters" empty the box.
 */
export const SearchField = ({
  label,
  placeholder,
  value,
  onChange,
  delayMs = 350,
}: SearchFieldProps) => {
  const id = useId();
  const [draft, setDraft] = useState(value);

  // Keep the box in step when the parent resets or replaces the filters.
  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    if (draft === value) return undefined;

    const timer = setTimeout(() => onChange(draft), delayMs);
    return () => clearTimeout(timer);
  }, [draft, value, delayMs, onChange]);

  return (
    <div>
      <label className={fieldLabel} htmlFor={id}>
        {label}
      </label>
      <div className="relative flex items-center">
        <Search
          className="pointer-events-none absolute left-4 text-ink-dim"
          size={18}
          aria-hidden="true"
        />
        <input
          id={id}
          type="search"
          className={inputWithIcon}
          placeholder={placeholder}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
      </div>
    </div>
  );
};

/* -------------------------------------------------------------- dropdown */

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  /** The "no filter" entry shown first. Omit it for a required choice. */
  placeholder?: string;
}

/**
 * A labelled dropdown filter.
 *
 * Filters apply as soon as they change - unlike the search box there is nothing
 * to debounce, because picking an option is one deliberate action.
 */
export const SelectField = ({
  label,
  value,
  onChange,
  options,
  placeholder,
}: SelectFieldProps) => {
  const id = useId();

  return (
    <div>
      <label className={fieldLabel} htmlFor={id}>
        {label}
      </label>
      <select
        id={id}
        className={select}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

/* ---------------------------------------------------------------- number */

interface NumberFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  min?: number;
}

/**
 * A whole-number filter such as a floor or a party size.
 *
 * It carries the `select` class rather than `input` so it lines up with the
 * dropdowns beside it in a filter row.
 */
export const NumberField = ({
  label,
  value,
  onChange,
  placeholder = "Any",
  min,
}: NumberFieldProps) => {
  const id = useId();

  return (
    <div>
      <label className={fieldLabel} htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        type="number"
        className={select}
        placeholder={placeholder}
        min={min}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
};

/* ------------------------------------------------------------------ date */

interface DateFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
}

/** A `yyyy-mm-dd` date filter, styled to match the dropdowns beside it. */
export const DateField = ({ label, value, onChange, min }: DateFieldProps) => {
  const id = useId();

  return (
    <div>
      <label className={fieldLabel} htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        type="date"
        className={select}
        min={min}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
};

/* ---------------------------------------------------------- filter frame */

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
export const FilterPanel = ({
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
