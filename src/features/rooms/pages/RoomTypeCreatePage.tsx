import { Link } from "react-router-dom";
import { ArrowLeft, BedDouble } from "lucide-react";
import AppShell from "../../../shared/components/AppShell.tsx";
import useCreateForm from "../../../shared/hooks/useCreateForm.ts";
import { card, link } from "../../../shared/ui/styles.ts";
import AlertMessage from "../../auth/components/AlertMessage.tsx";
import SubmitButton from "../../auth/components/SubmitButton.tsx";
import { roomTypesApi, type RoomTypePayload } from "../services/rooms.api.ts";
import RoomTypeForm from "../components/RoomTypeForm.tsx";

const RoomTypeCreatePage = () => {
  const { submitting, error, submit } = useCreateForm();

  const handleSubmit = (payload: RoomTypePayload) =>
    submit(
      () => roomTypesApi.create(payload),
      ({ roomType }) => ({
        to: `/room-types/${roomType.id}`,
        message: `${roomType.name} added to the catalogue.`,
      })
    );

  return (
    <AppShell title="Add room type">
      <div className="mb-5">
        <Link to="/room-types" className={`${link} inline-flex items-center gap-1.5`}>
          <ArrowLeft size={16} aria-hidden="true" /> Back to room types
        </Link>
      </div>

      <div className={`${card} max-w-[720px]`}>
        <p className="mb-6 text-sm text-ink-muted">
          Room types are the catalogue behind the inventory. Create the type first, then add the
          individual rooms that belong to it.
        </p>

        <AlertMessage message={error?.message} errors={error?.errors} />

        <RoomTypeForm
          onSubmit={handleSubmit}
          actions={
            <SubmitButton loading={submitting} icon={BedDouble} loadingLabel="Creating...">
              Create room type
            </SubmitButton>
          }
        />
      </div>
    </AppShell>
  );
};

export default RoomTypeCreatePage;
