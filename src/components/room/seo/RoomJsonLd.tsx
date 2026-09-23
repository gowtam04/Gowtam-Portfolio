import type { RoutedSpotId } from "@/lib/room-content";

/**
 * STUB (Phase 0). Owner: SEO agent.
 * Structured data for a room route (`null` = homepage: Person + ProfilePage).
 */
export function RoomJsonLd({ spot }: { spot: RoutedSpotId | null }) {
  if (spot !== null) return null;
  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Gowtam Ramanujam",
    jobTitle: "AI Architect",
    url: "https://gowtam.ai",
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(person) }} />;
}
