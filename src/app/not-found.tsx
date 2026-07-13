import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="flex min-h-screen items-center justify-center px-6 pb-16 pt-24">
        <div className="max-w-md">
          <p className="mb-4 text-[0.78rem] font-bold uppercase tracking-[0.08em] text-[var(--accent)]">
            404
          </p>
          <h1 className="font-display text-4xl font-medium tracking-[-0.02em] text-[var(--foreground)]">
            Page not found
          </h1>
          <p className="mt-4 leading-relaxed text-[var(--muted)]">
            The page you are looking for does not exist or has been moved.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--accent-foreground)] shadow-[0_8px_24px_var(--accent-glow)] transition-colors duration-150 hover:bg-[var(--accent-hover)]"
            >
              Go home
            </Link>
            <Link
              href="/case-studies"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--border)] px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition-colors duration-150 hover:border-[var(--border-strong)] hover:bg-[var(--surface-1)]"
            >
              <ArrowLeft className="h-4 w-4" />
              View case studies
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
