"use client";

import { Globe } from "lucide-react";
import { useState } from "react";

const ANNOUNCEMENTS = [
  "BUY 3 PAIRS & SAVE MORE!",
  "FREE SHIPPING ON ORDERS OVER $50",
  "NEW SUMMER COLLECTION OUT NOW",
];

const COUNTRIES = ["Nepal", "United States", "United Kingdom", "India", "Australia"];

export default function AnnouncementBar() {
  const [country, setCountry] = useState("Nepal");
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full bg-[#253E38] h-12 flex items-center justify-between px-6 overflow-hidden relative">

      {/* Scrolling Marquee */}
      <div className="flex-1 overflow-hidden relative">
        <div className="flex animate-marquee whitespace-nowrap gap-24">
          {[...ANNOUNCEMENTS, ...ANNOUNCEMENTS].map((text, i) => (
            <span
              key={i}
              className="text-white font-bold text-sm tracking-widest whitespace-nowrap px-8"
            >
              {text}
            </span>
          ))}
        </div>
      </div>

      {/* Country Selector */}
      <div className="relative shrink-0 ml-6">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-1.5 text-white text-sm font-medium hover:opacity-75 transition-opacity cursor-pointer"
        >
          <Globe size={15} strokeWidth={1.8} />
          <span className="font-['Inter']">{country}</span>
        </button>

        {open && (
          <div className="absolute right-0 top-8 bg-white rounded shadow-lg py-1 z-50 min-w-35">
            {COUNTRIES.map((c) => (
              <button
                key={c}
                onClick={() => { setCountry(c); setOpen(false); }}
                className={`w-full text-left px-4 py-2 text-sm font-['Inter'] hover:bg-gray-100 transition-colors cursor-pointer ${
                  c === country ? "font-semibold text-[#253E38]" : "text-gray-700"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 18s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}