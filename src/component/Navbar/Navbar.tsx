"use client";

import { useState } from "react";
import { Search, ShoppingCart, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import LoginModal from "@/component/Auth/LoginModal";
import SignupModal from "@/component/Auth/SignupModal";

const NAV_ITEMS = [
  { label: "WOMEN", href: "/collections/women" },
  { label: "MEN", href: "/collections/men" },
  { label: "KIDS", href: "/collections/kids" },
  { label: "SIZE CHART", href: "/size-chart" },
  { label: "ABOUT", href: "/about" },
  { label: "CONTACT", href: "/contact" },
];

export default function MainNavbar() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);

  return (
    <>
      <div className="sticky top-0 z-50 w-full h-18 bg-white flex flex-col items-start justify-center px-12.25 py-6 gap-2.5 shadow-none">
        <div className="flex flex-row justify-center items-center gap-60 w-full">

          <Link href="/" className="w-34.75 h-6 shrink-0">
            <Image src="/logo.png" alt="Logo" className="w-full h-full object-contain" width={100} height={100} />
          </Link>

          <ul className="flex flex-row items-center gap-12 list-none m-0 p-0">
            {NAV_ITEMS.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="font-['Inter'] font-semibold text-base leading-4.75 text-black no-underline hover:opacity-60 transition-opacity whitespace-nowrap"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex flex-row items-center gap-5">
            <button
              aria-label="User account"
              onClick={() => setLoginOpen(true)}
              className="w-6 h-6 flex items-center justify-center hover:opacity-60 transition-opacity cursor-pointer"
            >
              <User size={20} strokeWidth={1.5} color="#000000" />
            </button>
            <button aria-label="Search" className="w-6 h-6 flex items-center justify-center hover:opacity-60 transition-opacity cursor-pointer">
              <Search size={20} strokeWidth={1.5} color="#000000" />
            </button>
            <button aria-label="Cart" className="w-6 h-6 flex items-center justify-center hover:opacity-60 transition-opacity cursor-pointer">
              <ShoppingCart size={20} strokeWidth={1.5} color="#000000" />
            </button>
          </div>

        </div>
      </div>

      <LoginModal
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSwitchToSignup={() => { setLoginOpen(false); setSignupOpen(true); }}
      />
      <SignupModal
        isOpen={signupOpen}
        onClose={() => setSignupOpen(false)}
        onSwitchToLogin={() => { setSignupOpen(false); setLoginOpen(true); }}
      />
    </>
  );
}