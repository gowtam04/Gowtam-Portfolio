import { User } from "lucide-react";

export function About() {
  return (
    <section id="about" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <h2 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] mb-16 tracking-tight">
          About Me
        </h2>

        <div className="grid md:grid-cols-5 gap-12 items-start">
          {/* Photo Placeholder */}
          <div className="md:col-span-2">
            <div className="aspect-square rounded-2xl bg-[var(--border)] flex items-center justify-center overflow-hidden">
              {/* Replace with your photo */}
              <div className="w-full h-full flex flex-col items-center justify-center text-[var(--muted)]">
                <User className="w-24 h-24 mb-4 opacity-50" />
                <p className="text-sm">[Your Photo]</p>
              </div>
            </div>
          </div>

          {/* Bio Content */}
          <div className="md:col-span-3 space-y-6">
            <p className="text-lg text-[var(--foreground)] leading-relaxed">
              [Opening paragraph about who you are and your background. This should be a strong introduction that captures your professional identity and what drives you. Mention your years of experience and key industries you&apos;ve worked in.]
            </p>

            <p className="text-lg text-[var(--muted)] leading-relaxed">
              [Second paragraph about your approach to product management and AI. Discuss your philosophy on building products, how you leverage AI/ML technologies, and what makes your approach unique. Include specific methodologies or frameworks you use.]
            </p>

            <p className="text-lg text-[var(--muted)] leading-relaxed">
              [Third paragraph about your achievements and what you&apos;re looking for. Highlight key accomplishments, products you&apos;ve shipped, or impact you&apos;ve made. End with what excites you about the future of AI in product development.]
            </p>

            {/* Optional: Quick Facts */}
            <div className="pt-6 border-t border-[var(--border)]">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                <div>
                  <p className="text-2xl font-bold text-[var(--accent)]">[X]+</p>
                  <p className="text-sm text-[var(--muted)]">Years Experience</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-[var(--accent)]">[X]+</p>
                  <p className="text-sm text-[var(--muted)]">Products Shipped</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-[var(--accent)]">[X]M+</p>
                  <p className="text-sm text-[var(--muted)]">Users Impacted</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
