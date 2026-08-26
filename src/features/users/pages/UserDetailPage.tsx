import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BedDouble,
  MonitorSmartphone,
  Pencil,
  Save,
  ShieldCheck,
  Trash2,
  UserMinus,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";
import { ApiClientError } from "../../../shared/api/httpClient.ts";
import type { Address, Role, User, UserStatus } from "../../../shared/api/types.ts";
import AppShell from "../../../shared/components/AppShell.tsx";
import DetailRow, { DetailList } from "../../../shared/components/DetailRow.tsx";
import { column, twoColumnGrid } from "../../../shared/ui/layout.ts";
import {
  actionRow,
  buttonDanger,
  buttonPrimary,
  buttonSecondary,
  buttonStack,
  card,
  cardTitle,
  fieldGroup,
  fieldHint,
  fieldLabel,
  input,
  link,
  select,
  statusPill,
  statusPillBase,
} from "../../../shared/ui/styles.ts";
import AlertMessage from "../../auth/components/AlertMessage.tsx";
import AuthLoadingScreen from "../../auth/components/AuthLoadingScreen.tsx";
import RequirePermission from "../../auth/components/RequirePermission.tsx";
import { PERMISSIONS, ROLE_LABELS, ROLE_LEVELS } from "../../auth/constants/rbac.ts";
import { useAuthUser } from "../../auth/hooks/useAuth.ts";
import type { RouteState } from "../../auth/types.ts";
import usersApi from "../services/users.api.ts";
import ConfirmPanel from "../../../shared/components/ConfirmPanel.tsx";
import { UnverifiedFlag } from "../components/UserTable.tsx";
import {
  ADDRESS_FIELDS,
  EMPTY_ADDRESS,
  ROLE_OPTIONS,
  STATUS_LABELS,
  STATUS_OPTIONS,
  formatAddress,
  formatDate,
  formatDateOnly,
} from "../constants/users.ts";

interface EditableForm {
  name: string;
  phone: string;
  address: Address;
}

/** Which destructive action is awaiting confirmation, if any. */
type Confirming = "sessions" | "deactivate" | "delete" | null;

const toEditableForm = (user: User): EditableForm => ({
  name: user.name,
  phone: user.phone || "",
  address: {
    ...EMPTY_ADDRESS,
    ...Object.fromEntries(
      Object.entries(user.address || {}).map(([key, value]) => [key, value || ""])
    ),
  },
});

/** Placeholder for a module that has not been built yet. */
const PendingModule = ({
  icon: Icon,
  title,
  hint,
}: {
  icon: LucideIcon;
  title: string;
  hint: string;
}) => (
  <div className="mt-3 flex items-start gap-4 border border-dashed border-line p-4 first:mt-0">
    <Icon size={22} aria-hidden="true" className="text-ink-dim" />
    <div>
      <p className="text-[0.92rem] font-semibold text-ink-muted">{title}</p>
      <p className="text-[0.85rem] text-ink-dim">{hint}</p>
    </div>
  </div>
);

