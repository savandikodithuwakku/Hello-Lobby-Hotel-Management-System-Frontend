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

/**
 * A room carries two statuses, not one, because they answer different questions
 * and move for different reasons.
 *
 * `occupancy` says whether anybody holds the room and is driven by bookings;
 * `housekeeping` says whether it is fit to sell and is driven by housekeeping
 * staff. An occupied room is dirty every morning and clean by the afternoon, so
 * neither can stand in for the other.
 */
export type RoomOccupancy = "vacant" | "reserved" | "occupied";

export type HousekeepingStatus = "clean" | "dirty" | "cleaning" | "inspected" | "out_of_order";

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
  occupancy: RoomOccupancy;
  housekeeping: HousekeepingStatus;
  housekeepingNote: string;
  housekeepingChangedAt: string | null;
  occupancyChangedAt: string | null;
  /** The room's own price, or null when it follows its type's base price. */
  price: number | null;
  effectivePrice: number | null;
  facilities: string[];
  effectiveFacilities: string[];
  isActive: boolean;
  /** Nobody in it, and fit for a guest. Both statuses have to agree. */
  isBookable: boolean;
  /** Standing empty but not fit to sell - a room quietly losing money. */
  isDiscrepant: boolean;
  roomType: RoomTypeSummary;
  /** Housekeeping states this room may move to right now (detail only). */
  allowedHousekeepingTransitions?: HousekeepingStatus[];
  createdAt: string;
  updatedAt: string;
}

