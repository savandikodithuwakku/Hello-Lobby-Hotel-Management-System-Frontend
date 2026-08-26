import { Link } from "react-router-dom";
import { KeyRound, MonitorSmartphone, Users } from "lucide-react";
import AppShell from "../../../shared/components/AppShell.tsx";
import DetailRow, { DetailList } from "../../../shared/components/DetailRow.tsx";
import { twoColumnGrid } from "../../../shared/ui/layout.ts";
import {
  buttonSecondary,
  buttonStack,
  card,
  cardTitle,
  statusPill,
  statusPillBase,
} from "../../../shared/ui/styles.ts";
import RequirePermission from "../../auth/components/RequirePermission.tsx";
import { PERMISSIONS, ROLE_LABELS } from "../../auth/constants/rbac.ts";
import { useAuthUser } from "../../auth/hooks/useAuth.ts";

const DashboardPage = () => {
  const { user } = useAuthUser();

  return (
    <AppShell title="Dashboard">
      <div className={twoColumnGrid}>
        <section className={card}>
          <h2 className={cardTitle}>Your account</h2>

          <DetailList>
            <DetailRow label="Name">{user.name}</DetailRow>
            <DetailRow label="Email">{user.email}</DetailRow>
            <DetailRow label="Role">{ROLE_LABELS[user.role] || user.role}</DetailRow>
            <DetailRow label="Status">
              <span className={`${statusPillBase} ${statusPill[user.status]}`}>{user.status}</span>
            </DetailRow>
            <DetailRow label="Permissions">{user.permissions?.length ?? 0} granted</DetailRow>
          </DetailList>
        </section>

        <section className={card}>
          <h2 className={cardTitle}>Shortcuts</h2>

          <div className={buttonStack}>
            <RequirePermission permissions={[PERMISSIONS.USER_READ]}>
              <Link to="/users" className={buttonSecondary}>
                <Users size={16} aria-hidden="true" /> Manage users
              </Link>
            </RequirePermission>

            <Link to="/account/sessions" className={buttonSecondary}>
              <MonitorSmartphone size={16} aria-hidden="true" /> Active sessions
            </Link>

            <Link to="/account/change-password" className={buttonSecondary}>
              <KeyRound size={16} aria-hidden="true" /> Change password
            </Link>
          </div>
        </section>
      </div>
    </AppShell>
  );
};

export default DashboardPage;
