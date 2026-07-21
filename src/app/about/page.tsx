import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "About Us | KOFORA",
  description: "The KOFORA story, comfort system, sustainability, and comfort promise.",
};

type AboutSection = {
  eyebrow: string;
  heading: string;
  tagline: string;
  description: ReactNode;
  points: Array<[string, string]>;
  closing: string;
  image: string;
  imageAlt: string;
  imageFirst: boolean;
  background: string;
  number: string;
};

const sections: AboutSection[] = [
  {
    eyebrow: "Engineered comfort",
    heading: "The Science of a Softer Step",
    tagline: "Comfort is designed, not accidental.",
    description: (
      <>
        Our <strong className="font-semibold text-black">Total Comfort System</strong> brings together precision
        support, smoother construction, and natural flexibility to make every step feel lighter.
      </>
    ),
    points: [
      ["Arch Support", "Balanced stability that helps reduce fatigue."],
      ["Seamless Toe", "A smoother finish with less friction and pressure."],
      ["Natural Flex", "Designed to move with your foot, not against it."],
    ],
    closing: "Softer feel. Smarter design. Better every day.",
    image: "/about/comfort.jpg",
    imageAlt: "Soft neutral KOFORA socks styled for everyday comfort",
    imageFirst: true,
    background: "bg-white",
    number: "01",
  },
  {
    eyebrow: "Thoughtful materials",
    heading: "Color Without Compromise",
    tagline: "Bold expression should never cost the planet.",
    description: (
      <>
        Every pair is made with thoughtfully selected fibers and{" "}
        <strong className="font-semibold text-black">non-toxic, OEKO-TEX® certified dyes</strong> for color and
        comfort you can trust.
      </>
    ),
    points: [
      ["Responsible Materials", "Carefully selected for lower impact and lasting quality."],
      ["Safer Dyes", "Free from harmful chemicals and gentle on skin."],
      ["Made to Last", "Durable construction designed for more wears and less waste."],
    ],
    closing: "Better for you. Better for the planet.",
    image: "/about/sustainability.jpg",
    imageAlt: "Blue ribbed KOFORA socks made with thoughtfully selected materials",
    imageFirst: false,
    background: "bg-white",
    number: "02",
  },
  {
    eyebrow: "Our promise",
    heading: "Comfort You Can Count On",
    tagline: "If something does not feel right, we are here to help.",
    description: (
      <>
        Every KOFORA sock is made for <strong className="font-semibold text-black">all-day comfort</strong> and a{" "}
        <strong className="font-semibold text-black">secure, stay-in-place fit</strong> from the first wear.
      </>
    ),
    points: [
      ["30-Day Returns", "Return eligible items within 30 days of delivery."],
      ["Straightforward Support", "Start with your order number and a quick note to our team."],
      ["We Make Errors Right", "We cover return shipping for defective or incorrect items."],
    ],
    closing: "Comfort you can trust. Every single step.",
    image: "/about/promise.jpg",
    imageAlt: "Mustard yellow KOFORA socks showing a relaxed comfortable fit",
    imageFirst: true,
    background: "bg-white",
    number: "03",
  },
];

