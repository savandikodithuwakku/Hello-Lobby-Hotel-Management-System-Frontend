import type { Address, Role, UserStatus } from "../../../shared/api/types.ts";
import { ROLES, ROLE_LABELS } from "../../auth/constants/rbac.ts";

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

export interface SelectOption<TValue extends string = string> {
  value: TValue;
  label: string;
}

/** Ordered highest first, matching the backend role ladder. */
export const ROLE_OPTIONS: SelectOption<Role>[] = [
  { value: ROLES.SUPER_ADMIN, label: ROLE_LABELS[ROLES.SUPER_ADMIN] },
  { value: ROLES.ADMIN, label: ROLE_LABELS[ROLES.ADMIN] },
  { value: ROLES.STAFF, label: ROLE_LABELS[ROLES.STAFF] },
  { value: ROLES.CUSTOMER, label: ROLE_LABELS[ROLES.CUSTOMER] },
];

export const STATUS_OPTIONS: SelectOption<UserStatus>[] = (
  Object.entries(STATUS_LABELS) as [UserStatus, string][]
).map(([value, label]) => ({ value, label }));

export const SORT_OPTIONS: SelectOption[] = [
  { value: "-createdAt", label: "Newest first" },
  { value: "createdAt", label: "Oldest first" },
  { value: "name", label: "Name A-Z" },
  { value: "-name", label: "Name Z-A" },
  { value: "-lastLoginAt", label: "Recently active" },
];

export const PAGE_SIZE = 20;

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

export const formatDate = (value: string | null): string => {
  if (!value) return "Never";

  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

export const formatDateOnly = (value: string | null): string => {
  if (!value) return "\u2014";
  return new Date(value).toLocaleDateString(undefined, { dateStyle: "medium" });
};
