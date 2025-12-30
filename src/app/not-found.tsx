import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="min-h-screen flex items-center justify-center px-6 pt-24 pb-16">
        <div className="text-center max-w-md">
          <h1 className="text-6xl font-bold text-[var(--foreground)] mb-4">
            404
          </h1>
          <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">
            Page Not Found
          </h2>
          <p className="text-[var(--muted)] mb-8">
            The page you are looking for does not exist or has been moved.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[var(--foreground)] text-[var(--background)] rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
            >
              <Home className="w-4 h-4" />
              Go Home
            </Link>
            <Link
              href="/#case-studies"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-[var(--border)] rounded-lg text-[var(--foreground)] font-medium text-sm hover:bg-[var(--border)] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              View Case Studies
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
