"use client";

const ANNOUNCEMENTS = [
  "BUY 3 PAIRS & SAVE MORE!",
  "FREE SHIPPING ON ORDERS OVER $50",
  "NEW SUMMER COLLECTION OUT NOW",
];

export default function AnnouncementBar() {
  return (
    <div className="w-full bg-[#253E38] h-12 flex items-center justify-center px-6 overflow-hidden relative">

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