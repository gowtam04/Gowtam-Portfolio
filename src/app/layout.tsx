import type { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
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
        className={`${fraunces.variable} ${plusJakarta.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider>{children}</ThemeProvider>
        {/* Annie floating widget (staging) - remove when testing is done */}
        <Script
          src="https://annie-acs-backend-staging.fly.dev/embed/annie.js"
          data-mode="floating"
          data-position="bottom-right"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
