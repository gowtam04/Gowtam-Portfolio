import { Linkedin, Mail, ArrowDown } from "lucide-react";

export function Hero() {
  return (
    <section className="min-h-screen flex flex-col justify-center items-center px-6 pt-20">
      <div className="max-w-3xl mx-auto text-center">
        {/* Name */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[var(--foreground)] mb-4 tracking-tight">
          Gowtam Ramanujam
        </h1>

        {/* Title */}
        <p className="text-xl sm:text-2xl text-[var(--accent)] font-medium mb-6">
          AI Product Manager
        </p>

        {/* Tagline */}
        <p className="text-lg sm:text-xl text-[var(--muted)] mb-10 max-w-xl mx-auto leading-relaxed">
          [Your compelling tagline here — describe what you do and the value you bring]
        </p>

        {/* Social Links */}
        <div className="flex items-center justify-center gap-4">
          <a
            href="https://www.linkedin.com/in/gowtam-ramanujam/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-3 rounded-lg border border-[var(--border)] text-[var(--foreground)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all duration-200"
            aria-label="LinkedIn Profile"
          >
            <Linkedin className="w-5 h-5" />
            <span className="text-sm font-medium">LinkedIn</span>
          </a>
          <a
            href="mailto:your.email@example.com"
            className="flex items-center gap-2 px-5 py-3 rounded-lg bg-[var(--accent)] text-[var(--accent-foreground)] hover:opacity-90 transition-all duration-200"
            aria-label="Send Email"
          >
            <Mail className="w-5 h-5" />
            <span className="text-sm font-medium">Email Me</span>
          </a>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
        <a
          href="#about"
          className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
          aria-label="Scroll to About section"
        >
          <ArrowDown className="w-6 h-6" />
        </a>
      </div>
    </section>
  );
}
