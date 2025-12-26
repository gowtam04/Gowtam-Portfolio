import { Mail, Linkedin, ArrowUpRight } from "lucide-react";

export function Contact() {
  return (
    <section id="contact" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <div className="max-w-2xl">
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] mb-4 tracking-tight">
            Let&apos;s Connect
          </h2>
          <p className="text-lg text-[var(--muted)] mb-12">
            I&apos;m always interested in discussing new opportunities, AI product challenges, or just connecting with fellow product enthusiasts.
          </p>
        </div>

        {/* Contact Links */}
        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href="mailto:your.email@example.com"
            className="group flex items-center justify-between p-6 rounded-xl border border-[var(--border)] hover:border-[var(--accent)] transition-all duration-300 flex-1 max-w-sm"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center group-hover:bg-[var(--accent)]/20 transition-colors">
                <Mail className="w-6 h-6 text-[var(--accent)]" />
              </div>
              <div>
                <p className="font-medium text-[var(--foreground)]">Email</p>
                <p className="text-sm text-[var(--muted)]">your.email@example.com</p>
              </div>
            </div>
            <ArrowUpRight className="w-5 h-5 text-[var(--muted)] group-hover:text-[var(--accent)] transition-colors" />
          </a>

          <a
            href="https://linkedin.com/in/yourprofile"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between p-6 rounded-xl border border-[var(--border)] hover:border-[var(--accent)] transition-all duration-300 flex-1 max-w-sm"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center group-hover:bg-[var(--accent)]/20 transition-colors">
                <Linkedin className="w-6 h-6 text-[var(--accent)]" />
              </div>
              <div>
                <p className="font-medium text-[var(--foreground)]">LinkedIn</p>
                <p className="text-sm text-[var(--muted)]">linkedin.com/in/yourprofile</p>
              </div>
            </div>
            <ArrowUpRight className="w-5 h-5 text-[var(--muted)] group-hover:text-[var(--accent)] transition-colors" />
          </a>
        </div>
      </div>
    </section>
  );
}
