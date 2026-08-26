import { useId } from "react";
import { fieldLabel, select } from "../../ui/styles.ts";

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
const NumberField = ({ label, value, onChange, placeholder = "Any", min }: NumberFieldProps) => {
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

export default NumberField;
