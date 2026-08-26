import type { Role } from "../../../shared/api/types.ts";

/**
 * Mirrors the backend permission registry so the UI can hide actions the user
 * cannot perform. This is a usability layer only - the API remains the sole
 * authority and re-checks every permission on the server.
 */
export const ROLES = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  STAFF: "staff",
  CUSTOMER: "customer",
} as const satisfies Record<string, Role>;

export const ROLE_LABELS: Record<Role, string> = {
  [ROLES.SUPER_ADMIN]: "Super Admin",
  [ROLES.ADMIN]: "Admin",
  [ROLES.STAFF]: "Staff",
  [ROLES.CUSTOMER]: "Customer",
};

/** Role ladder. An actor may only act on accounts strictly below their level. */
export const ROLE_LEVELS: Record<Role, number> = {
  [ROLES.CUSTOMER]: 10,
  [ROLES.STAFF]: 20,
  [ROLES.ADMIN]: 30,
  [ROLES.SUPER_ADMIN]: 40,
};

export const PERMISSIONS = {
  USER_CREATE: "user:create",
  USER_READ: "user:read",
  USER_UPDATE: "user:update",
  USER_DELETE: "user:delete",
  USER_MANAGE_ROLE: "user:manage_role",
  USER_MANAGE_STATUS: "user:manage_status",
  SESSION_READ_ANY: "session:read_any",
  SESSION_REVOKE_ANY: "session:revoke_any",
  ROOM_TYPE_CREATE: "room_type:create",
  ROOM_TYPE_READ: "room_type:read",
  ROOM_TYPE_UPDATE: "room_type:update",
  ROOM_TYPE_DELETE: "room_type:delete",
  ROOM_CREATE: "room:create",
  ROOM_READ: "room:read",
  ROOM_UPDATE: "room:update",
  ROOM_DELETE: "room:delete",
  ROOM_MANAGE_STATUS: "room:manage_status",
  RESERVATION_CREATE: "reservation:create",
  RESERVATION_READ: "reservation:read",
  RESERVATION_READ_OWN: "reservation:read_own",
  RESERVATION_UPDATE: "reservation:update",
  RESERVATION_CANCEL: "reservation:cancel",
  FRONTDESK_CHECKIN: "frontdesk:checkin",
  FRONTDESK_CHECKOUT: "frontdesk:checkout",
  /** Lets a manager check a guest in before the advance has been paid. */
  FRONTDESK_OVERRIDE_PAYMENT: "frontdesk:override_payment",
  FRONTDESK_TICKET_CREATE: "frontdesk:ticket_create",
  FRONTDESK_TICKET_MANAGE: "frontdesk:ticket_manage",
  FRONTDESK_BAGGAGE_MANAGE: "frontdesk:baggage_manage",
  PAYMENT_CREATE: "payment:create",
  PAYMENT_READ: "payment:read",
  PAYMENT_READ_OWN: "payment:read_own",
  PAYMENT_REFUND: "payment:refund",
  AUDIT_LOG_VIEW: "audit_log:view",
  REPORT_VIEW: "report:view",
  ANALYTICS_VIEW: "analytics:view",
  SETTINGS_MANAGE: "settings:manage",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
