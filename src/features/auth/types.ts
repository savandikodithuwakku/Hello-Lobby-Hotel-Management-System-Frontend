/**
 * State carried between screens through React Router's `location.state`.
 *
 * Router types it as `unknown`, so every reader casts to this shape rather
 * than reaching into an untyped object.
 */
export interface RouteState {
  /** Where a guard interrupted the user, so sign-in can send them back. */
  from?: { pathname: string };
  /** A one-off notice to show on the screen being navigated to. */
  message?: string;
  /** Pre-fills the address box on the resend-verification screen. */
  email?: string;
}
