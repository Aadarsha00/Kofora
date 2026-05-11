import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "About Us | KOFORA",
  description: "The KOFORA story, comfort system, sustainability, and happiness guarantee.",
};

const sections = [
  {
    variant: "science",
    eyebrow: "Engineered Comfort",
    heading: (
      <>
        The Science of <br /> a Softer Step
      </>
    ),
    tagline: "Comfort is designed, not accidental.",
    description: (
      <>
        At Kofora, our <strong>Total Comfort System</strong> brings together precision support, smoother construction,
        and natural flexibility to make every step feel lighter.
      </>
    ),
    points: [
      ["Arch Support", "Balanced stability that helps reduce fatigue."],
      ["Seamless Toe", "A smoother finish with less friction and pressure."],
      ["Natural Flex", "Designed to move with your foot, not against it."],
    ],
    closing: "Softer feel. Smarter design. Better every day.",
    image: "/about/comfort.jpg",
    imageFirst: false,
  },
  {
    variant: "color",
    eyebrow: "Sustainability",
    heading: (
      <>
        Color Without <br /> Compromise
      </>
    ),
    tagline: "Bold expression should never cost the planet.",
    description: (
      <>
        At Kofora, every pair is crafted with <strong>ethically sourced combed cotton</strong> and{" "}
        <strong>non-toxic, Oeko-Tex certified dyes</strong> for comfort you can trust.
      </>
    ),
    points: [
      ["Responsible Materials", "Carefully sourced for lower impact and better quality."],
      ["Safe Dyes", "Free from harmful chemicals, gentle on skin."],
      ["Made to Last", "Durable design that reduces waste over time."],
    ],
    closing: "Better for you. Better for the planet. No compromises.",
    image: "/about/sustainability.jpg",
    imageFirst: true,
  },
  {
    variant: "guarantee",
    eyebrow: "Our Promise",
    heading: (
      <>
        100% Happiness <br /> Guarantee
      </>
    ),
    tagline: "If it doesn't feel right, we fix it. Simple.",
    description: (
      <>
        Every Kofora sock is made for <strong>all-day comfort</strong> and a{" "}
        <strong>secure, stay-in-place fit</strong> from the first wear.
      </>
    ),
    points: [
      ["No Risk", "Try them with complete confidence."],
      ["Easy Returns", "Exchange or refund, no hassle."],
      ["No Questions", "We trust your experience, always."],
    ],
    closing: "Comfort you can trust. Every single step.",
    image: "/about/promise.jpg",
    imageFirst: false,
  },
];

function AboutTextSection({ section }: { section: (typeof sections)[number] }) {
  return (
    <section className={`about-section ${section.variant}`}>
      <div className="about-inner">
        <span className="about-eyebrow">{section.eyebrow}</span>
        <h2 className="about-heading">{section.heading}</h2>
        <p className="about-tagline">
          <strong>{section.tagline}</strong>
        </p>
        <p className="about-description">{section.description}</p>

        <div className="about-points">
          {section.points.map(([title, body]) => (
            <p className="about-point" key={title}>
              <strong>{title}</strong>
              <br />
              {body}
            </p>
          ))}
        </div>

        <p className="about-closing">
          <strong>{section.closing}</strong>
        </p>
      </div>
    </section>
  );
}

function AboutImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative aspect-square w-full overflow-hidden bg-[#f5f5f2]">
      <Image src={src} alt={alt} fill className="object-cover" sizes="(min-width: 1024px) 50vw, 100vw" />
    </div>
  );
}

export default function AboutPage() {
  return (
    <main className="bg-white text-black">
      <section className="relative w-full overflow-hidden">
        <div className="relative aspect-[3.2/1] min-h-[260px] w-full md:min-h-[390px]">
          <Image
            src="/about/hero.jpg"
            alt="KOFORA about us"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute inset-0 flex items-center justify-center p-5">
            <div className="about-header text-center text-white">
              <span className="about-eyebrow !text-white">Our Story</span>
              <h1 className="about-title text-white">About Us</h1>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1200px] px-[10px] py-[60px] md:px-[15px]">
        {sections.map((section) => (
          <div key={section.variant} className="grid items-center gap-y-0 lg:grid-cols-2 lg:gap-x-[30px]">
            <div className={`about-image ${section.imageFirst ? "order-1" : "order-2"}`}>
              <AboutImage src={section.image} alt={`${section.eyebrow} KOFORA socks`} />
            </div>
            <div className={section.imageFirst ? "order-2" : "order-1"}>
              <AboutTextSection section={section} />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
