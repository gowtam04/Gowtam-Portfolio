import { SectionHeading } from "./SectionHeading";
import { Reveal } from "./Reveal";
import { CaseStudiesGrid } from "./CaseStudiesGrid";

export function CaseStudies() {
  return (
    <section id="case-studies" className="scroll-mt-24 px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <SectionHeading
            index="03"
            label="Work"
            title="Case Studies"
            lede="Projects showcasing how I architect AI systems and agents, from requirements through production deployment."
          />
        </Reveal>

        <Reveal delay={60}>
          <CaseStudiesGrid />
        </Reveal>
      </div>
    </section>
  );
}
