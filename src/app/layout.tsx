import type { Metadata } from "next";
import { Instrument_Sans, IBM_Plex_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
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
        className={`${instrumentSans.variable} ${plexMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider>
          {/* Drafting-margin frame: hairline rules at the content column edges */}
          <div
            aria-hidden="true"
            className="pointer-events-none fixed inset-y-0 left-1/2 z-0 hidden w-full max-w-[68rem] -translate-x-1/2 border-x border-[var(--frame)] xl:block"
          />
          <div className="relative z-10">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  );
}
