/**
 * Page-level layout recipes shared by the module screens.
 *
 * Kept beside the component recipes in `styles.ts` for the same reason: these
 * few strings appear on every module page, so they get one definition.
 */

/** Main column plus a narrower side column, stacking below 1024px. */
export const twoColumnGrid = "grid grid-cols-1 gap-8 lg:grid-cols-[2fr_1fr]";

/** A single column of stacked cards inside `twoColumnGrid`. */
export const column = "flex min-w-0 flex-col gap-8";
