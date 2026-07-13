"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

const navLinks = [
  { href: "/#about", label: "About" },
  { href: "/#system", label: "System" },
  { href: "/case-studies", label: "Work" },
  { href: "/#skills", label: "Skills" },
  { href: "/#contact", label: "Contact" },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "border-b border-[var(--border)] bg-[var(--background)]/78 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <nav className="mx-auto max-w-5xl px-6 py-4">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="font-display text-[1.25rem] font-semibold tracking-[-0.02em] text-[var(--foreground)] transition-colors duration-150 hover:text-[var(--accent)]"
          >
            Gowtam<span className="text-[var(--accent)]">.</span>
          </Link>

          <div className="hidden items-center gap-7 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-[0.9rem] font-medium text-[var(--muted)] transition-colors duration-150 hover:text-[var(--foreground)]"
              >
                {link.label}
              </a>
            ))}
            <ThemeToggle />
          </div>

          <div className="flex items-center gap-3 md:hidden">
            <ThemeToggle />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="grid h-10 w-10 place-items-center rounded-full border border-[var(--border)] transition-colors duration-150 hover:border-[var(--border-strong)] hover:bg-[var(--surface-1)]"
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMenuOpen ? (
                <X className="h-5 w-5 text-[var(--foreground)]" />
              ) : (
                <Menu className="h-5 w-5 text-[var(--foreground)]" />
              )}
            </button>
          </div>
        </div>

        <div
          id="mobile-menu"
          className={`overflow-hidden transition-all duration-300 ease-in-out md:hidden ${
            isMenuOpen ? "mt-4 max-h-64 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="flex flex-col gap-4 border-t border-[var(--border)] py-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={handleNavClick}
                className="text-[0.95rem] font-medium text-[var(--muted)] transition-colors duration-150 hover:text-[var(--foreground)]"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
}
