"use client";
import Link from "next/link";
import { FacebookLogo, InstagramLogo, XLogo } from "@phosphor-icons/react";

const moreInfoLinks = [
  { label: "About Us", href: "/about" },
  { label: "Size Guide", href: "/size-chart" },
  { label: "Returns & Exchanges", href: "#" },
  { label: "Track a Package", href: "#" },
  { label: "Giving Back", href: "#" },
  { label: "Careers", href: "#" },
  { label: "Affilitates", href: "#" },
  { label: "How to Style", href: "#" },
  { label: "Accessibility Statement", href: "#" },
  { label: "Sustainability", href: "#" },
  { label: "Find a Store", href: "#" },
];

const shoppingLinks = [
  { label: "Women", href: "/collections/women" },
  { label: "Men", href: "/collections/men" },
  { label: "Kids", href: "/collections/kids" },
  { label: "Formal", href: "/collections/formal" },
  { label: "Crew", href: "/collections/crew" },
  { label: "No Show", href: "/collections/no-show" },
  { label: "Quarter", href: "/collections/quarter" },
  { label: "Over the Calf", href: "/collections/over-the-calf" },
  { label: "New Releases", href: "/collections/new-releases" },
  { label: "Best Sellers", href: "/collections/best-sellers" },
];

export default function Footer() {
  return (
    <>
      {/* CTA Section */}
      <section className="w-full bg-[#1e3a35] px-5 py-12 text-center text-white md:py-16">
        <h2 className="mx-auto mb-7 max-w-2xl text-2xl font-extrabold uppercase leading-tight md:text-3xl md:leading-snug">
          Enter your email for 20% off your first order,
          <span className="block">plus the latest Kofora news.</span>
        </h2>

        <div className="mx-auto flex w-full max-w-lg flex-col gap-2 overflow-hidden rounded-md bg-[#1e3a35] sm:flex-row sm:gap-1">
          <input
            type="email"
            placeholder="you@example.com"
            className="min-w-0 flex-1 bg-white px-5 py-4 text-sm text-black outline-none"
          />
          <button className="bg-white px-8 py-4 text-sm font-semibold text-black transition-colors hover:bg-gray-100">
            Sign Up
          </button>
        </div>

        <p className="mx-auto mt-5 max-w-xl text-xs leading-relaxed text-gray-300">
          By providing my email, I am consenting to receive Kofora emails and
          Email-Based Advertising. For additional information, please see our{" "}
          <Link href="/privacy" className="underline hover:text-white">
            Privacy Policy
          </Link>
          .
        </p>

        <div className="mt-6 flex items-center justify-center gap-6 text-white">
          <Link href="#" aria-label="Facebook" className="hover:text-gray-300 transition-colors">
            <FacebookLogo size={24} weight="fill" />
          </Link>
          <Link href="#" aria-label="Instagram" className="hover:text-gray-300 transition-colors">
            <InstagramLogo size={24} weight="fill" />
          </Link>
          <Link href="#" aria-label="X" className="hover:text-gray-300 transition-colors">
            <XLogo size={24} weight="fill" />
          </Link>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="w-full bg-white text-black">
        {/* Main footer content */}
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 md:px-8 md:py-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-14">
          {/* Left - Brand */}
          <div className="border-b border-gray-200 pb-10 lg:border-b-0 lg:border-r lg:border-gray-300 lg:pb-0 lg:pr-8">
            <h2 className="mb-3 flex items-center gap-2">
              <span className="text-6xl font-black md:text-7xl">100%</span>
              <span className="text-xl font-extrabold uppercase leading-tight md:text-2xl">
                COMFORT
                <br />
                GUARANTEED.
              </span>
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              The Kofora Team is your go-to when you need a recommendation, a
              return, or just a reason to smile. Seriously, reach out. Even just
              to say hi.
            </p>
            <Link
              href="/contact"
              className="border border-black text-sm px-5 py-2 inline-block hover:bg-black hover:text-white transition-colors rounded-xl"
            >
              Get Help
            </Link>
          </div>

          {/* Right side - More Info + Shopping */}
          <div className="grid gap-8 sm:grid-cols-2 lg:pl-10">
            <div>
              <h3 className="font-bold text-base mb-4">More Info</h3>
              <ul className="space-y-2">
                {moreInfoLinks.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-gray-700 hover:underline">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-base mb-4">Shopping</h3>
              <ul className="space-y-2">
                {shoppingLinks.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-gray-700 hover:underline">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Divider */}
        <hr className="mx-5 border-gray-200 md:mx-8" />

        {/* Legal links */}
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-6 gap-y-3 px-5 py-5 md:px-8">
          {["Terms & Conditions", "Privacy Policy", "Cookie Settings", "Refund Policy"].map((item) => (
            <Link key={item} href="#" className="text-sm text-gray-700 hover:underline whitespace-nowrap">
              {item}
            </Link>
          ))}
        </div>

        {/* Divider */}
        <hr className="mx-5 border-gray-200 md:mx-8" />

     {/* Notice to consumers */}
<div className="mx-auto max-w-7xl px-5 py-6 md:px-8">
  <p className="text-xs text-gray-600 leading-relaxed">
    <span className="font-bold">Notice to Consumers</span>: Kofora may
    collect &ldquo;Identifiers&rdquo;, &ldquo;Characteristics of protected classifications&rdquo;
    under California, federal or other applicable law, &ldquo;Commercial
    information&rdquo;, &ldquo;Internet or other electronic network activity&rdquo;, and/or
    &ldquo;Geolocation data&rdquo; when you visit this website, and may use such
    information to draw inferences and for other operational and commercial
    purposes. For more information, please see our{" "}
    <Link href="#" className="underline">
      Privacy Policy
    </Link>
    .
  </p>
</div>

        {/* Big KOFORA text */}
        <div className="w-full overflow-hidden pb-10 md:pb-16">
          <p
            className="text-center font-black uppercase select-none"
            style={{
              fontSize: "clamp(80px, 18vw, 220px)",
              lineHeight: 1,
              background: "linear-gradient(to bottom, #6b6b6b, #ffffff)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            KOFORA
          </p>
        </div>
      </footer>
    </>
  );
}
