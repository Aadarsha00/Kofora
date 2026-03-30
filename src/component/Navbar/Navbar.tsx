import { Search, ShoppingCart, User } from "lucide-react";
import Image from "next/image";

const NAV_ITEMS = ["WOMEN", "MEN", "KIDS", "SIZE CHART", "ABOUT", "CONTACT"];

export default function MainNavbar() {
  return (
    <div className="sticky top-0 z-50 w-full h-18 bg-white flex flex-col items-start justify-center px-12.25 py-6 gap-2.5 shadow-sm">
      <div className="flex flex-row justify-center items-center gap-60 w-full">

        {/* Logo */}
        <div className="w-34.75 h-6 shrink-0">
          <Image src="/logo.png" alt="Logo" className="w-full h-full object-contain" width={100} height={100} />
        </div>

        {/* Nav Items */}
        <ul className="flex flex-row items-center gap-12 list-none m-0 p-0">
          {NAV_ITEMS.map((item) => (
            <li key={item}>
              <a
                href="#"
                className="font-['Inter'] font-semibold text-base leading-4.75 text-black no-underline hover:opacity-60 transition-opacity whitespace-nowrap"
              >
                {item}
              </a>
            </li>
          ))}
        </ul>

        {/* Nav Icons */}
        <div className="flex flex-row items-center gap-5">
          <button aria-label="User account" className="w-6 h-6 flex items-center justify-center hover:opacity-60 transition-opacity cursor-pointer">
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
  );
}