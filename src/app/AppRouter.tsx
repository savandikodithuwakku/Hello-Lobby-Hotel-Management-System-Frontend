import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "../features/auth/components/ProtectedRoute.tsx";
import PublicOnlyRoute from "../features/auth/components/PublicOnlyRoute.tsx";
import { PERMISSIONS } from "../features/auth/constants/rbac.ts";
import LoginPage from "../features/auth/pages/LoginPage.tsx";
import RegisterPage from "../features/auth/pages/RegisterPage.tsx";
import ForgotPasswordPage from "../features/auth/pages/ForgotPasswordPage.tsx";
import ResetPasswordPage from "../features/auth/pages/ResetPasswordPage.tsx";
import VerifyEmailPage from "../features/auth/pages/VerifyEmailPage.tsx";
import ResendVerificationPage from "../features/auth/pages/ResendVerificationPage.tsx";
import ChangePasswordPage from "../features/auth/pages/ChangePasswordPage.tsx";
import SessionsPage from "../features/auth/pages/SessionsPage.tsx";
import DashboardPage from "../features/dashboard/pages/DashboardPage.tsx";
import UsersListPage from "../features/users/pages/UsersListPage.tsx";
import UserCreatePage from "../features/users/pages/UserCreatePage.tsx";
import UserDetailPage from "../features/users/pages/UserDetailPage.tsx";
import RoomsListPage from "../features/rooms/pages/RoomsListPage.tsx";
import RoomCreatePage from "../features/rooms/pages/RoomCreatePage.tsx";
import RoomDetailPage from "../features/rooms/pages/RoomDetailPage.tsx";
import RoomTypesListPage from "../features/rooms/pages/RoomTypesListPage.tsx";
import RoomTypeCreatePage from "../features/rooms/pages/RoomTypeCreatePage.tsx";
import RoomTypeDetailPage from "../features/rooms/pages/RoomTypeDetailPage.tsx";
import RoomCatalogPage from "../features/rooms/pages/RoomCatalogPage.tsx";
import ReservationsListPage from "../features/reservations/pages/ReservationsListPage.tsx";
import ReservationCreatePage from "../features/reservations/pages/ReservationCreatePage.tsx";
import ReservationDetailPage from "../features/reservations/pages/ReservationDetailPage.tsx";
import FrontDeskBoardPage from "../features/frontdesk/pages/FrontDeskBoardPage.tsx";
import HousekeepingBoardPage from "../features/frontdesk/pages/HousekeepingBoardPage.tsx";
import TicketsListPage from "../features/frontdesk/pages/TicketsListPage.tsx";
import TicketCreatePage from "../features/frontdesk/pages/TicketCreatePage.tsx";
import TicketDetailPage from "../features/frontdesk/pages/TicketDetailPage.tsx";
import BaggagePage from "../features/frontdesk/pages/BaggagePage.tsx";
import ForbiddenPage from "../features/errors/pages/ForbiddenPage.tsx";
import NotFoundPage from "../features/errors/pages/NotFoundPage.tsx";

/**
 * Application routes.
 *
 * Guest-only screens are wrapped in `PublicOnlyRoute`; everything behind a
 * sign-in uses `ProtectedRoute`, which also accepts `roles` / `permissions`.
 * A permission gate here only decides what is worth rendering - the API
 * re-checks the same permission on every request.
 */
