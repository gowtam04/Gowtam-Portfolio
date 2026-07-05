import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Process } from "@/components/Process";
import { CaseStudies } from "@/components/CaseStudies";
import { Skills } from "@/components/Skills";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Gowtam Ramanujam",
  jobTitle: "AI Architect",
  url: "https://gowtam.ai",
  image: "https://gowtam.ai/images/profile.jpg",
  description:
    "AI Architect designing intelligent systems and autonomous agents. 7+ years shipping enterprise AI tools, agentic applications, and production software.",
  sameAs: [
    "https://www.linkedin.com/in/gowtam-ramanujam",
    "https://x.com/gowtam",
  ],
  knowsAbout: [
    "Artificial Intelligence",
    "Agentic AI",
    "AI System Architecture",
    "Multi-Agent Systems",
    "Machine Learning",
    "Mobile App Development",
    "Enterprise Software",
  ],
};

const profilePageJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  mainEntity: {
    "@type": "Person",
    name: "Gowtam Ramanujam",
    jobTitle: "AI Architect",
    url: "https://gowtam.ai",
    image: "https://gowtam.ai/images/profile.jpg",
  },
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(profilePageJsonLd) }}
      />
      <Header />
      <main>
        <Hero />
        <About />
        <Process />
        <CaseStudies />
        <Skills />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
