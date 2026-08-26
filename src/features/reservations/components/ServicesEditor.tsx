import { useState } from "react";
import { Plus, X } from "lucide-react";
import {
  buttonSecondary,
  fieldGroup,
  fieldHint,
  fieldLabel,
  input,
} from "../../../shared/ui/styles.ts";
import { formatPrice } from "../../../shared/ui/format.ts";
import type { ServiceLine } from "../services/reservations.api.ts";

interface ServicesEditorProps {
  services: ServiceLine[];
  onChange: (services: ServiceLine[]) => void;
  disabled?: boolean;
}

const lineTotal = (service: ServiceLine) => service.unitPrice * service.quantity;

/**
 * Extras billed on top of the room: airport pickup, breakfast, a late
 * checkout. Each line is name, unit price and quantity; the API recalculates
 * the totals from these, so nothing here is trusted as a total.
 */
const ServicesEditor = ({ services, onChange, disabled = false }: ServicesEditorProps) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("1");

  const add = () => {
    const trimmed = name.trim();
    const unitPrice = Number(price);

    if (!trimmed || !Number.isFinite(unitPrice) || unitPrice < 0) return;

    onChange([
      ...services,
      { name: trimmed, unitPrice, quantity: Math.max(1, Math.floor(Number(quantity) || 1)) },
    ]);
    setName("");
    setPrice("");
    setQuantity("1");
  };

  const remove = (index: number) => onChange(services.filter((_, i) => i !== index));

  const total = services.reduce((sum, service) => sum + lineTotal(service), 0);

  return (
    <div className={fieldGroup}>
      <span className={fieldLabel}>Additional services</span>

      {services.length > 0 && (
        <ul className="mb-3 flex flex-col gap-2">
          {services.map((service, index) => (
            <li
              key={`${service.name}-${index}`}
              className="flex items-center justify-between gap-3 border border-line bg-canvas px-3 py-2 text-sm"
            >
              <span className="min-w-0 truncate">
                {service.name}
                <span className="ml-2 text-ink-dim">
                  {formatPrice(service.unitPrice)} × {service.quantity}
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-3">
                <strong className="tabular-nums">{formatPrice(lineTotal(service))}</strong>
                {!disabled && (
                  <button
                    type="button"
                    className="cursor-pointer text-ink-dim transition-colors duration-300 hover:text-danger"
                    onClick={() => remove(index)}
                    aria-label={`Remove ${service.name}`}
                  >
                    <X size={14} />
                  </button>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}

      {!disabled && (
        <div className="grid grid-cols-1 gap-3 min-[720px]:grid-cols-[2fr_1fr_80px_auto]">
          <input
            type="text"
            className={input}
            value={name}
            placeholder="Airport pickup"
            onChange={(event) => setName(event.target.value)}
            aria-label="Service name"
          />
          <input
            type="number"
            min={0}
            className={input}
            value={price}
            placeholder="Price"
            onChange={(event) => setPrice(event.target.value)}
            aria-label="Unit price"
          />
          <input
            type="number"
            min={1}
            className={input}
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            aria-label="Quantity"
          />
          <button
            type="button"
            className={buttonSecondary}
            onClick={add}
            disabled={!name.trim() || price === ""}
          >
            <Plus size={16} aria-hidden="true" /> Add
          </button>
        </div>
      )}

      <p className={fieldHint}>
        {services.length === 0
          ? "Optional extras billed with the room."
          : `Services subtotal: ${formatPrice(total)}`}
      </p>
    </div>
  );
};

export default ServicesEditor;
