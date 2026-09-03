import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const productLinks = [
  { href: "/someday/privacy", label: "Privacy" },
  { href: "/someday/support", label: "Support" },
];

export default function SomedayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="px-6 pb-16 pt-28">
        <div className="mx-auto max-w-3xl">
          <nav
            aria-label="Someday"
            className="mb-10 flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-[var(--border)] pb-4 text-[0.85rem] font-medium"
          >
            <span className="font-display text-[0.95rem] font-semibold tracking-[-0.02em] text-[var(--foreground)]">
              Someday
            </span>
            <span
              aria-hidden="true"
              className="hidden h-3 w-px bg-[var(--border)] sm:block"
            />
            {productLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[var(--muted)] transition-colors duration-150 hover:text-[var(--foreground)]"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          {children}
        </div>
      </main>
      <Footer />
    </>
  );
}
