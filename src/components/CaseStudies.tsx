import { SectionHeading } from "./SectionHeading";
import { Reveal } from "./Reveal";
import { CaseStudiesGrid } from "./CaseStudiesGrid";

export function CaseStudies() {
  return (
    <section id="case-studies" className="scroll-mt-24 px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <SectionHeading
            label="Selected work"
            title="Case studies with the architecture left in."
            lede="Flagship systems up front. Everything else as a clean index. Outcomes and decisions, not marketing copy."
          />
        </Reveal>

        <Reveal delay={60}>
          <CaseStudiesGrid />
        </Reveal>
      </div>
    </section>
  );
}
