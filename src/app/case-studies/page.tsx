import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SectionHeading } from "@/components/SectionHeading";
import { CaseStudiesGrid } from "@/components/CaseStudiesGrid";
import { caseStudies } from "@/lib/case-studies";

export const metadata: Metadata = {
  title: "Work | Gowtam Ramanujam",
  description:
    "A portfolio of AI systems and autonomous agents: reasoning agents, production LLM platforms, and enterprise AI tools, from requirements through deployment.",
  alternates: {
    canonical: "/case-studies",
  },
};

const itemListJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  itemListElement: caseStudies.map((cs, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: cs.title,
    url: `https://gowtam.ai/case-studies/${cs.slug}`,
  })),
};

export default function CaseStudiesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <Header />
      <main className="px-6 pb-24 pt-28">
        <div className="mx-auto max-w-5xl">
          <SectionHeading
            index="01"
            label="Work"
            title="Work"
            lede="Selected projects showing how I architect AI systems and agents, from requirements through production deployment, each with a full case study."
          />
          <CaseStudiesGrid />
        </div>
      </main>
      <Footer />
    </>
  );
}
