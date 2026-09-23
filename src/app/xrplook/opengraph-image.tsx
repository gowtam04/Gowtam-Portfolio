import {
  appOgImageContentType,
  appOgImageSize,
  renderAppOgImage,
} from "@/lib/app-og-image";

// Keep the description in sync with the openGraph.description in
// src/app/xrplook/page.tsx.
export const alt =
  "XRPLook: a private, read-only XRP tracker for iPhone";
export const size = appOgImageSize;
export const contentType = appOgImageContentType;

export default async function Image() {
  return renderAppOgImage({
    kicker: "iPhone app",
    title: "XRPLook",
    description:
      "A private, read-only XRP tracker for iPhone. Watch balances and history without ever entering a key.",
  });
}
