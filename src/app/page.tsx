import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { CaseStudies } from "@/components/CaseStudies";
import { Skills } from "@/components/Skills";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Gowtam Ramanujam",
  jobTitle: "AI Product Manager",
  url: "https://gowtam.ai",
  image: "https://gowtam.ai/images/profile.jpg",
  description:
    "AI Product Manager with 7+ years of experience building AI-powered products from concept to App Store.",
  sameAs: ["https://www.linkedin.com/in/gowtamr/"],
  knowsAbout: [
    "Artificial Intelligence",
    "Product Management",
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
    jobTitle: "AI Product Manager",
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
        <CaseStudies />
        <Skills />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
