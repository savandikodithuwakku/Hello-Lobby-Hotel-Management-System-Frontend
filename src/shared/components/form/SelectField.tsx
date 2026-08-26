import { useId } from "react";
import { fieldLabel, select } from "../../ui/styles.ts";
import type { SelectOption } from "../../types/options.ts";

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
const SelectField = ({ label, value, onChange, options, placeholder }: SelectFieldProps) => {
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

export default SelectField;
