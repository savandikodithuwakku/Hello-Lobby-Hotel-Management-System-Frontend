import { useState, type FormEvent, type ReactNode } from "react";
import { BedDouble, Coins, Users } from "lucide-react";
import type { RoomType, RoomTypeImage } from "../../../shared/api/types.ts";
import { fieldGroup, fieldHint, fieldLabel, input } from "../../../shared/ui/styles.ts";
import FormField from "../../auth/components/FormField.tsx";
import type { RoomTypePayload } from "../services/rooms.api.ts";
import FacilitiesEditor from "./FacilitiesEditor.tsx";
import ImagesEditor from "./ImagesEditor.tsx";

type EditableImage = Pick<RoomTypeImage, "url" | "alt" | "isPrimary">;

interface RoomTypeFormState {
  name: string;
  description: string;
  basePrice: string;
  maxOccupancy: string;
  facilities: string[];
  images: EditableImage[];
}

const emptyState = (): RoomTypeFormState => ({
  name: "",
  description: "",
  basePrice: "",
  maxOccupancy: "2",
  facilities: [],
  images: [],
});

const fromRoomType = (roomType: RoomType): RoomTypeFormState => ({
  name: roomType.name,
  description: roomType.description,
  basePrice: String(roomType.basePrice),
  maxOccupancy: String(roomType.maxOccupancy),
  facilities: [...roomType.facilities],
  images: roomType.images.map(({ url, alt, isPrimary }) => ({ url, alt, isPrimary })),
});

interface RoomTypeFormProps {
  /** Omitted when creating a new type. */
  roomType?: RoomType;
  onSubmit: (payload: RoomTypePayload) => void;
  /** Rendered under the fields: the submit button and any cancel control. */
  actions: ReactNode;
}

/**
 * The room-type field set, shared by the create and edit screens so the two
 * can never drift apart.
 */
const RoomTypeForm = ({ roomType, onSubmit, actions }: RoomTypeFormProps) => {
  const [form, setForm] = useState<RoomTypeFormState>(
    roomType ? fromRoomType(roomType) : emptyState()
  );

  const setField =
    <TField extends keyof RoomTypeFormState>(field: TField) =>
    (value: RoomTypeFormState[TField]) =>
      setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    onSubmit({
      name: form.name,
      description: form.description,
      basePrice: Number(form.basePrice),
      maxOccupancy: Number(form.maxOccupancy),
      facilities: form.facilities,
      images: form.images,
    });
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <FormField
        label="Name"
        icon={BedDouble}
        value={form.name}
        onChange={setField("name")}
        placeholder="Deluxe"
        maxLength={60}
        required
      />

      <div className={fieldGroup}>
        <label className={fieldLabel} htmlFor="room-type-description">
          Description
        </label>
        <textarea
          id="room-type-description"
          className={`${input} min-h-28 resize-y py-3`}
          value={form.description}
          maxLength={2000}
          placeholder="What a guest can expect from this room type."
          onChange={(event) => setField("description")(event.target.value)}
        />
        <p className={fieldHint}>Shown to guests when they browse room types.</p>
      </div>

      <div className="grid grid-cols-1 gap-x-5 min-[640px]:grid-cols-2">
        <FormField
          label="Base price per night"
          type="number"
          icon={Coins}
          value={form.basePrice}
          onChange={setField("basePrice")}
          min={0}
          hint="Every room of this type charges this unless it sets its own price."
          required
        />

        <FormField
          label="Maximum occupancy"
          type="number"
          icon={Users}
          value={form.maxOccupancy}
          onChange={setField("maxOccupancy")}
          min={1}
          max={20}
          hint="How many guests the room sleeps."
          required
        />
      </div>

      <FacilitiesEditor
        label="Facilities"
        hint="Everything included with this room type. Individual rooms can add extras of their own."
        facilities={form.facilities}
        onChange={setField("facilities")}
      />

      <ImagesEditor images={form.images} onChange={setField("images")} />

      {actions}
    </form>
  );
};

export default RoomTypeForm;
