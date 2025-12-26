import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Briefcase, Clock } from "lucide-react";
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
