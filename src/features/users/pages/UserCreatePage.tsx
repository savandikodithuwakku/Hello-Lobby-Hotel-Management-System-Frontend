import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Phone, User, UserPlus } from "lucide-react";
import { ApiClientError } from "../../../shared/api/httpClient.ts";
import type { Address, Role } from "../../../shared/api/types.ts";
import AppShell from "../../../shared/components/AppShell.tsx";
import {
  card,
  fieldGroup,
  fieldHint,
  fieldLabel,
  input,
  link,
  select,
} from "../../../shared/ui/styles.ts";
import AlertMessage from "../../auth/components/AlertMessage.tsx";
import FormField from "../../auth/components/FormField.tsx";
import SubmitButton from "../../auth/components/SubmitButton.tsx";
import { useAuthUser } from "../../auth/hooks/useAuth.ts";
import { ROLES, ROLE_LEVELS } from "../../auth/constants/rbac.ts";
import usersApi from "../services/users.api.ts";
import { ADDRESS_FIELDS, EMPTY_ADDRESS, ROLE_OPTIONS } from "../constants/users.ts";

interface CreateForm {
  name: string;
  email: string;
  phone: string;
  role: Role;
  address: Address;
}

const UserCreatePage = () => {
  const navigate = useNavigate();
  const { user: actor } = useAuthUser();

  const [form, setForm] = useState<CreateForm>({
    name: "",
    email: "",
    phone: "",
    role: ROLES.STAFF,
    address: { ...EMPTY_ADDRESS },
  });
  const [error, setError] = useState<ApiClientError | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const setField = (field: "name" | "email" | "phone") => (value: string) =>
    setForm((current) => ({ ...current, [field]: value }));

  const setAddressField = (field: keyof Address) => (value: string) =>
    setForm((current) => ({ ...current, address: { ...current.address, [field]: value } }));

  // The API refuses a role at or above the actor's own level; filtering the
  // dropdown means they never get that far.
  const assignableRoles = ROLE_OPTIONS.filter(
    (option) => ROLE_LEVELS[option.value] < ROLE_LEVELS[actor.role]
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const response = await usersApi.create({
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        role: form.role,
        address: form.address,
      });

      navigate(`/users/${response.data.user.id}`, {
        replace: true,
        state: { message: `Invitation sent to ${response.data.user.email}.` },
      });
    } catch (apiError) {
      setError(apiError as ApiClientError);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell title="Add user">
      <div className="mb-5">
        <Link to="/users" className={`${link} inline-flex items-center gap-1.5`}>
          <ArrowLeft size={16} aria-hidden="true" /> Back to users
        </Link>
      </div>

      <div className={`${card} max-w-[720px]`}>
        <p className="mb-6 text-sm text-ink-muted">
          The new account starts as <strong>pending verification</strong>. No password is set here
          &mdash; HelloLobby emails an invitation link and the person chooses their own.
        </p>

        <AlertMessage message={error?.message} errors={error?.errors} />

        <form onSubmit={handleSubmit} noValidate>
          <FormField
            label="Full name"
            icon={User}
            value={form.name}
            onChange={setField("name")}
            autoComplete="name"
            required
          />

          <FormField
            label="Email"
            type="email"
            icon={Mail}
            value={form.email}
            onChange={setField("email")}
            autoComplete="email"
            required
          />

          <FormField
            label="Phone"
            type="tel"
            icon={Phone}
            value={form.phone}
            onChange={setField("phone")}
            autoComplete="tel"
          />

          <div className={fieldGroup}>
            <label className={fieldLabel} htmlFor="new-user-role">
              Role
            </label>
            <select
              id="new-user-role"
              className={select}
              value={form.role}
              onChange={(event) =>
                setForm((current) => ({ ...current, role: event.target.value as Role }))
              }
              required
            >
              {assignableRoles.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <p className={fieldHint}>
              You can only assign roles below your own level, so no one can promote themselves.
            </p>
          </div>

          <fieldset className="mb-6 border border-line p-5">
            <legend className={`${fieldLabel} px-2`}>Address (optional)</legend>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-x-4">
              {ADDRESS_FIELDS.map(({ key, label }) => (
                <div className={fieldGroup} key={key}>
                  <label className={fieldLabel} htmlFor={`new-user-${key}`}>
                    {label}
                  </label>
                  <input
                    id={`new-user-${key}`}
                    type="text"
                    className={input}
                    value={form.address[key]}
                    onChange={(event) => setAddressField(key)(event.target.value)}
                  />
                </div>
              ))}
            </div>
          </fieldset>

          <SubmitButton loading={submitting} icon={UserPlus} loadingLabel="Sending invitation...">
            Create user and send invitation
          </SubmitButton>
        </form>
      </div>
    </AppShell>
  );
};

export default UserCreatePage;
