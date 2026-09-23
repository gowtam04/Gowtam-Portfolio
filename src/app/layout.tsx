import type { Metadata } from "next";
import { Caveat, Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
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
  description:
    "AI Architect designing intelligent systems and autonomous agents. 7+ years shipping enterprise AI tools, agentic applications, and production software.",
  authors: [{ name: "Gowtam Ramanujam" }],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Gowtam Ramanujam | AI Architect",
    description:
      "AI Architect designing intelligent systems and autonomous agents. 7+ years shipping enterprise AI tools, agentic applications, and production software.",
    url: "https://gowtam.ai",
    siteName: "Gowtam Ramanujam Portfolio",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gowtam Ramanujam | AI Architect",
    description:
      "AI Architect designing intelligent systems and autonomous agents. 7+ years shipping enterprise AI tools, agentic applications, and production software.",
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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fraunces.variable} ${plusJakarta.variable} ${caveat.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
