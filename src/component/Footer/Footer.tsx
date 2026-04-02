"use client";
import Link from "next/link";
import { FacebookLogo, InstagramLogo, XLogo } from "@phosphor-icons/react";

const moreInfoLinks = [
  "About Us",
  "Size Guide",
  "Returns & Exchanges",
  "Track a Package",
  "Giving Back",
  "Careers",
  "Affilitates",
  "How to Style",
  "Accessibility Statement",
  "Sustainability",
  "Find a Store",
];

const shoppingLinks = [
  "Women",
  "Men",
  "Kids",
  "Formal",
  "Crew",
  "No Show",
  "Quarter",
  "Over the Calf",
  "New Releases",
  "Best Sellers",
];

export default function Footer() {
  return (
    <>
      {/* CTA Section */}
      <section className="w-full bg-[#1e3a35] py-16 flex flex-col items-center justify-center text-white text-center px-4">
        <h2 className="text-2xl md:text-3xl font-extrabold uppercase leading-snug max-w-2xl mb-8">
          Enter your email for 20% off your first order,
          <br /> plus the latest Kofora news.
        </h2>

        <div className="flex w-full max-w-lg gap-1 bg-[#1e3a35] rounded-md overflow-hidden">
          <input
            type="email"
            placeholder="you@example.com"
            className="flex-1 px-5 py-4 text-black text-sm outline-none rounded-none bg-white"
          />
          <button className="bg-white text-black font-semibold px-8 py-4 text-sm hover:bg-gray-100 transition-colors whitespace-nowrap">
            Sign Up
          </button>
        </div>

        <p className="text-xs text-gray-300 mt-5 max-w-xl leading-relaxed">
          By providing my email, I am consenting to receive Kofora emails and
          Email-Based Advertising. For additional information, please see our{" "}
          <Link href="/privacy" className="underline hover:text-white">
            Privacy Policy
          </Link>
          .
        </p>

        <div className="flex items-center gap-6 mt-6 text-white">
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
        <div className="max-w-7xl mx-auto px-8 py-16 flex gap-0">
          {/* Left - Brand */}
          <div className="w-1/2 border-r border-gray-300 pr-8">
            <h2 className="flex items-center gap-2 mb-3">
              <span className="text-7xl font-black">100%</span>
              <span className="text-2xl font-extrabold uppercase leading-tight">
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
              href="#"
              className="border border-black text-sm px-5 py-2 inline-block hover:bg-black hover:text-white transition-colors rounded-xl"
            >
              Get Help
            </Link>
          </div>

          {/* Right side - More Info + Shopping */}
          <div className="w-1/2 flex pl-16 gap-64">
            <div>
              <h3 className="font-bold text-base mb-4">More Info</h3>
              <ul className="space-y-2">
                {moreInfoLinks.map((link) => (
                  <li key={link}>
                    <Link href="#" className="text-sm text-gray-700 hover:underline whitespace-nowrap">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-base mb-4">Shopping</h3>
              <ul className="space-y-2">
                {shoppingLinks.map((link) => (
                  <li key={link}>
                    <Link href="#" className="text-sm text-gray-700 hover:underline whitespace-nowrap">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Divider */}
        <hr className="border-gray-200 mx-8" />

        {/* Legal links */}
        <div className="max-w-7xl mx-auto px-8 py-5 flex items-center gap-8 justify-center">
          {["Terms & Conditions", "Privacy Policy", "Cookie Settings", "Refund Policy"].map((item) => (
            <Link key={item} href="#" className="text-sm text-gray-700 hover:underline whitespace-nowrap">
              {item}
            </Link>
          ))}
        </div>

        {/* Divider */}
        <hr className="border-gray-200 mx-8" />

     {/* Notice to consumers */}
<div className="max-w-7xl mx-auto px-8 py-6">
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
        <div className="w-full overflow-hidden pb-16">
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