export interface RoomStatistics {
  total: number;
  active: number;
  inactive: number;
  /** Vacant *and* fit to sell. Counting vacant alone would promise rooms that
   * have not been cleaned. */
  sellable: number;
  /** Vacant but not sellable. The number worth looking at every morning. */
  discrepant: number;
  occupancyRate: number;
  byOccupancy: Record<RoomOccupancy, number>;
  byHousekeeping: Record<HousekeepingStatus, number>;
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
  /** Extras agreed when the booking was made. */
  servicesSubtotal: number;
  /** What the guest used once they were in the room - the folio total. */
  extraCharges: number;
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
  room: {
    id: string;
    roomNumber?: string;
    floor?: number;
    occupancy?: RoomOccupancy;
    housekeeping?: HousekeepingStatus;
  };
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

/* -------------------------------------------------------------------------- */
/* Payments & billing                                                         */
/* -------------------------------------------------------------------------- */

/** A bill's status is worked out by the server from its amounts, never stored. */
export type InvoiceStatus =
  | "pending"
  | "partially_paid"
  | "paid"
  | "overdue"
  | "refunded"
  | "cancelled";

/** One movement of money, as opposed to the bill it belongs to. */
export type TransactionStatus = "pending" | "success" | "failed" | "cancelled";

export type TransactionDirection = "payment" | "refund";

export type PaymentMethod = "cash" | "card" | "bank_transfer" | "online";

/** What kind of thing was charged to a room during the stay. */
export type ChargeCategory =
  | "food_and_drink"
  | "minibar"
  | "laundry"
  | "spa"
  | "transport"
  | "telephone"
  | "damage"
  | "room_charge"
  | "other"
  | "adjustment";

/**
 * One thing the guest used while they were here.
 *
 * Distinct from a booking's `additionalServices`, which is what was agreed
 * before they arrived. Lines are never edited or removed - a mistake is
 * cancelled out by an opposite line pointing back at it.
 */
export interface FolioCharge {
  id: string;
  description: string;
  category: ChargeCategory;
  unitPrice: number;
  quantity: number;
  amount: number;
  reverses: string | null;
  postedBy: string | null;
  postedAt: string;
  note: string;
}

export interface InvoiceAmounts {
  total: number;
  advance: number;
  paid: number;
  refunded: number;
  /** Everything charged to the room during the stay. */
  charges: number;
  /** What has been received and kept, after refunds. */
  netPaid: number;
  balanceDue: number;
}

export interface Transaction {
  id: string;
  reference: string;
  direction: TransactionDirection;
  status: TransactionStatus;
  amount: number;
  currency: string;
  method: PaymentMethod;
  methodLabel: string;
  invoice: string | null;
  reservation: string | null;
  customer: { id: string | null; name?: string; email?: string };
  provider: string;
  providerReference: string | null;
  providerStatus: string | null;
  externalReference: string;
  reverses: string | null;
  refundedAmount: number;
  refundableAmount: number;
  recordedBy: { id: string | null; name?: string };
  settledAt: string | null;
  expiresAt: string | null;
  failureReason: string;
  note: string;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  reference: string;
  status: InvoiceStatus;
  currency: string;
  reservation: {
    id: string | null;
    reference?: string;
    status?: ReservationStatus;
    checkIn?: string;
    checkOut?: string;
  };
  customer: { id: string | null; name?: string; email?: string; phone?: string | null };
  amounts: InvoiceAmounts;
  charges: FolioCharge[];
  advanceDueAt: string;
  dueAt: string;
  advanceSettled: boolean;
  fullySettled: boolean;
  isOverdue: boolean;
  issuedAt: string;
  settledAt: string | null;
  voidedAt: string | null;
  voidReason: string;
  createdAt: string;
  updatedAt: string;
  /** Detail responses only: every movement of money against this bill. */
  transactions?: Transaction[];
}

/** What the payment form may offer, read from the server's provider register. */
export interface PaymentMethodOption {
  method: PaymentMethod;
  label: string;
  available: boolean;
  provider: string | null;
  /** True when paying sends the guest out to a provider rather than being
   * written down at the desk. */
  requiresRedirect: boolean;
  /** True while the built-in stand-in gateway is handling online payments, so
   * the UI can say plainly that no real money moved. */
  simulated: boolean;
}

export interface RefundQuote {
  amount: number;
  retained: number;
  policy: string;
  reason: string;
  currency: string;
  /** The most that could be given back if the policy were overridden. */
  maximum: number;
}

export interface PaymentStatistics {
  invoices: { byStatus: Record<InvoiceStatus, number>; total: number };
  outstanding: number;
  takenToday: { amount: number; count: number };
  refunded: { amount: number; count: number };
  byMethod: Record<PaymentMethod, { amount: number; count: number }>;
}

/* -------------------------------------------------------------------------- */
/* Guest service tickets                                                      */
/* -------------------------------------------------------------------------- */

export type TicketCategory =
  | "maintenance"
  | "housekeeping"
  | "amenities"
  | "noise"
  | "internet"
  | "food_and_drink"
  | "billing"
  | "security"
  | "other";

export type TicketPriority = "low" | "medium" | "high" | "urgent";

export type TicketStatus =
  | "open"
  | "acknowledged"
  | "in_progress"
  | "on_hold"
  | "resolved"
  | "closed"
  | "cancelled";

export interface TicketPerson {
  id: string | null;
  name?: string;
  email?: string | null;
}

export interface TicketUpdate {
  note: string;
  /** Set when this update also moved the ticket along. */
  status: TicketStatus | null;
  at: string;
  by: TicketPerson;
}

export interface Ticket {
  id: string;
  reference: string;
  subject: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  guest: TicketPerson;
  reportedBy: TicketPerson;
  assignedTo: TicketPerson | null;
  reservation: { id: string | null; reference?: string };
  room: { id: string | null; roomNumber?: string; floor?: number };
  /** When somebody should have picked it up by. */
  respondBy: string;
  /** Nobody has picked it up and that target has passed. */
  isOverdue: boolean;
  /** How long the guest waited before somebody picked it up, in minutes. */
  responseMinutes: number | null;
  acknowledgedAt: string | null;
  resolvedAt: string | null;
  closedAt: string | null;
  resolution: string;
  /** True while this ticket is what is keeping the room out of order. */
  blocksRoom: boolean;
  updates: TicketUpdate[];
  /** Statuses this ticket may move to right now (detail responses only). */
  allowedTransitions?: TicketStatus[];
  createdAt: string;
  updatedAt: string;
}

export interface TicketStatistics {
  byStatus: Record<TicketStatus, number>;
  byPriority: Record<TicketPriority, number>;
  active: number;
  overdue: number;
  unassigned: number;
}

/* -------------------------------------------------------------------------- */
/* Baggage held at the desk                                                   */
/* -------------------------------------------------------------------------- */

export type BaggageStatus = "stored" | "collected" | "unclaimed";

export interface Baggage {
  id: string;
  /** The number written on the ticket handed to the guest. */
  tag: string;
  status: BaggageStatus;
  /** One name for the screen, whether the person has an account or not. */
  guestName: string;
  guest: TicketPerson | null;
  reservation: { id: string | null; reference?: string };
  bagCount: number;
  description: string;
  location: string;
  receivedAt: string;
  receivedBy: TicketPerson;
  collectedAt: string | null;
  collectedBy: TicketPerson | null;
  /** Who actually walked away with them - not always the guest. */
  collectedByName: string;
  isCollected: boolean;
  daysHeld: number;
  note: string;
  createdAt: string;
  updatedAt: string;
}

export interface BaggageStatistics {
  stored: number;
  /** Held longer than the policy allows. Somebody has to look at these. */
  unclaimed: number;
  heldNow: number;
  piecesHeld: number;
  unclaimedAfterDays: number;
}
