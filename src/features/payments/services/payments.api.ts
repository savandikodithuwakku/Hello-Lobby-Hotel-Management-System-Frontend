import httpClient from "../../../shared/api/httpClient.ts";
import { toQueryString } from "../../../shared/api/query.ts";
import type {
  Invoice,
  PaymentMethod,
  PaymentMethodOption,
  PaymentStatistics,
  Pagination,
  RefundQuote,
  Reservation,
  Transaction,
} from "../../../shared/api/types.ts";

/**
 * Payments and billing.
 *
 * A bill can be addressed by its own id or by the booking it belongs to. The
 * front desk works in bookings, so the reservation-addressed calls are the ones
 * the reservation screens use: the server issues the bill on first use, which
 * means no screen ever has to create one.
 */

export interface InvoiceListParams {
  search?: string;
  status?: string;
  customer?: string;
  from?: string;
  to?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface TransactionListParams {
  invoice?: string;
  reservation?: string;
  customer?: string;
  method?: PaymentMethod;
  status?: string;
  direction?: string;
  from?: string;
  to?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

/** Money the hotel already has in hand, written down after the fact. */
export interface RecordPaymentInput {
  amount: number;
  method: PaymentMethod;
  /** A bank slip number or card terminal receipt number. */
  externalReference?: string;
  note?: string;
}

export interface RecordPaymentResult {
  invoice: Invoice;
  transaction: Transaction;
  reservation: Reservation;
  /** True when this payment settled the advance and confirmed the booking. */
  autoConfirmed: boolean;
}

export interface CheckoutResult {
  invoice: Invoice;
  transaction: Transaction;
  /** Where to send the guest. Null when the provider settled it immediately. */
  redirectUrl: string | null;
  expiresAt?: string | null;
  reservation?: Reservation;
}

export interface RefundResult {
  invoice: Invoice;
  refund: Transaction;
  reverses?: string;
  reservation?: Reservation;
  settled: boolean;
}

export const paymentsApi = {
  listInvoices: (params: InvoiceListParams = {}) =>
    httpClient.get<{ invoices: Invoice[]; pagination: Pagination }>(
      `/payments/invoices${toQueryString(params)}`
    ),

  getInvoice: (invoiceId: string) =>
    httpClient.get<{ invoice: Invoice }>(`/payments/invoices/${invoiceId}`),

  /** Issues the bill on first use, so a new booking needs no extra step. */
  getInvoiceForReservation: (reservationId: string) =>
    httpClient.get<{ invoice: Invoice }>(`/payments/reservations/${reservationId}/invoice`),

  statistics: () => httpClient.get<PaymentStatistics>("/payments/invoices/statistics"),

  /**
   * Which methods the payment form may offer. Read from the server rather than
   * hard-coded, so a method disappears by itself when nothing can handle it.
   */
  methods: () => httpClient.get<{ methods: PaymentMethodOption[] }>("/payments/methods"),

  /**
   * Records money taken in person. Paying the advance in full confirms the
   * booking server-side, which is why the response carries it back.
   */
  recordPayment: (reservationId: string, input: RecordPaymentInput) =>
    httpClient.post<RecordPaymentResult>(
      `/payments/reservations/${reservationId}/payments`,
      input
    ),

  /** Starts an online payment. No money moves until the provider calls back. */
  startCheckout: (reservationId: string, amount: number, note?: string) =>
    httpClient.post<CheckoutResult>(`/payments/reservations/${reservationId}/checkout`, {
      amount,
      method: "online",
      note,
    }),

  /** What the cancellation policy allows. Changes nothing on its own. */
  refundQuote: (reservationId: string) =>
    httpClient.get<{ invoice: Invoice; quote: RefundQuote }>(
      `/payments/reservations/${reservationId}/refund-quote`
    ),

  /** Leave the amount out to refund exactly what the policy allows. */
  issueRefund: (reservationId: string, input: { amount?: number; reason?: string } = {}) =>
    httpClient.post<RefundResult>(`/payments/reservations/${reservationId}/refunds`, input),

  listTransactions: (params: TransactionListParams = {}) =>
    httpClient.get<{ transactions: Transaction[]; pagination: Pagination }>(
      `/payments/transactions${toQueryString(params)}`
    ),

  getTransaction: (id: string) =>
    httpClient.get<{ transaction: Transaction }>(`/payments/transactions/${id}`),

  /** The safety net for a provider callback that never arrived. */
  verifyTransaction: (id: string) =>
    httpClient.post<{ transaction: Transaction; changed: boolean }>(
      `/payments/transactions/${id}/verify`
    ),

  cancelTransaction: (id: string, reason?: string) =>
    httpClient.post<{ transaction: Transaction }>(`/payments/transactions/${id}/cancel`, {
      reason,
    }),
};

export default paymentsApi;
