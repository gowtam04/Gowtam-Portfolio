export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-8 px-6 border-t border-[var(--border)]">
      <div className="max-w-5xl mx-auto">
        <p className="text-sm text-[var(--muted)] text-center">
          &copy; {currentYear} Gowtam Ramanujam. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
