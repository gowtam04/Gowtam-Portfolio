export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--border)] px-6 py-8">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2">
        <p className="text-[0.85rem] text-[var(--faint)]">
          &copy; {currentYear} Gowtam Ramanujam
        </p>
        <p className="text-[0.85rem] text-[var(--faint)]">gowtam.ai</p>
      </div>
    </footer>
  );
}