function StorySection({ section }: { section: AboutSection }) {
  return (
    <section className={section.background}>
      <div className="mx-auto grid max-w-[1440px] lg:min-h-[680px] lg:grid-cols-2">
        <div
          className={
            "relative aspect-square min-h-[360px] overflow-hidden sm:min-h-[500px] lg:aspect-auto lg:min-h-full " +
            (section.imageFirst ? "lg:order-1" : "lg:order-2")
          }
        >
          <Image
            src={section.image}
            alt={section.imageAlt}
            fill
            className="object-cover transition-transform duration-700 hover:scale-[1.015]"
            sizes="(min-width: 1024px) 50vw, 100vw"
          />
        </div>

        <div
          className={
            "relative flex items-center overflow-hidden px-5 py-16 sm:px-10 md:py-20 lg:px-16 xl:px-24 " +
            (section.imageFirst ? "lg:order-2" : "lg:order-1")
          }
        >
          <span
            aria-hidden="true"
            className="absolute right-3 top-0 select-none text-[120px] font-black leading-none text-black/[0.035] sm:text-[170px] lg:right-8 lg:text-[210px]"
          >
            {section.number}
          </span>

          <div className="relative z-10 max-w-xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-black/55">{section.eyebrow}</p>
            <h2 className="mt-5 max-w-lg text-4xl font-black uppercase leading-[0.96] tracking-[-0.035em] text-black sm:text-5xl xl:text-[58px]">
              {section.heading}
            </h2>
            <p className="mt-6 text-lg font-semibold leading-7 text-black">{section.tagline}</p>
            <p className="mt-4 max-w-lg text-[15px] leading-7 text-black/65">{section.description}</p>

            <div className="mt-9 border-t border-black/15">
              {section.points.map(([title, body], index) => (
                <div key={title} className="grid grid-cols-[32px_1fr] gap-3 border-b border-black/15 py-4">
                  <span className="pt-0.5 text-[10px] font-bold tracking-widest text-black/45">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="text-sm leading-6 text-black/65">
                    <strong className="mr-1 font-bold text-black">{title}.</strong>
                    {body}
                  </p>
                </div>
              ))}
            </div>

            <p className="mt-7 border-l-2 border-black pl-4 text-sm font-bold leading-6 text-black">
              {section.closing}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function AboutPage() {
  return (
    <main className="overflow-hidden bg-white text-black">
      <section className="relative min-h-[440px] w-full overflow-hidden md:min-h-[560px]">
        <Image
          src="/about/hero.jpg"
          alt="A family wearing colorful KOFORA socks"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/5 md:bg-gradient-to-r md:from-black/70 md:via-black/20 md:to-transparent" />

        <div className="relative mx-auto flex min-h-[440px] max-w-[1440px] items-end px-5 pb-12 pt-24 sm:px-10 md:min-h-[560px] md:items-center md:px-16 md:pb-0 lg:px-20">
          <div className="max-w-2xl text-white">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/80">Our story</p>
            <h1 className="mt-5 text-5xl font-black uppercase leading-[0.9] tracking-[-0.04em] sm:text-6xl md:text-7xl lg:text-[84px]">
              Better feel,
              <span className="block">every step.</span>
            </h1>
            <p className="mt-6 max-w-lg text-base font-medium leading-7 text-white/90 md:text-lg">
              We make everyday essentials feel anything but ordinary—through thoughtful materials, considered
              construction, and comfort that moves with you.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-black/10 bg-white px-5 py-14 text-black sm:px-10 md:py-18">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-[0.8fr_2fr] md:items-start md:gap-16">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-black/50">Why KOFORA</p>
          <p className="max-w-4xl text-2xl font-semibold leading-tight tracking-[-0.025em] sm:text-3xl md:text-4xl">
            The things you wear every day should feel better, last longer, and bring a little more color to the way
            you move through the world.
          </p>
        </div>
      </section>

      {sections.map((section) => (
        <StorySection key={section.number} section={section} />
      ))}

      <section className="border-t border-black/10 bg-white px-5 py-20 text-center text-black sm:px-10 md:py-24">
        <div className="mx-auto max-w-3xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-black/50">Find your pair</p>
          <h2 className="mt-5 text-4xl font-black uppercase leading-none tracking-[-0.035em] sm:text-5xl md:text-6xl">
            Put comfort in motion.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-black/60 sm:text-base">
            Everyday staples, performance pairs, and bold color—made to feel right from the first step.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/collections/women"
              className="bg-black px-8 py-4 text-xs font-bold uppercase tracking-[0.14em] text-white transition-colors hover:bg-black/75"
            >
              Shop women
            </Link>
            <Link
              href="/collections/men"
              className="border border-black/30 px-8 py-4 text-xs font-bold uppercase tracking-[0.14em] text-black transition-colors hover:border-black hover:bg-black hover:text-white"
            >
              Shop men
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
