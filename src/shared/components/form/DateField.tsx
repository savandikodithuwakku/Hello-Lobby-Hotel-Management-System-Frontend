import { useId } from "react";
import { fieldLabel, select } from "../../ui/styles.ts";

interface DateFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
}

/** A `yyyy-mm-dd` date filter, styled to match the dropdowns beside it. */
const DateField = ({ label, value, onChange, min }: DateFieldProps) => {
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

export default DateField;