const UserDetailPage = () => {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user: actor } = useAuthUser();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiClientError | null>(null);
  const [notice, setNotice] = useState<string | null>(
    (location.state as RouteState | null)?.message || null
  );

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<EditableForm | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState<Confirming>(null);

  const load = useCallback(() => {
    setLoading(true);
    usersApi
      .get(id)
      .then((response) => {
        setUser(response.data.user);
        setError(null);
      })
      .catch((apiError: ApiClientError) => setError(apiError))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(load, [load]);

  // An actor may only act on accounts strictly below their own level, and
  // never on their own record through these admin screens.
  const isSelf = actor.id === id;
  const canManage = user !== null && !isSelf && ROLE_LEVELS[actor.role] > ROLE_LEVELS[user.role];

  const run = async (
    action: () => Promise<{ data: { user?: User } | null }>,
    successMessage: string
  ): Promise<boolean> => {
    setBusy(true);
    setError(null);
    try {
      const response = await action();
      if (response.data?.user) setUser(response.data.user);
      setNotice(successMessage);
      setConfirming(null);
      return true;
    } catch (apiError) {
      setError(apiError as ApiClientError);
      return false;
    } finally {
      setBusy(false);
    }
  };

  const startEditing = () => {
    if (!user) return;
    setForm(toEditableForm(user));
    setEditing(true);
    setNotice(null);
  };

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form) return;

    const saved = await run(
      () =>
        usersApi.update(id, {
          name: form.name,
          phone: form.phone || null,
          address: form.address,
        }),
      "Profile updated."
    );
    if (saved) setEditing(false);
  };

  const deletePermanently = async () => {
    if (!user) return;
    setBusy(true);
    setError(null);
    try {
      await usersApi.remove(id, user.email);
      navigate("/users", {
        replace: true,
        state: { message: `${user.name} was permanently deleted.` },
      });
    } catch (apiError) {
      setError(apiError as ApiClientError);
      setBusy(false);
    }
  };

  if (loading) return <AuthLoadingScreen message="Loading user..." />;

  if (!user) {
    return (
      <AppShell title="User">
        <div className={card}>
          <AlertMessage message={error?.message || "This user could not be loaded."} />
          <Link to="/users" className={`${link} inline-flex items-center gap-1.5`}>
            <ArrowLeft size={16} aria-hidden="true" /> Back to users
          </Link>
        </div>
      </AppShell>
    );
  }

  const assignableRoles = ROLE_OPTIONS.filter(
    (option) => ROLE_LEVELS[option.value] < ROLE_LEVELS[actor.role]
  );

  return (
    <AppShell title={user.name}>
      <div className="mb-5">
        <Link to="/users" className={`${link} inline-flex items-center gap-1.5`}>
          <ArrowLeft size={16} aria-hidden="true" /> Back to users
        </Link>
      </div>

      <AlertMessage message={error?.message} errors={error?.errors} />
      {notice && <AlertMessage variant="success" message={notice} />}

      {isSelf && (
        <div className="mb-8 border-l-2 border-brand px-5 py-4 text-sm text-ink-muted">
          You are looking at your own account. Use{" "}
          <Link to="/account/change-password" className={link}>
            your account settings
          </Link>{" "}
          to change it &mdash; administrators cannot edit themselves through this screen.
        </div>
      )}

      <div className={twoColumnGrid}>
        <div className={column}>
          {/* ---------------------------------------------- profile */}
          <section className={card}>
            <div className="mb-6 flex items-center justify-between gap-4">
              <h2 className={`${cardTitle} mb-0`}>Profile</h2>
              {!editing && canManage && (
                <RequirePermission permissions={[PERMISSIONS.USER_UPDATE]}>
                  <button type="button" className={buttonSecondary} onClick={startEditing}>
                    <Pencil size={16} aria-hidden="true" /> Edit
                  </button>
                </RequirePermission>
              )}
            </div>

            {editing && form ? (
              <form onSubmit={saveProfile} noValidate>
                <div className={fieldGroup}>
                  <label className={fieldLabel} htmlFor="edit-name">
                    Full name
                  </label>
                  <input
                    id="edit-name"
                    className={input}
                    value={form.name}
                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                    required
                  />
                </div>

                <div className={fieldGroup}>
                  <label className={fieldLabel} htmlFor="edit-phone">
                    Phone
                  </label>
                  <input
                    id="edit-phone"
                    className={input}
                    value={form.phone}
                    onChange={(event) => setForm({ ...form, phone: event.target.value })}
                  />
                </div>

                <fieldset className="mb-6 border border-line p-5">
                  <legend className={`${fieldLabel} px-2`}>Address</legend>
                  <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-x-4">
                    {ADDRESS_FIELDS.map(({ key, label }) => (
                      <div className={fieldGroup} key={key}>
                        <label className={fieldLabel} htmlFor={`edit-${key}`}>
                          {label}
                        </label>
                        <input
                          id={`edit-${key}`}
                          className={input}
                          value={form.address[key]}
                          onChange={(event) =>
                            setForm({
                              ...form,
                              address: { ...form.address, [key]: event.target.value },
                            })
                          }
                        />
                      </div>
                    ))}
                  </div>
                </fieldset>

                <div className={actionRow}>
                  <button
                    type="button"
                    className={buttonSecondary}
                    onClick={() => setEditing(false)}
                    disabled={busy}
                  >
                    <X size={16} aria-hidden="true" /> Cancel
                  </button>
                  <button type="submit" className={buttonPrimary} disabled={busy}>
                    <Save size={16} aria-hidden="true" /> {busy ? "Saving..." : "Save changes"}
                  </button>
                </div>
              </form>
            ) : (
              <DetailList>
                <DetailRow label="Email">
                  {user.email}
                  {!user.emailVerified && <UnverifiedFlag />}
                </DetailRow>
                <DetailRow label="Phone">{user.phone || "—"}</DetailRow>
                <DetailRow label="Address">{formatAddress(user.address) || "—"}</DetailRow>
                <DetailRow label="Role">{ROLE_LABELS[user.role] || user.role}</DetailRow>
                <DetailRow label="Status">
                  <span className={`${statusPillBase} ${statusPill[user.status]}`}>
                    {STATUS_LABELS[user.status] || user.status}
                  </span>
                </DetailRow>
                <DetailRow label="Permissions">{user.permissions?.length ?? 0} granted</DetailRow>
                <DetailRow label="Last login">{formatDate(user.lastLoginAt)}</DetailRow>
                <DetailRow label="Created">{formatDateOnly(user.createdAt)}</DetailRow>
              </DetailList>
            )}
          </section>

          {/* ------------------------------------ deferred modules */}
          <section className={card}>
            <h2 className={cardTitle}>Activity</h2>
            <PendingModule
              icon={BedDouble}
              title="Reservation history"
              hint="Appears here once the Reservations module is built."
            />
            <PendingModule
              icon={Wallet}
              title="Spending"
              hint="Total and per-booking spend arrive with the Payments module."
            />
          </section>
        </div>

        {/* -------------------------------------------- admin actions */}
        <div className={column}>
          <section className={card}>
            <h2 className={cardTitle}>Access</h2>

            <RequirePermission
              permissions={[PERMISSIONS.USER_MANAGE_ROLE]}
              fallback={<p className={fieldHint}>You cannot change roles.</p>}
            >
              <div className={fieldGroup}>
                <label className={fieldLabel} htmlFor="user-role">
                  Role
                </label>
                <select
                  id="user-role"
                  className={select}
                  value={user.role}
                  disabled={!canManage || busy}
                  onChange={(event) =>
                    run(
                      () => usersApi.changeRole(id, event.target.value as Role),
                      "Role updated. Every session for this account was signed out."
                    )
                  }
                >
                  {assignableRoles.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                  {!assignableRoles.some((option) => option.value === user.role) && (
                    <option value={user.role}>{ROLE_LABELS[user.role] || user.role}</option>
                  )}
                </select>
                <p className={fieldHint}>
                  Changing a role signs the user out everywhere, because the role is carried inside
                  their access token.
                </p>
              </div>
            </RequirePermission>

            <RequirePermission permissions={[PERMISSIONS.USER_MANAGE_STATUS]}>
              <div className={fieldGroup}>
                <label className={fieldLabel} htmlFor="user-status">
                  Account status
                </label>
                <select
                  id="user-status"
                  className={select}
                  value={user.status}
                  disabled={!canManage || busy}
                  onChange={(event) =>
                    run(
                      () => usersApi.changeStatus(id, event.target.value as UserStatus),
                      "Status updated."
                    )
                  }
                >
                  {STATUS_OPTIONS.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <p className={fieldHint}>
                  Inactive and suspended accounts cannot sign in, and their open sessions are ended
                  immediately.
                </p>
              </div>
            </RequirePermission>
          </section>

          <section className={card}>
            <h2 className={cardTitle}>Danger zone</h2>

            {!canManage && (
              <p className={fieldHint}>
                {isSelf
                  ? "You cannot run these actions on your own account."
                  : "This account is at or above your own role level, so you cannot manage it."}
              </p>
            )}

            {canManage && confirming === null && (
              <div className={buttonStack}>
                <RequirePermission permissions={[PERMISSIONS.SESSION_REVOKE_ANY]}>
                  <button
                    type="button"
                    className={buttonSecondary}
                    onClick={() => setConfirming("sessions")}
                  >
                    <MonitorSmartphone size={16} aria-hidden="true" /> Sign out all devices
                  </button>
                </RequirePermission>

                <RequirePermission permissions={[PERMISSIONS.USER_MANAGE_STATUS]}>
                  <button
                    type="button"
                    className={buttonSecondary}
                    onClick={() => setConfirming("deactivate")}
                    disabled={user.status === "inactive"}
                  >
                    <UserMinus size={16} aria-hidden="true" /> Deactivate account
                  </button>
                </RequirePermission>

                <RequirePermission permissions={[PERMISSIONS.USER_DELETE]}>
                  <button
                    type="button"
                    className={buttonDanger}
                    onClick={() => setConfirming("delete")}
                  >
                    <Trash2 size={16} aria-hidden="true" /> Delete permanently
                  </button>
                </RequirePermission>
              </div>
            )}

            {confirming === "sessions" && (
              <ConfirmPanel
                title="Sign out every device?"
                description={`${user.name} will have to sign in again on all of their devices.`}
                confirmLabel="Sign out all devices"
                busy={busy}
                onCancel={() => setConfirming(null)}
                onConfirm={() =>
                  run(() => usersApi.revokeSessions(id), "All sessions for this user were ended.")
                }
              />
            )}

            {confirming === "deactivate" && (
              <ConfirmPanel
                title="Deactivate this account?"
                description="The account keeps all of its history but can no longer sign in. You can reactivate it at any time from the status dropdown."
                confirmLabel="Deactivate"
                busy={busy}
                onCancel={() => setConfirming(null)}
                onConfirm={() =>
                  run(() => usersApi.deactivate(id), "Account deactivated and signed out.")
                }
              />
            )}

            {confirming === "delete" && (
              <ConfirmPanel
                title="Delete this account permanently?"
                description="This cannot be undone. The user record and every session are erased. Deactivate instead if you may need the history later."
                confirmLabel="Delete permanently"
                confirmValue={user.email}
                confirmHint={`Type ${user.email} to confirm`}
                busy={busy}
                onCancel={() => setConfirming(null)}
                onConfirm={deletePermanently}
              />
            )}
          </section>

          <section className={card}>
            <h2 className={cardTitle}>
              <ShieldCheck size={18} aria-hidden="true" /> Effective permissions
            </h2>
            <ul className="flex flex-wrap gap-2">
              {(user.permissions || []).map((permission) => (
                <li
                  key={permission}
                  className="border border-line bg-canvas px-2.5 py-1 font-mono text-xs text-ink-muted"
                >
                  {permission}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </AppShell>
  );
};

export default UserDetailPage;
