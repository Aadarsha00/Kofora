"use client";

import { useState } from "react";
import { X } from "lucide-react";

export default function DiscountPill() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-3 bg-white rounded-full px-5 py-3 shadow-[0_4px_24px_rgba(0,0,0,0.18)] border border-gray-100">
        <span className="font-['Inter'] font-semibold text-sm text-black whitespace-nowrap">
          Get 20% Off
        </span>
        <button
          aria-label="Dismiss"
          onClick={() => setVisible(false)}
          className="w-5 h-5 flex items-center justify-center text-black hover:opacity-50 transition-opacity cursor-pointer"
        >
          <X size={14} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}