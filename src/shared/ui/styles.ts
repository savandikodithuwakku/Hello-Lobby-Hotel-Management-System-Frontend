import type { UserStatus } from "../api/types.ts";

/**
 * Shared Tailwind class strings.
 *
 * Utility classes live in the markup, but a handful of recipes (buttons,
 * inputs, cards) appear on dozens of elements across the app. Keeping those
 * few in one typed module means a restyle is still a single edit, without
 * reintroducing a stylesheet.
 *
 * Every string here is a complete, literal class list. Tailwind scans source
 * files for literals, so class names must never be assembled at runtime.
 */

const BUTTON_BASE =
  "inline-flex cursor-pointer items-center justify-center gap-2 border border-transparent px-4 py-2.5 text-sm font-semibold leading-tight no-underline transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-50";

export const buttonPrimary = `${BUTTON_BASE} bg-brand text-white hover:not-disabled:bg-brand-hover`;

export const buttonSecondary = `${BUTTON_BASE} border-line bg-transparent text-ink-muted hover:not-disabled:bg-surface-hover hover:not-disabled:text-ink`;

export const buttonDanger = `${BUTTON_BASE} border-danger/35 bg-transparent text-danger hover:not-disabled:bg-danger/10`;

/** Full-width action that closes a form. */
export const buttonSubmit =
  "mt-2 flex w-full cursor-pointer items-center justify-center gap-2.5 bg-brand px-4 py-3.5 text-base font-semibold text-white transition-colors duration-300 hover:not-disabled:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60";

/** Square icon-only control, used for destructive row actions. */
export const buttonIcon =
  "inline-flex cursor-pointer items-center justify-center border border-line p-2 text-ink-muted transition-colors duration-300 hover:not-disabled:border-danger/35 hover:not-disabled:bg-danger/10 hover:not-disabled:text-danger disabled:cursor-not-allowed disabled:opacity-50";

/** Borderless control that reads as a link but acts as a button. */
export const buttonText =
  "inline-flex cursor-pointer items-center gap-1.5 text-[0.85rem] text-ink-muted transition-colors duration-300 hover:text-brand";

export const card = "border border-line bg-surface p-8";

export const cardTitle = "mb-6 flex items-center gap-2 font-display text-xl font-semibold";

export const link =
  "font-semibold text-brand no-underline transition-colors duration-300 hover:text-accent hover:underline";

export const fieldGroup = "relative mb-5";

export const fieldLabel =
  "mb-2 block text-[0.85rem] font-medium tracking-[0.5px] text-ink-muted uppercase";

export const fieldHint = "mt-2 text-xs leading-relaxed text-ink-dim";

const INPUT_BASE =
  "w-full border border-line bg-canvas py-3.5 text-[0.95rem] text-ink transition-colors duration-300 focus:border-line-focus focus:outline-none";

/** Input with room on the left for a leading icon. */
export const inputWithIcon = `${INPUT_BASE} pr-4 pl-12`;

/** Input with no leading icon, reclaiming the space one would occupy. */
export const input = `${INPUT_BASE} px-4`;

export const select = `${INPUT_BASE} cursor-pointer px-4`;

/** Vertical stack of full-width actions, used in side panels. */
export const buttonStack = "flex flex-col items-stretch gap-3";

/** Right-aligned row of actions, used under forms and confirmations. */
export const actionRow = "flex flex-wrap justify-end gap-3";

/**
 * Account-status pill, one complete class list per status.
 *
 * A lookup table rather than an interpolated class name: Tailwind only ships
 * classes it can find as literals in the source.
 */
export const statusPill: Record<UserStatus, string> = {
  active: "bg-success/10 text-emerald-400",
  pending_verification: "bg-warning/10 text-amber-400",
  inactive: "bg-ink-dim/15 text-ink-muted",
  suspended: "bg-danger/10 text-red-400",
};

/** Layout shared by every status pill, whatever its colour. */
export const statusPillBase =
  "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold uppercase";
