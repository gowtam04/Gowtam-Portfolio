import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import {
  caseStudies,
  getCaseStudy,
  getAllCaseStudySlugs,
  CaseStudy,
} from "@/lib/case-studies";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CaseStudyBody } from "@/components/CaseStudyBody";
import { CaseStudyToc } from "@/components/CaseStudyToc";
import { CountUp } from "@/components/CountUp";
import { getDiagram } from "@/components/diagrams";
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

  const title = `${caseStudy.seoTitle ?? caseStudy.title} | Gowtam Ramanujam`;
  const description = caseStudy.metaDescription ?? caseStudy.description;

  return {
    title,
    description,
    alternates: {
      canonical: `/case-studies/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://gowtam.ai/case-studies/${slug}`,
      siteName: "Gowtam Ramanujam Portfolio",
      locale: "en_US",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

function generateArticleJsonLd(caseStudy: CaseStudy, slug: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: caseStudy.title,
    description: caseStudy.description,
    author: {
      "@type": "Person",
      name: "Gowtam Ramanujam",
      url: "https://gowtam.ai",
    },
    publisher: {
      "@type": "Person",
      name: "Gowtam Ramanujam",
      url: "https://gowtam.ai",
    },
    url: `https://gowtam.ai/case-studies/${slug}`,
    image: `https://gowtam.ai/case-studies/${slug}/opengraph-image`,
    ...(caseStudy.datePublished && { datePublished: caseStudy.datePublished }),
    ...(caseStudy.dateUpdated && { dateModified: caseStudy.dateUpdated }),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://gowtam.ai/case-studies/${slug}`,
    },
  };
}

function generateBreadcrumbJsonLd(caseStudy: CaseStudy, slug: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://gowtam.ai",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Case Studies",
        item: "https://gowtam.ai/case-studies",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: caseStudy.title,
        item: `https://gowtam.ai/case-studies/${slug}`,
      },
    ],
  };
}

function SectionHeader({ index, title }: { index: string; title: string }) {
  return (
    <div className="mb-6 flex items-center gap-4">
      <span className="mono-label text-[var(--accent)]">{index}</span>
      <h2 className="text-xl font-semibold tracking-[-0.01em] text-[var(--foreground)]">
        {title}
      </h2>
      <span aria-hidden="true" className="h-px flex-1 bg-[var(--border)]" />
    </div>
  );
}

