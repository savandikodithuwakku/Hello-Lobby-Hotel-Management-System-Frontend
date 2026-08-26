/**
 * Front-desk policy values the UI needs to know about.
 *
 * These mirror rules the API enforces. They live here so a form can tell
 * somebody what is expected *before* they submit, rather than the server
 * refusing and the person having to guess what was wrong. The server remains
 * the authority - nothing here relaxes anything.
 */

/**
 * The shortest override reason a manager may give when letting a guest in
 * before their advance is paid. Matches `OVERRIDE_REASON_MIN` on the server.
 */
export const OVERRIDE_REASON_MIN = 10;
