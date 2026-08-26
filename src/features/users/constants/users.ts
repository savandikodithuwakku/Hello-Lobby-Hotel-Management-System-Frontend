import type { Address, Role, UserStatus } from "../../../shared/api/types.ts";
import { formatDateTime } from "../../../shared/ui/format.ts";
import { toSelectOptions, type SelectOption } from "../../../shared/types/options.ts";
import { ROLES, ROLE_LABELS } from "../../auth/constants/rbac.ts";

// The user screens show dates and page sizes the way every other screen does.
export { formatDateTime, formatDateOnly } from "../../../shared/ui/format.ts";
export { PAGE_SIZE } from "../../../shared/constants/pagination.ts";
export type { SelectOption };

export const USER_STATUSES = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  SUSPENDED: "suspended",
  PENDING_VERIFICATION: "pending_verification",
} as const satisfies Record<string, UserStatus>;

export const STATUS_LABELS: Record<UserStatus, string> = {
  [USER_STATUSES.ACTIVE]: "Active",
  [USER_STATUSES.INACTIVE]: "Inactive",
  [USER_STATUSES.SUSPENDED]: "Suspended",
  [USER_STATUSES.PENDING_VERIFICATION]: "Pending verification",
};

/** Ordered highest first, matching the backend role ladder. */
export const ROLE_OPTIONS: SelectOption<Role>[] = [
  { value: ROLES.SUPER_ADMIN, label: ROLE_LABELS[ROLES.SUPER_ADMIN] },
  { value: ROLES.ADMIN, label: ROLE_LABELS[ROLES.ADMIN] },
  { value: ROLES.STAFF, label: ROLE_LABELS[ROLES.STAFF] },
  { value: ROLES.CUSTOMER, label: ROLE_LABELS[ROLES.CUSTOMER] },
];

export const STATUS_OPTIONS: SelectOption<UserStatus>[] = toSelectOptions(STATUS_LABELS);

export const SORT_OPTIONS: SelectOption[] = [
  { value: "-createdAt", label: "Newest first" },
  { value: "createdAt", label: "Oldest first" },
  { value: "name", label: "Name A-Z" },
  { value: "-name", label: "Name Z-A" },
  { value: "-lastLoginAt", label: "Recently active" },
];

export const ADDRESS_FIELDS: { key: keyof Address; label: string }[] = [
  { key: "line1", label: "Address line 1" },
  { key: "line2", label: "Address line 2" },
  { key: "city", label: "City" },
  { key: "state", label: "State / Province" },
  { key: "postalCode", label: "Postal code" },
  { key: "country", label: "Country" },
];

export const EMPTY_ADDRESS: Address = {
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
};

/** "12 Galle Road, Colombo, 00300, Sri Lanka" - empty parts are skipped. */
export const formatAddress = (address: Partial<Address> | null | undefined): string | null => {
  if (!address) return null;

  const parts = [
    address.line1,
    address.line2,
    address.city,
    address.state,
    address.postalCode,
    address.country,
  ]
    .map((part) => (part || "").trim())
    .filter(Boolean);

  return parts.length > 0 ? parts.join(", ") : null;
};

/** Like `formatDateTime`, but "Never" reads better than a dash for a login. */
export const formatDate = (value: string | null): string =>
  value ? formatDateTime(value) : "Never";