const AppRouter = () => (
  <Routes>
    <Route element={<PublicOnlyRoute />}>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      <Route path="/resend-verification" element={<ResendVerificationPage />} />
    </Route>

    {/* Reachable while signed in or out: the link arrives by email. */}
    <Route path="/verify-email/:token" element={<VerifyEmailPage />} />

    <Route element={<ProtectedRoute />}>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/account/change-password" element={<ChangePasswordPage />} />
      <Route path="/account/sessions" element={<SessionsPage />} />
    </Route>

    {/* User management */}
    <Route element={<ProtectedRoute permissions={[PERMISSIONS.USER_READ]} />}>
      <Route path="/users" element={<UsersListPage />} />
      <Route path="/users/:id" element={<UserDetailPage />} />
    </Route>

    <Route element={<ProtectedRoute permissions={[PERMISSIONS.USER_CREATE]} />}>
      <Route path="/users/new" element={<UserCreatePage />} />
    </Route>

    {/* Room inventory. Creating rooms and types needs its own permission, so
        those screens sit behind a second gate. */}
    <Route element={<ProtectedRoute permissions={[PERMISSIONS.ROOM_CREATE]} />}>
      <Route path="/rooms/new" element={<RoomCreatePage />} />
    </Route>

    <Route element={<ProtectedRoute permissions={[PERMISSIONS.ROOM_READ]} />}>
      <Route path="/rooms" element={<RoomsListPage />} />
      <Route path="/rooms/:id" element={<RoomDetailPage />} />
    </Route>

    <Route element={<ProtectedRoute permissions={[PERMISSIONS.ROOM_TYPE_CREATE]} />}>
      <Route path="/room-types/new" element={<RoomTypeCreatePage />} />
    </Route>

    {/* The catalogue admin screens are inventory work, so they sit behind
        room:read alongside the rooms themselves - a guest holds room_type:read
        but must not reach the management tables. */}
    <Route element={<ProtectedRoute permissions={[PERMISSIONS.ROOM_READ]} />}>
      <Route path="/room-types" element={<RoomTypesListPage />} />
      <Route path="/room-types/:id" element={<RoomTypeDetailPage />} />
    </Route>

    {/* What a guest sees instead: the catalogue, with no room numbers and no
        live statuses. */}
    <Route element={<ProtectedRoute permissions={[PERMISSIONS.ROOM_TYPE_READ]} />}>
      <Route path="/browse" element={<RoomCatalogPage />} />
    </Route>

    {/* Reservations. The list and detail screens are shared: a guest holding
        only reservation:read_own gets the same pages, narrowed by the API. */}
    <Route element={<ProtectedRoute permissions={[PERMISSIONS.RESERVATION_CREATE]} />}>
      <Route path="/reservations/new" element={<ReservationCreatePage />} />
    </Route>

    <Route
      element={
        <ProtectedRoute
          permissions={[PERMISSIONS.RESERVATION_READ, PERMISSIONS.RESERVATION_READ_OWN]}
        />
      }
    >
      <Route path="/reservations" element={<ReservationsListPage />} />
      <Route path="/reservations/:id" element={<ReservationDetailPage />} />
    </Route>

    {/* The front desk. Arrivals and departures are gated on the permissions
        that name them; the board itself needs either, because a person who can
        only check guests out still has to see who is leaving. */}
    <Route
      element={
        <ProtectedRoute
          permissions={[PERMISSIONS.FRONTDESK_CHECKIN, PERMISSIONS.FRONTDESK_CHECKOUT]}
        />
      }
    >
      <Route path="/front-desk" element={<FrontDeskBoardPage />} />
    </Route>

    {/* Housekeeping is inventory work rather than desk work, so it follows the
        permission that lets somebody actually service a room. */}
    <Route element={<ProtectedRoute permissions={[PERMISSIONS.ROOM_MANAGE_STATUS]} />}>
      <Route path="/front-desk/housekeeping" element={<HousekeepingBoardPage />} />
    </Route>

    {/* Tickets. A guest holding only frontdesk:ticket_create gets the same
        screens, narrowed by the API to the tickets they raised. */}
    <Route
      element={
        <ProtectedRoute
          permissions={[PERMISSIONS.FRONTDESK_TICKET_MANAGE, PERMISSIONS.FRONTDESK_TICKET_CREATE]}
        />
      }
    >
      <Route path="/tickets" element={<TicketsListPage />} />
      <Route path="/tickets/new" element={<TicketCreatePage />} />
      <Route path="/tickets/:id" element={<TicketDetailPage />} />
    </Route>

    {/* Baggage. A guest can see what the desk is holding for them; only staff
        can record bags being taken in or handed back. */}
    <Route
      element={
        <ProtectedRoute
          permissions={[PERMISSIONS.FRONTDESK_BAGGAGE_MANAGE, PERMISSIONS.RESERVATION_READ_OWN]}
        />
      }
    >
      <Route path="/baggage" element={<BaggagePage />} />
    </Route>

    <Route path="/forbidden" element={<ForbiddenPage />} />
    <Route path="/404" element={<NotFoundPage />} />
    <Route path="*" element={<Navigate to="/404" replace />} />
  </Routes>
);

export default AppRouter;
