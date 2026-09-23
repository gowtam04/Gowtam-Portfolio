import { Fragment } from "react";
import Link from "next/link";
import type { RichText, RoomBlock, RoomSection } from "@/lib/room-content";
import { LONGER_CONTENT, isPlaceholder, proseToRich } from "@/lib/room-content";
import { Placeholder } from "./Placeholder";

/**
 * Renders a run of rich text (strings, placeholders, links). Server-safe, shared
 * by the room panel and the /plain page.
 */
export function Rich({
  text,
  variant = "room",
  linkClassName,
}: {
  text: RichText;
  variant?: "room" | "site";
  linkClassName?: string;
}) {
  return (
    <>
      {text.map((part, i) => {
        if (typeof part === "string") return <Fragment key={i}>{part}</Fragment>;
        if (isPlaceholder(part)) return <Placeholder key={i} placeholder={part} variant={variant} />;
        if (part.external) {
          return (
            <a key={i} href={part.href} target="_blank" rel="noopener noreferrer" className={linkClassName}>
              {part.label}
            </a>
          );
        }
        return (
          <Link key={i} href={part.href} className={linkClassName}>
            {part.label}
          </Link>
        );
      })}
    </>
  );
}

function richHasPlaceholder(text: RichText): boolean {
  return text.some((part) => isPlaceholder(part));
}

function blockHasPlaceholder(block: RoomBlock): boolean {
  switch (block.type) {
    case "facts":
    case "chips":
      return block.items.some(richHasPlaceholder);
    case "spec":
      return block.rows.some((row) => richHasPlaceholder(row.value));
    case "longer":
      return LONGER_CONTENT[block.source].sections.some((s) =>
        [...s.paragraphs, ...(s.bullets ?? [])].some((p) => richHasPlaceholder(proseToRich(p))),
      );
    default:
      return false;
  }
}

/** True when a section shows at least one placeholder chip (drives the legend line). */
export function sectionHasPlaceholders(section: RoomSection): boolean {
  return richHasPlaceholder(section.lead) || section.blocks.some(blockHasPlaceholder);
}

/** True when a chip item is exactly one placeholder (render the dashed chip bare). */
export function isBarePlaceholder(text: RichText): boolean {
  return text.length === 1 && isPlaceholder(text[0]);
}
