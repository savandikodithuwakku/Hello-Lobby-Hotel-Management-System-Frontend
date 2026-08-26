import type { ReactNode } from "react";

/** One label/value pair in a read-only detail list. */
const DetailRow = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="flex border-b border-line pb-4">
    <span className="w-40 shrink-0 text-[0.95rem] font-medium text-ink-muted">{label}</span>
    <span className="text-[0.95rem] font-semibold">{children}</span>
  </div>
);

/** Container for a run of `DetailRow`s. */
export const DetailList = ({ children }: { children: ReactNode }) => (
  <div className="flex flex-col gap-5">{children}</div>
);

export default DetailRow;
