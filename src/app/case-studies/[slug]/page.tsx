import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Briefcase, Clock, ExternalLink } from "lucide-react";
import { getCaseStudy, getAllCaseStudySlugs } from "@/lib/case-studies";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getAllCaseStudySlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const caseStudy = getCaseStudy(slug);

  if (!caseStudy) {
    return {
      title: "Case Study Not Found",
    };
  }

  return {
    title: `${caseStudy.title} | Gowtam Ramanujam`,
    description: caseStudy.description,
  };
}

export default async function CaseStudyPage({ params }: PageProps) {
  const { slug } = await params;
  const caseStudy = getCaseStudy(slug);

  if (!caseStudy) {
    notFound();
  }

  return (
    <>
      <Header />
      <main className="pt-24 pb-16 px-6">
        <article className="max-w-3xl mx-auto">
          {/* Back Link */}
          <Link
            href="/#case-studies"
            className="inline-flex items-center gap-2 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Case Studies</span>
          </Link>

          {/* Header */}
          <header className="mb-12">
            <span className="inline-block px-3 py-1 text-xs font-medium text-[var(--accent)] bg-[var(--accent)]/10 rounded-full mb-4">
              {caseStudy.category}
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--foreground)] mb-6 tracking-tight leading-tight">
              {caseStudy.title}
            </h1>
            <p className="text-lg text-[var(--muted)] leading-relaxed">
              {caseStudy.description}
            </p>

            {/* App Store Button */}
            {caseStudy.appStoreUrl && (
              <a
                href={caseStudy.appStoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 bg-[var(--foreground)] text-[var(--background)] rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                Download on the App Store
                <ExternalLink className="w-4 h-4" />
              </a>
            )}

            {/* External Link Button */}
            {caseStudy.externalLink && (
              <a
                href={caseStudy.externalLink.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 bg-[var(--foreground)] text-[var(--background)] rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
              >
                {caseStudy.externalLink.label}
                <ExternalLink className="w-4 h-4" />
              </a>
            )}

            {/* Meta Info */}
            <div className="flex flex-wrap gap-6 mt-8 pt-8 border-t border-[var(--border)]">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[var(--muted)]" />
                <span className="text-sm text-[var(--muted)]">{caseStudy.role}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[var(--muted)]" />
                <span className="text-sm text-[var(--muted)]">{caseStudy.duration}</span>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="space-y-12">
            {/* Overview */}
            <section>
              <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">
                Overview
              </h2>
              <p className="text-[var(--foreground)] leading-relaxed">
                {caseStudy.overview}
              </p>
            </section>

            {/* Challenge */}
            <section>
              <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">
                The Challenge
              </h2>
              <p className="text-[var(--foreground)] leading-relaxed">
                {caseStudy.challenge}
              </p>
            </section>

            {/* Solution */}
            <section>
              <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">
                The Solution
              </h2>
              <p className="text-[var(--foreground)] leading-relaxed">
                {caseStudy.solution}
              </p>
            </section>

            {/* Results */}
            <section>
              <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">
                Results & Impact
              </h2>
              <ul className="space-y-3">
                {caseStudy.results.map((result, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 text-[var(--foreground)]"
                  >
                    <span className="w-2 h-2 rounded-full bg-[var(--accent)] mt-2 flex-shrink-0" />
                    <span className="leading-relaxed">{result}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Technologies */}
            <section>
              <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">
                Technologies & Tools
              </h2>
              <div className="flex flex-wrap gap-2">
                {caseStudy.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1.5 text-sm border border-[var(--border)] rounded-lg text-[var(--foreground)]"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </section>
          </div>

          {/* Navigation */}
          <div className="mt-16 pt-8 border-t border-[var(--border)]">
            <Link
              href="/#case-studies"
              className="inline-flex items-center gap-2 text-[var(--accent)] hover:gap-3 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>View All Case Studies</span>
            </Link>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
