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
  title: "[Your Name] | AI Product Manager",
  description:
    "[Your compelling tagline here — describe what you do and the value you bring as an AI Product Manager]",
  keywords: [
    "AI Product Manager",
    "Product Management",
    "Machine Learning",
    "Artificial Intelligence",
    "Product Strategy",
  ],
  authors: [{ name: "[Your Name]" }],
  openGraph: {
    title: "[Your Name] | AI Product Manager",
    description:
      "[Your compelling tagline here — describe what you do and the value you bring]",
    url: "https://yourwebsite.com",
    siteName: "[Your Name] Portfolio",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "[Your Name] | AI Product Manager",
    description:
      "[Your compelling tagline here — describe what you do and the value you bring]",
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
      <body className={`${inter.variable} antialiased`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
