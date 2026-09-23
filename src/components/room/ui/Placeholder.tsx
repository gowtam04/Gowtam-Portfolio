import type { Placeholder as PlaceholderData } from "@/lib/room-content";

/**
 * Dashed "fill me in" chip for an unknown personal detail. Server-safe (no
 * "use client"), so the room panels and the /plain page share it.
 *
 * - `room`: the fixed dark room chrome (styled by `.room-fill` in room.css).
 * - `site`: the classic site, themed with the global CSS tokens.
 */
export function Placeholder({
  placeholder,
  variant = "room",
}: {
  placeholder: PlaceholderData;
  variant?: "room" | "site";
}) {
  const className =
    variant === "room"
      ? "room-fill"
      : "inline-flex items-center rounded-[9px] border-[1.5px] border-dashed border-[var(--accent)] bg-[var(--accent-subtle)] px-2 py-0.5 align-baseline text-[0.85em] font-medium leading-snug text-[var(--accent)]";
  return (
    <span className={className} data-placeholder={placeholder.key} title="Placeholder: fill me in">
      [{placeholder.label}]
    </span>
  );
}

/** The "Dashed chips are placeholders" legend line. */
export function PlaceholderLegend({ variant = "room" }: { variant?: "room" | "site" }) {
  if (variant === "room") {
    return (
      <p className="room-legend">
        <span className="room-fill room-fill-sm" aria-hidden="true">
          [ ]
        </span>
        Dashed chips are placeholders to fill in.
      </p>
    );
  }
  return (
    <p className="flex items-center gap-2 text-[0.8rem] text-[var(--faint)]">
      <span
        className="inline-flex rounded-[6px] border-[1.5px] border-dashed border-[var(--accent)] bg-[var(--accent-subtle)] px-1.5 text-[0.7rem] text-[var(--accent)]"
        aria-hidden="true"
      >
        [ ]
      </span>
      Dashed chips are placeholders to fill in.
    </p>
  );
}
