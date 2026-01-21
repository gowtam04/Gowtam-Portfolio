import Image from "next/image";

export function About() {
  return (
    <section id="about" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <h2 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] mb-16 tracking-tight">
          About Me
        </h2>

        <div className="grid md:grid-cols-5 gap-12 items-start">
          {/* Photo */}
          <div className="md:col-span-2">
            <div className="aspect-square rounded-2xl bg-[var(--border)] flex items-center justify-center overflow-hidden">
              <Image
                src="/images/profile.jpg"
                alt="Gowtam Ramanujam"
                width={400}
                height={400}
                priority
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Bio Content */}
          <div className="md:col-span-3 space-y-6">
            <p className="text-lg text-[var(--foreground)] leading-relaxed">
              I&apos;m an AI Product Manager with 7+ years of experience designing, building, and shipping software products. My journey spans healthcare software, enterprise AI tools, mobile apps, and even game development. I&apos;m passionate about translating complex business requirements into elegant, user-focused products.
            </p>

            <p className="text-lg text-[var(--muted)] leading-relaxed">
              My approach centers on client collaboration and rapid execution. I begin by conducting stakeholder interviews to deeply understand the problem and desired outcomes. From there, I design a tailored solution and create comprehensive requirements documentation. Once the client approves, I develop a technical design document and leverage AI-powered tools like Claude Code to rapidly build and deliver a working MVP.
            </p>

            <p className="text-lg text-[var(--muted)] leading-relaxed">
              I&apos;ve shipped 3 iOS applications to the App Store, deployed enterprise AI tools used by multiple clients, and co-founded a game studio that released a title with 500,000+ downloads. I&apos;m excited about the future of AI-native products and the opportunity to build tools that genuinely improve people&apos;s lives.
            </p>

            {/* Optional: Quick Facts */}
            <div className="pt-6 border-t border-[var(--border)]">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                <div>
                  <p className="text-2xl font-bold text-[var(--accent)]">7+</p>
                  <p className="text-sm text-[var(--muted)]">Years Experience</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-[var(--accent)]">15+</p>
                  <p className="text-sm text-[var(--muted)]">Products Shipped</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-[var(--accent)]">500K+</p>
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
