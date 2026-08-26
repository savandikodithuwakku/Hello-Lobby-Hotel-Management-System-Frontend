import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, DoorOpen, Hash, Layers } from "lucide-react";
import AppShell from "../../../shared/components/AppShell.tsx";
import useApiData from "../../../shared/hooks/useApiData.ts";
import useCreateForm from "../../../shared/hooks/useCreateForm.ts";
import {
  card,
  fieldGroup,
  fieldHint,
  fieldLabel,
  link,
  select,
} from "../../../shared/ui/styles.ts";
import AlertMessage from "../../auth/components/AlertMessage.tsx";
import FormField from "../../auth/components/FormField.tsx";
import SubmitButton from "../../auth/components/SubmitButton.tsx";
import { roomTypesApi, roomsApi } from "../services/rooms.api.ts";
import { formatOccupancy, formatPrice } from "../constants/rooms.ts";
import FacilitiesEditor from "../components/FacilitiesEditor.tsx";

const RoomCreatePage = () => {
  const [roomNumber, setRoomNumber] = useState("");
  const [roomType, setRoomType] = useState("");
  const [floor, setFloor] = useState("1");
  const [price, setPrice] = useState("");
  const [facilities, setFacilities] = useState<string[]>([]);

  const { submitting, error, submit } = useCreateForm();

  // Only active types can take new rooms, so those are the only ones offered.
  const { data: types } = useApiData(
    () =>
      roomTypesApi
        .list({ isActive: "true", limit: 100, sort: "name" })
        .then((r) => r.data.roomTypes),
    []
  );

  const roomTypes = types ?? [];
  const selectedType = roomTypes.find((type) => type.id === roomType) || null;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    return submit(
      () =>
        roomsApi.create({
          roomNumber,
          roomType,
          floor: Number(floor),
          // An empty box means "charge whatever the type charges".
          price: price.trim() === "" ? null : Number(price),
          facilities,
        }),
      ({ room }) => ({
        to: `/rooms/${room.id}`,
        message: `Room ${room.roomNumber} added to the inventory.`,
      })
    );
  };

  return (
    <AppShell title="Add room">
      <div className="mb-5">
        <Link to="/rooms" className={`${link} inline-flex items-center gap-1.5`}>
          <ArrowLeft size={16} aria-hidden="true" /> Back to rooms
        </Link>
      </div>

      <div className={`${card} max-w-[720px]`}>
        {roomTypes.length === 0 && !error && (
          <AlertMessage
            message="No active room types yet. Create a room type first - it holds the price, occupancy and facilities this room will inherit."
            variant="error"
          />
        )}

        <AlertMessage message={error?.message} errors={error?.errors} />

        <form onSubmit={handleSubmit} noValidate>
          <FormField
            label="Room number"
            icon={Hash}
            value={roomNumber}
            onChange={setRoomNumber}
            placeholder="205"
            hint="Letters, digits and hyphens. Stored in upper case and unique across the hotel."
            maxLength={10}
            required
          />

          <div className={fieldGroup}>
            <label className={fieldLabel} htmlFor="room-type">
              Room type
            </label>
            <select
              id="room-type"
              className={select}
              value={roomType}
              onChange={(event) => setRoomType(event.target.value)}
              required
            >
              <option value="">Choose a room type</option>
              {roomTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name} — {formatPrice(type.basePrice)}, {formatOccupancy(type.maxOccupancy)}
                </option>
              ))}
            </select>
            {selectedType && (
              <p className={fieldHint}>
                Inherits {formatPrice(selectedType.basePrice)} per night, sleeps{" "}
                {selectedType.maxOccupancy}
                {selectedType.facilities.length > 0 &&
                  `, and includes ${selectedType.facilities.join(", ")}`}
                .
              </p>
            )}
          </div>

          <FormField
            label="Floor"
            type="number"
            icon={Layers}
            value={floor}
            onChange={setFloor}
            hint="Use 0 for the ground floor and a negative number for a basement."
            required
          />

          <FormField
            label="Price per night (optional)"
            type="number"
            value={price}
            onChange={setPrice}
            placeholder={selectedType ? String(selectedType.basePrice) : "Follows the room type"}
            hint="Leave empty to charge the room type's base price. Set a value only when this particular room is priced differently."
            min={0}
          />

          <FacilitiesEditor
            label="Extra facilities (optional)"
            hint="Only what this room has beyond its type - a balcony, a corner view. Everything the type includes already applies."
            facilities={facilities}
            onChange={setFacilities}
            inherited={selectedType?.facilities ?? []}
          />

          <SubmitButton loading={submitting} icon={DoorOpen} loadingLabel="Adding room...">
            Add room
          </SubmitButton>
        </form>
      </div>
    </AppShell>
  );
};

export default RoomCreatePage;
