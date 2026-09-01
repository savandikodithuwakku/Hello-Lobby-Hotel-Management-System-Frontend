import { Link } from "react-router-dom";
import { UserX } from "lucide-react";
import type { User } from "../../../shared/api/types.ts";
import DataTable, { CELL, MUTED_CELL } from "../../../shared/components/DataTable.tsx";
import { link, statusPill, statusPillBase } from "../../../shared/ui/styles.ts";
import { ROLE_LABELS } from "../../auth/constants/rbac.ts";
import { STATUS_LABELS, formatDate, formatDateOnly } from "../constants/users.ts";

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

const UserTable = ({ users, loading }: { users: User[]; loading: boolean }) => (
  <DataTable
    headings={HEADINGS}
    minWidthClass="min-w-[860px]"
    loading={loading}
    isEmpty={users.length === 0}
    empty={{
      icon: UserX,
      title: "No users match these filters",
      hint: "Try a different search term, or clear the filters to see everyone.",
    }}
  >
    {users.map((user) => (
      <UserRow key={user.id} user={user} />
    ))}
  </DataTable>
);

export default UserTable;
