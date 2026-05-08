"use client";

import { useState, useEffect } from "react";
import { Search, User, LogOut } from "lucide-react";
import { HandbagIcon } from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import LoginModal from "@/component/Auth/LoginModal";
import SignupModal from "@/component/Auth/SignupModal";
import { useTotalCartItemCount, useClearCartCache } from "@/hooks/useCart";
import { useCartSidebarStore } from "@/store/cartSidebarStore";
import CartSidebar from "../Cart/CartSidebar";
import { useAuth } from "@/context/AuthContext";
import { useLogout } from "@/hooks/useAuthMutations";

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
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const { isOpen: cartOpen, openCart, closeCart } = useCartSidebarStore();
  const { isAuthenticated, user, logout: contextLogout } = useAuth();
  const { mutate: logout } = useLogout();
  const itemCount = useTotalCartItemCount();
  const firstName = user?.first_name?.trim();
  const fullName = [firstName, user?.last_name].filter(Boolean).join(" ").trim();
  const userDisplayName = firstName || user?.username || user?.email?.split("@")[0] || "Account";
  const userMenuTitle = fullName || user?.username || user?.email || "User";

  // ✅ Clears React Query cart cache so stale data doesn't show on next login
  const clearCartCache = useClearCartCache();

  useEffect(() => {
    const frame = requestAnimationFrame(() => setHasMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        // ✅ Clear cart cache BEFORE updating auth state
        // This prevents the old cart briefly showing on re-login
        clearCartCache();
        contextLogout();
        setUserMenuOpen(false);
      },
      onError: (error) => {
        console.error("[Navbar] Logout error:", error);
        clearCartCache();
        contextLogout();
      },
    });
  };

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
            <div className="relative">
              <button
                aria-label={hasMounted && isAuthenticated ? userDisplayName : "User account"}
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="h-6 flex items-center justify-center gap-1.5 hover:opacity-60 transition-opacity cursor-pointer"
              >
                <User size={20} strokeWidth={1.5} color="#000000" />
                {hasMounted && isAuthenticated && (
                  <span className="max-w-28 truncate text-sm font-semibold leading-none text-black">
                    {userDisplayName}
                  </span>
                )}
              </button>

              {hasMounted && isAuthenticated && userMenuOpen && (
                <div className="absolute right-0 top-8 bg-white rounded shadow-lg py-2 z-50 min-w-48 border border-gray-200">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-semibold text-black">{userMenuTitle}</p>
                    {user?.email && user?.email !== userMenuTitle && (
                      <p className="text-xs text-gray-500">{user.email}</p>
                    )}
                  </div>
                  <Link
                    href="/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="block px-4 py-2 text-sm text-black hover:bg-gray-50 transition-colors"
                  >
                    Profile
                  </Link>
                  <Link
                    href="/orders"
                    onClick={() => setUserMenuOpen(false)}
                    className="block px-4 py-2 text-sm text-black hover:bg-gray-50 transition-colors"
                  >
                    My orders
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-black hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}

              {hasMounted && !isAuthenticated && userMenuOpen && (
                <div className="absolute right-0 top-8 bg-white rounded shadow-lg py-2 z-50 min-w-48 border border-gray-200">
                  <button
                    onClick={() => {
                      setLoginOpen(true);
                      setUserMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-black hover:bg-gray-50 transition-colors"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      setSignupOpen(true);
                      setUserMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-black hover:bg-gray-50 transition-colors"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>

            <button
              aria-label="Search"
              className="w-6 h-6 flex items-center justify-center hover:opacity-60 transition-opacity cursor-pointer"
            >
              <Search size={20} strokeWidth={1.5} color="#000000" />
            </button>
            <button
              aria-label="Cart"
              onClick={openCart}
              className="w-6 h-6 flex items-center justify-center hover:opacity-60 transition-opacity cursor-pointer relative"
            >
              <HandbagIcon size={32} />
              {hasMounted && itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-black text-white text-xs font-semibold w-5 h-5 rounded-full flex items-center justify-center">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <CartSidebar isOpen={cartOpen} onClose={closeCart} />

      <LoginModal
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSwitchToSignup={() => {
          setLoginOpen(false);
          setSignupOpen(true);
        }}
      />
      <SignupModal
        isOpen={signupOpen}
        onClose={() => setSignupOpen(false)}
        onSwitchToLogin={() => {
          setSignupOpen(false);
          setLoginOpen(true);
        }}
      />
    </>
  );
}
