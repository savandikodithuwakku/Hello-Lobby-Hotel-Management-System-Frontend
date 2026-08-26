import { Link } from "react-router-dom";
import { UserX } from "lucide-react";
import type { User } from "../../../shared/api/types.ts";
import { link, statusPill, statusPillBase } from "../../../shared/ui/styles.ts";
import { ROLE_LABELS } from "../../auth/constants/rbac.ts";
import { STATUS_LABELS, formatDate, formatDateOnly } from "../constants/users.ts";

const CELL = "border-b border-line px-4 py-3 text-left align-middle";
const MUTED_CELL = `${CELL} text-ink-muted`;

/** Small amber "unverified" marker shown next to an unconfirmed address. */
export const UnverifiedFlag = () => (
  <span className="ml-2 inline-block border border-warning/30 bg-warning/10 px-1.5 py-0.5 text-[0.68rem] font-semibold tracking-[0.04em] text-amber-700 uppercase">
    unverified
  </span>
);

const UserRow = ({ user }: { user: User }) => (
  <tr className="[&:last-child>td]:border-b-0 hover:bg-surface-hover">
    <td className={CELL}>
      <Link to={`/users/${user.id}`} className={link}>
        {user.name}
      </Link>
      {!user.emailVerified && <UnverifiedFlag />}
    </td>
    <td className={MUTED_CELL}>{user.email}</td>
    <td className={MUTED_CELL}>{user.phone || "\u2014"}</td>
    <td className={CELL}>{ROLE_LABELS[user.role] || user.role}</td>
    <td className={CELL}>
      <span className={`${statusPillBase} ${statusPill[user.status]}`}>
        {STATUS_LABELS[user.status] || user.status}
      </span>
    </td>
    <td className={`${MUTED_CELL} whitespace-nowrap`}>{formatDate(user.lastLoginAt)}</td>
    <td className={`${MUTED_CELL} whitespace-nowrap`}>{formatDateOnly(user.createdAt)}</td>
  </tr>
);

const HEADINGS = ["Name", "Email", "Phone", "Role", "Status", "Last login", "Created"];

const UserTable = ({ users, loading }: { users: User[]; loading: boolean }) => {
  if (!loading && users.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 border border-line px-6 py-14 text-center text-ink-dim">
        <UserX size={28} aria-hidden="true" />
        <p className="font-semibold text-ink">No users match these filters</p>
        <p className="max-w-[44ch] text-[0.88rem] text-ink-muted">
          Try a different search term, or clear the filters to see everyone.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-line" aria-busy={loading}>
      <table className="w-full min-w-[860px] border-collapse text-sm">
        <thead>
          <tr>
            {HEADINGS.map((heading) => (
              <th
                key={heading}
                scope="col"
                className={`${CELL} bg-surface-hover text-xs font-semibold tracking-[0.05em] whitespace-nowrap text-ink-muted uppercase`}
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <UserRow key={user.id} user={user} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;
