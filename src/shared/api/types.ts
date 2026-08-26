/**
 * Shapes returned by the HelloLobby API.
 *
 * Every endpoint answers with the same envelope, so `ApiResponse<T>` is
 * parameterised by whatever sits under `data`.
 */

export interface ApiFieldError {
  field: string;
  message: string;
}

export interface ApiResponse<TData> {
  success: boolean;
  message: string;
  data: TData;
  errors?: ApiFieldError[];
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Address {
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export type Role = "super_admin" | "admin" | "staff" | "customer";

export type UserStatus = "active" | "inactive" | "suspended" | "pending_verification";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: Role;
  status: UserStatus;
  emailVerified: boolean;
  permissions?: string[];
  address?: Partial<Address> | null;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface Session {
  id: string;
  device: string;
  ipAddress: string | null;
  lastUsedAt: string | null;
  /** True for the session this browser is currently using. */
  current: boolean;
}

export interface SessionPayload {
  accessToken: string;
  user: User;
}

/* -------------------------------------------------------------------------- */
/* Rooms                                                                      */
/* -------------------------------------------------------------------------- */

export type RoomStatus =
  | "available"
  | "reserved"
  | "occupied"
  | "cleaning"
  | "maintenance"
  | "out_of_service";

export interface RoomTypeImage {
  url: string;
  alt: string;
  isPrimary: boolean;
}

export interface RoomType {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  maxOccupancy: number;
  facilities: string[];
  images: RoomTypeImage[];
  primaryImage: string | null;
  isActive: boolean;
  /** Present on list and detail responses; counts active rooms of this type. */
  roomCount?: number;
  activeRoomCount?: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * What the catalogue returns to a guest: the sales information only. No room
 * counts, no activation flag, no audit timestamps.
 */
export type CatalogRoomType = Pick<
  RoomType,
  "id" | "name" | "description" | "basePrice" | "maxOccupancy" | "facilities" | "images" | "primaryImage"
>;

/** The slice of a room type embedded in every room payload. */
export interface RoomTypeSummary {
  id: string;
  name: string;
  basePrice: number;
  maxOccupancy: number;
  isActive: boolean;
}

export interface Room {
  id: string;
  roomNumber: string;
  floor: number;
  status: RoomStatus;
  statusNote: string;
  statusChangedAt: string | null;
  /** The room's own price, or null when it follows its type's base price. */
  price: number | null;
  effectivePrice: number | null;
  facilities: string[];
  effectiveFacilities: string[];
  isActive: boolean;
  isBookable: boolean;
  roomType: RoomTypeSummary;
  /** Statuses an operator may move this room to right now (detail only). */
  allowedTransitions?: RoomStatus[];
  createdAt: string;
  updatedAt: string;
}

export interface RoomStatistics {
  total: number;
  active: number;
  inactive: number;
  available: number;
  occupancyRate: number;
  byStatus: Record<RoomStatus, number>;
  byRoomType: { roomTypeId: string; name: string; count: number }[];
}

/* -------------------------------------------------------------------------- */
/* Reservations                                                               */
/* -------------------------------------------------------------------------- */

export type ReservationStatus =
  | "pending"
  | "confirmed"
  | "checked_in"
  | "checked_out"
  | "completed"
  | "cancelled"
  | "no_show";

export interface ReservationService {
  name: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface ReservationPricing {
  roomRate: number;
  roomSubtotal: number;
  servicesSubtotal: number;
  totalAmount: number;
}

export interface ReservationPayment {
  advanceAmount: number;
  amountPaid: number;
  balanceDue: number;
  advanceDeadline: string;
  balanceDeadline: string;
  lastPaymentAt: string | null;
  advanceSettled: boolean;
  fullySettled: boolean;
  advanceOverdue: boolean;
}

export interface Reservation {
  id: string;
  reference: string;
  status: ReservationStatus;
  customer: { id: string; name?: string; email?: string; phone?: string | null };
  room: { id: string; roomNumber?: string; floor?: number; status?: RoomStatus };
  roomType: { id: string; name?: string; maxOccupancy?: number };
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  pricing: ReservationPricing;
  additionalServices: ReservationService[];
  payment: ReservationPayment;
  specialRequests: string;
  checkedInAt: string | null;
  checkedOutAt: string | null;
  cancelledAt: string | null;
  cancellationReason: string;
  /** Statuses this booking may move to right now (detail responses only). */
  allowedTransitions?: ReservationStatus[];
  createdAt: string;
  updatedAt: string;
}

export interface ReservationHistoryEntry {
  status: ReservationStatus;
  at: string;
  note: string;
  by: { id: string | null; name?: string };
}

/** A free room plus what it would cost for the requested stay. */
export interface AvailableRoom extends Room {
  quote: { nights: number; ratePerNight: number; roomSubtotal: number };
}

/** Why an availability search came back empty, so the UI can explain itself. */
export type AvailabilityReason =
  | "over-capacity"
  | "no-room-types"
  | "no-rooms"
  | "fully-booked"
  | null;

export interface AvailabilityResult {
  checkIn: string;
  checkOut: string;
  nights: number;
  rooms: AvailableRoom[];
  total: number;
  unavailable: number;
  reason: AvailabilityReason;
  /** The largest party any room on sale for this search could take. */
  largestOccupancy: number;
  requestedGuests: number | null;
}

export interface ReservationStatistics {
  byStatus: Record<ReservationStatus, number>;
  arrivalsToday: number;
  departuresToday: number;
  inHouse: number;
  outstanding: { count: number; amount: number };
}
