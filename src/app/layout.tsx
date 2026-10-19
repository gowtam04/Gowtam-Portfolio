import type { Metadata } from "next";
import { Caveat, Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SITE_DESCRIPTION } from "@/lib/site-content";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

// Handwriting for sticky notes drawn on canvas textures in the 3D room.
const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://gowtam.ai"),
  title: "Gowtam Ramanujam | AI Architect",
  description: SITE_DESCRIPTION,
  authors: [{ name: "Gowtam Ramanujam" }],
  openGraph: {
    title: "Gowtam Ramanujam | AI Architect",
    description: SITE_DESCRIPTION,
    siteName: "Gowtam Ramanujam Portfolio",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gowtam Ramanujam | AI Architect",
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body
        className={`${fraunces.variable} ${plusJakarta.variable} ${caveat.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
