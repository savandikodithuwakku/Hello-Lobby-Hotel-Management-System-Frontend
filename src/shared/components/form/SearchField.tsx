import { useEffect, useId, useState } from "react";
import { Search } from "lucide-react";
import { fieldLabel, inputWithIcon } from "../../ui/styles.ts";

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
const SearchField = ({ label, placeholder, value, onChange, delayMs = 350 }: SearchFieldProps) => {
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

export default SearchField;
