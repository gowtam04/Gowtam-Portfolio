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
  title: "Gowtam Ramanujam | AI Product Manager",
  description:
    "Your AI Product Partner. Building AI-powered products from concept to App Store with 7+ years of experience in product management and AI-assisted development.",
  keywords: [
    "AI Product Manager",
    "Product Management",
    "Machine Learning",
    "Artificial Intelligence",
    "Product Strategy",
  ],
  authors: [{ name: "Gowtam Ramanujam" }],
  openGraph: {
    title: "Gowtam Ramanujam | AI Product Manager",
    description:
      "Your AI Product Partner. Building AI-powered products from concept to App Store with 7+ years of experience.",
    url: "https://gowtam.ai",
    siteName: "Gowtam Ramanujam Portfolio",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gowtam Ramanujam | AI Product Manager",
    description:
      "Your AI Product Partner. Building AI-powered products from concept to App Store with 7+ years of experience.",
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
