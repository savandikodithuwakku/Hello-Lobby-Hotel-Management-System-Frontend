import type { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  BedDouble,
  CalendarDays,
  DoorClosed,
  Hotel,
  KeyRound,
  LayoutDashboard,
  LogOut,
  MonitorSmartphone,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "../../features/auth/hooks/useAuth.ts";
import { PERMISSIONS, type Permission } from "../../features/auth/constants/rbac.ts";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
  permission?: Permission;
  /** Hides the entry from anyone who holds this permission. */
  hiddenFor?: Permission;
}

/**
 * The signed-in chrome: brand, navigation and the current-user badge.
 *
 * Navigation entries carry the permission they need, so the menu shrinks to
 * whatever the signed-in person may actually open. As with every guard in the
 * frontend this is a convenience - the API checks the same permission again.
 */
const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  // Guests get the catalogue; staff get the inventory in its place.
  {
    to: "/browse",
    label: "Our rooms",
    icon: BedDouble,
    permission: PERMISSIONS.ROOM_TYPE_READ,
    hiddenFor: PERMISSIONS.ROOM_READ,
  },
  // Staff see every booking here; a guest sees their own, same screen.
  {
    to: "/reservations",
    label: "Reservations",
    icon: CalendarDays,
    permission: PERMISSIONS.RESERVATION_READ,
  },
  {
    to: "/reservations",
    label: "My bookings",
    icon: CalendarDays,
    permission: PERMISSIONS.RESERVATION_READ_OWN,
    hiddenFor: PERMISSIONS.RESERVATION_READ,
  },
  { to: "/rooms", label: "Rooms", icon: DoorClosed, permission: PERMISSIONS.ROOM_READ },
  // The catalogue admin table is inventory work, so it follows room:read.
  { to: "/room-types", label: "Room types", icon: BedDouble, permission: PERMISSIONS.ROOM_READ },
  { to: "/users", label: "Users", icon: Users, permission: PERMISSIONS.USER_READ },
  { to: "/account/sessions", label: "Active sessions", icon: MonitorSmartphone },
  { to: "/account/change-password", label: "Change password", icon: KeyRound },
];

const MENU_ITEM =
  "flex w-full cursor-pointer items-center gap-3.5 border-l-2 border-transparent px-4 py-3 text-left text-[0.95rem] font-medium no-underline transition-colors duration-300";

const initialsOf = (name = ""): string =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("") || "?";

interface AppShellProps {
  title: string;
  actions?: ReactNode;
  children: ReactNode;
}

const AppShell = ({ title, actions = null, children }: AppShellProps) => {
  const { user, logout, hasPermission } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const visibleItems = NAV_ITEMS.filter(
    (item) =>
      (!item.permission || hasPermission(item.permission)) &&
      !(item.hiddenFor && hasPermission(item.hiddenFor))
  );

  return (
    <div className="flex min-h-screen bg-canvas">
      <aside className="flex w-[260px] flex-col border-r border-line bg-surface p-6">
        <div className="mb-10 flex items-center gap-3 font-display text-[1.6rem] font-extrabold text-ink">
          <Hotel size={24} aria-hidden="true" />
          HelloLobby
        </div>

        <nav aria-label="Main" className="flex flex-1">
          <ul className="flex w-full flex-col gap-2">
            {visibleItems.map(({ to, label, icon: Icon, end }) => (
              <li key={`${to}-${label}`}>
                <NavLink
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    isActive
                      ? `${MENU_ITEM} border-l-brand bg-surface-hover text-ink`
                      : `${MENU_ITEM} text-ink-muted hover:bg-surface-hover hover:text-ink`
                  }
                >
                  <Icon size={18} aria-hidden="true" />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <button
          type="button"
          className={`${MENU_ITEM} mt-auto text-danger hover:bg-danger/10`}
          onClick={handleSignOut}
        >
          <LogOut size={18} aria-hidden="true" />
          Sign out
        </button>
      </aside>

      <main className="flex-1 overflow-y-auto p-10">
        <div className="mb-10 flex items-center justify-between">
          <h1 className="font-display text-3xl font-bold">{title}</h1>
          <div className="flex flex-wrap items-center gap-4">
            {actions}
            <div className="flex items-center gap-3 border border-line bg-surface px-4 py-2">
              <span
                className="flex size-8 items-center justify-center bg-brand text-[0.85rem] font-bold text-white"
                aria-hidden="true"
              >
                {initialsOf(user?.name)}
              </span>
              <span className="text-sm font-medium">{user?.name}</span>
            </div>
          </div>
        </div>

        {children}
      </main>
    </div>
  );
};

export default AppShell;
