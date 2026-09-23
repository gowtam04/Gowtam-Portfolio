import {
  appOgImageContentType,
  appOgImageSize,
  renderAppOgImage,
} from "@/lib/app-og-image";

// Keep the description in sync with the description in
// src/app/someday/support/page.tsx.
export const alt = "Someday: a private family baby book for iPhone";
export const size = appOgImageSize;
export const contentType = appOgImageContentType;

export default async function Image() {
  return renderAppOgImage({
    kicker: "iPhone app",
    title: "Someday",
    description:
      "Get help with Someday, the private family baby book. Sign-in, invites, roles, and how to reach us.",
  });
}
