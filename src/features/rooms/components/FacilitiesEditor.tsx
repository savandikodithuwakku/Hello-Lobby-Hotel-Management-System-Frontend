import { useId, useState, type KeyboardEvent } from "react";
import { Plus, X } from "lucide-react";
import {
  buttonSecondary,
  fieldGroup,
  fieldHint,
  fieldLabel,
  input,
} from "../../../shared/ui/styles.ts";

interface FacilitiesEditorProps {
  label: string;
  hint?: string;
  facilities: string[];
  onChange: (facilities: string[]) => void;
  /** Facilities inherited from the room type, shown but not editable here. */
  inherited?: string[];
}

/**
 * Tag-style editor for a facility list. Enter adds, the X removes.
 *
 * Duplicates are rejected on the way in - the API de-duplicates as well, but
 * catching it here means the operator sees why nothing happened.
 */
const FacilitiesEditor = ({
  label,
  hint,
  facilities,
  onChange,
  inherited = [],
}: FacilitiesEditorProps) => {
  const id = useId();
  const [draft, setDraft] = useState("");

  const add = () => {
    const value = draft.trim();
    if (!value) return;

    const exists = [...facilities, ...inherited].some(
      (facility) => facility.toLowerCase() === value.toLowerCase()
    );

    if (!exists) onChange([...facilities, value]);
    setDraft("");
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    // Otherwise Enter would submit the surrounding form.
    event.preventDefault();
    add();
  };

  const remove = (target: string) => onChange(facilities.filter((facility) => facility !== target));

  return (
    <div className={fieldGroup}>
      <label className={fieldLabel} htmlFor={id}>
        {label}
      </label>

      <div className="flex gap-3">
        <input
          id={id}
          type="text"
          className={input}
          value={draft}
          placeholder="Air conditioning, sea view, mini bar..."
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button type="button" className={buttonSecondary} onClick={add} disabled={!draft.trim()}>
          <Plus size={16} aria-hidden="true" /> Add
        </button>
      </div>

      {(facilities.length > 0 || inherited.length > 0) && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {inherited.map((facility) => (
            <li
              key={`inherited-${facility}`}
              className="inline-flex items-center gap-2 border border-line bg-surface-hover px-2.5 py-1 text-[0.8rem] text-ink-muted"
              title="Included with the room type"
            >
              {facility}
              <span className="text-[0.65rem] tracking-[0.04em] text-ink-dim uppercase">type</span>
            </li>
          ))}

          {facilities.map((facility) => (
            <li
              key={facility}
              className="inline-flex items-center gap-2 border border-line bg-canvas px-2.5 py-1 text-[0.8rem] text-ink"
            >
              {facility}
              <button
                type="button"
                className="cursor-pointer text-ink-dim transition-colors duration-300 hover:text-danger"
                onClick={() => remove(facility)}
                aria-label={`Remove ${facility}`}
              >
                <X size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {hint && <p className={fieldHint}>{hint}</p>}
    </div>
  );
};

export default FacilitiesEditor;
