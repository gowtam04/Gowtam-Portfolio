import {
  appOgImageContentType,
  appOgImageSize,
  renderAppOgImage,
} from "@/lib/app-og-image";

// Keep the description in sync with the description in
// src/app/dead-center/support/page.tsx.
export const alt = "DEAD CENTER: a one-thumb iPhone arcade";
export const size = appOgImageSize;
export const contentType = appOgImageContentType;

export default async function Image() {
  return renderAppOgImage({
    kicker: "iPhone app",
    title: "DEAD CENTER",
    description:
      "Get help with DEAD CENTER, the one-thumb iPhone arcade. How to play, mute, haptics, and how to reach us.",
  });
}
