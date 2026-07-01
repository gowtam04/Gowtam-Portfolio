import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://gowtam.ai"),
  title: "Gowtam Ramanujam | AI Architect",
  description:
    "AI Architect designing intelligent systems and autonomous agents. 7+ years shipping enterprise AI tools, agentic applications, and production software.",
  keywords: [
    "AI Architect",
    "Agentic AI",
    "AI Systems",
    "System Architecture",
    "Multi-Agent Systems",
    "Machine Learning",
    "Artificial Intelligence",
  ],
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
    images: [
      {
        url: "/images/profile.jpg",
        width: 1200,
        height: 630,
        alt: "Gowtam Ramanujam - AI Architect",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Gowtam Ramanujam | AI Architect",
    description:
      "AI Architect designing intelligent systems and autonomous agents. 7+ years shipping enterprise AI tools, agentic applications, and production software.",
    images: ["/images/profile.jpg"],
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
      <body className={`${inter.variable} antialiased`} suppressHydrationWarning>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