export default async function CaseStudyPage({ params }: PageProps) {
  const { slug } = await params;
  const caseStudy = getCaseStudy(slug);

  if (!caseStudy) {
    notFound();
  }

  const articleJsonLd = generateArticleJsonLd(caseStudy, slug);
  const breadcrumbJsonLd = generateBreadcrumbJsonLd(caseStudy, slug);
  const diagram = getDiagram(slug);

  const index = caseStudies.findIndex((cs) => cs.slug === slug);
  const prev = index > 0 ? caseStudies[index - 1] : null;
  const next = index < caseStudies.length - 1 ? caseStudies[index + 1] : null;

  const externalCta = caseStudy.externalLink
    ? { url: caseStudy.externalLink.url, label: caseStudy.externalLink.label }
    : caseStudy.appStoreUrl
      ? { url: caseStudy.appStoreUrl, label: "Download on the App Store" }
      : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Header />
      <main className="px-6 pb-16 pt-28">
        <div className="relative mx-auto max-w-3xl">
          <CaseStudyToc />

          <article>
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2">
              <Link
                href="/case-studies"
                className="mono-label transition-colors duration-150 hover:text-[var(--foreground)]"
              >
                Work
              </Link>
              <span aria-hidden="true" className="mono-label">
                /
              </span>
              <span className="mono-label text-[var(--foreground)]">
                {caseStudy.title}
              </span>
            </nav>

            {/* Header */}
            <header>
              <h1 className="text-4xl font-semibold leading-[1.05] tracking-[-0.02em] text-[var(--foreground)] sm:text-5xl">
                {caseStudy.title}
              </h1>
              <p className="mt-5 max-w-[62ch] text-lg leading-relaxed text-[var(--muted)]">
                {caseStudy.description}
              </p>

              {externalCta && (
                <a
                  href={externalCta.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-7 inline-flex items-center gap-2 rounded-md bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-[var(--accent-foreground)] transition-colors duration-150 hover:bg-[var(--accent-hover)]"
                >
                  {externalCta.label}
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}

              {/* Metadata band */}
              <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-5 border-y border-[var(--border)] py-5 lg:grid-cols-4">
                <div>
                  <dt className="mono-label">Role</dt>
                  <dd className="mono-meta mt-1.5 text-[var(--foreground)]">
                    {caseStudy.role}
                  </dd>
                </div>
                <div>
                  <dt className="mono-label">Year</dt>
                  <dd className="mono-meta mt-1.5 text-[var(--foreground)]">
                    {caseStudy.duration}
                  </dd>
                </div>
                <div>
                  <dt className="mono-label">Type</dt>
                  <dd className="mono-meta mt-1.5 flex items-center gap-2 text-[var(--foreground)]">
                    <span
                      aria-hidden="true"
                      className={`inline-block h-1.5 w-1.5 rounded-full ${
                        caseStudy.projectType === "professional"
                          ? "bg-[var(--accent)]"
                          : "bg-[var(--faint)]"
                      }`}
                    />
                    {caseStudy.projectType === "independent"
                      ? "Independent"
                      : "Professional"}
                  </dd>
                </div>
                <div>
                  <dt className="mono-label">
                    {caseStudy.clientName ? "Client" : "Category"}
                  </dt>
                  <dd className="mono-meta mt-1.5 text-[var(--foreground)]">
                    {caseStudy.clientName ?? caseStudy.category}
                  </dd>
                </div>
                <div className="col-span-2 lg:col-span-4">
                  <dt className="mono-label">Stack</dt>
                  <dd className="mono-meta mt-1.5">
                    {caseStudy.technologies.join(" · ")}
                  </dd>
                </div>
              </dl>

              {/* Outcome stat band */}
              {caseStudy.stats && caseStudy.stats.length > 0 && (
                <div
                  className={`grid grid-cols-2 gap-x-6 gap-y-8 border-b border-[var(--border)] py-8 ${
                    caseStudy.stats.length === 3
                      ? "sm:grid-cols-3"
                      : caseStudy.stats.length >= 4
                        ? "sm:grid-cols-4"
                        : ""
                  }`}
                >
                  {caseStudy.stats.map((stat) => (
                    <div key={stat.label}>
                      <CountUp
                        value={stat.value}
                        className="mono-stat block text-3xl sm:text-4xl"
                      />
                      <p className="mono-label mt-2">{stat.label}</p>
                    </div>
                  ))}
                </div>
              )}
            </header>

            {/* Content */}
            <div className="mt-16 space-y-16">
              <section id="overview" className="scroll-mt-28">
                <SectionHeader index="01" title="Overview" />
                <CaseStudyBody content={caseStudy.overview} />
              </section>

              <section id="challenge" className="scroll-mt-28">
                <SectionHeader index="02" title="The Challenge" />
                <CaseStudyBody content={caseStudy.challenge} />
              </section>

              <section id="solution" className="scroll-mt-28">
                <SectionHeader index="03" title="The Solution" />
                {diagram && (
                  <figure className="mb-8 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] p-5 sm:p-7">
                    {diagram}
                    <figcaption className="mono-label mt-4">
                      {caseStudy.title} / system architecture
                    </figcaption>
                  </figure>
                )}
                <CaseStudyBody content={caseStudy.solution} />
              </section>

              <section id="results" className="scroll-mt-28">
                <SectionHeader index="04" title="Results & Impact" />
                <ul className="space-y-3">
                  {caseStudy.results.map((result, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 text-[var(--muted)]"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-[0.7em] h-px w-3 flex-shrink-0 bg-[var(--accent)]"
                      />
                      <span className="leading-[1.65]">{result}</span>
                    </li>
                  ))}
                </ul>

                {caseStudy.testimonial && (
                  <blockquote className="mt-10 rounded-lg border-l-2 border-[var(--accent)] bg-[var(--surface-1)] p-6">
                    <p className="leading-relaxed text-[var(--foreground)]">
                      &ldquo;{caseStudy.testimonial}&rdquo;
                    </p>
                    {caseStudy.clientName && (
                      <footer className="mono-label mt-4">
                        {caseStudy.clientName}
                      </footer>
                    )}
                  </blockquote>
                )}
              </section>
            </div>

            {/* Prev / next navigation */}
            <nav
              aria-label="Case study navigation"
              className="mt-20 grid grid-cols-2 gap-6 border-t border-[var(--border)] pt-8"
            >
              <div>
                {prev && (
                  <Link href={`/case-studies/${prev.slug}`} className="group inline-block">
                    <p className="mono-label flex items-center gap-2">
                      <ArrowLeft className="h-3 w-3 transition-transform duration-150 group-hover:-translate-x-0.5" />
                      Previous
                    </p>
                    <p className="mt-2 text-sm font-semibold text-[var(--foreground)] transition-colors duration-150 group-hover:text-[var(--accent)]">
                      {prev.title}
                    </p>
                  </Link>
                )}
              </div>
              <div className="text-right">
                {next && (
                  <Link href={`/case-studies/${next.slug}`} className="group inline-block">
                    <p className="mono-label flex items-center justify-end gap-2">
                      Next
                      <ArrowRight className="h-3 w-3 transition-transform duration-150 group-hover:translate-x-0.5" />
                    </p>
                    <p className="mt-2 text-sm font-semibold text-[var(--foreground)] transition-colors duration-150 group-hover:text-[var(--accent)]">
                      {next.title}
                    </p>
                  </Link>
                )}
              </div>
            </nav>
          </article>
        </div>
      </main>
      <Footer />
    </>
  );
}
