"use client";

import { useState, useEffect } from "react";
import { Search, User, LogOut, Menu, X } from "lucide-react";
import { HandbagIcon } from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LoginModal from "@/component/Auth/LoginModal";
import SignupModal from "@/component/Auth/SignupModal";
import { useTotalCartItemCount, useClearCartCache } from "@/hooks/useCart";
import { useCategories } from "@/hooks/useCategories";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useSearchPageProducts } from "@/hooks/useProducts";
import { useCartSidebarStore } from "@/store/cartSidebarStore";
import CartSidebar from "../Cart/CartSidebar";
import { useAuth } from "@/context/AuthContext";
import { useLogout } from "@/hooks/useAuthMutations";
import { getMatchedCategories, getMatchedCategoryIds, getProductGender } from "@/lib/searchHelpers";

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [hasMounted, setHasMounted] = useState(false);
  const router = useRouter();
  const { isOpen: cartOpen, openCart, closeCart } = useCartSidebarStore();
  const { isAuthenticated, user, logout: contextLogout } = useAuth();
  const { mutate: logout } = useLogout();
  const itemCount = useTotalCartItemCount();
  const debouncedSearchQuery = useDebouncedValue(searchQuery.trim(), 250);
  const { data: categories } = useCategories();
  const matchedCategoryIds = getMatchedCategoryIds(categories, debouncedSearchQuery);
  const matchedCategories = getMatchedCategories(categories, debouncedSearchQuery).slice(0, 3);
  const { data: searchProducts, isFetching: suggestionsLoading } = useSearchPageProducts(
    debouncedSearchQuery,
    matchedCategoryIds
  );
  const productSuggestions = (searchProducts ?? []).slice(0, 5);
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

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    setSearchOpen(false);
    setMobileMenuOpen(false);
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQuery("");
  };

  return (
    <>
      <div className="sticky top-0 z-50 w-full bg-white shadow-sm">
        <div className="hidden h-18 w-full items-center justify-center px-12.25 py-6 lg:flex">
          <div className="flex w-full max-w-[1440px] flex-row items-center justify-between gap-10">
          <Link href="/" className="w-34.75 h-6 shrink-0">
            <Image src="/logo.png" alt="Logo" className="w-full h-full object-contain" width={100} height={100} />
          </Link>

          <ul className="flex flex-row items-center gap-8 xl:gap-12 list-none m-0 p-0">
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
              onClick={() => setSearchOpen((open) => !open)}
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
        <div className="flex h-16 items-center justify-between px-4 lg:hidden">
          <button
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="flex h-10 w-10 items-center justify-center text-black"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <Link href="/" onClick={() => setMobileMenuOpen(false)} className="h-6 w-32 shrink-0">
            <Image src="/logo.png" alt="Logo" className="h-full w-full object-contain" width={140} height={32} />
          </Link>

          <div className="flex items-center gap-3">
            <button
              aria-label="Search"
              onClick={() => setSearchOpen((open) => !open)}
              className="flex h-10 w-10 items-center justify-center text-black"
            >
              <Search size={21} strokeWidth={1.7} />
            </button>
            <button
              aria-label="Cart"
              onClick={openCart}
              className="relative flex h-10 w-10 items-center justify-center text-black"
            >
              <HandbagIcon size={30} />
              {hasMounted && itemCount > 0 && (
                <span className="absolute right-0 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1 text-[10px] font-semibold text-white">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <div
          className={`lg:hidden overflow-hidden border-t border-gray-100 bg-white transition-[max-height,opacity] duration-300 ${
            mobileMenuOpen ? "max-h-[calc(100vh-4rem)] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <nav className="flex max-h-[calc(100vh-4rem)] flex-col overflow-y-auto px-5 py-4">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="border-b border-gray-100 py-4 text-[15px] font-bold uppercase tracking-[0.12em] text-black"
              >
                {item.label}
              </Link>
            ))}

            <div className="mt-6 grid grid-cols-2 gap-3">
              {hasMounted && isAuthenticated ? (
                <>
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="border border-black px-4 py-3 text-center text-sm font-semibold text-black"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="bg-black px-4 py-3 text-sm font-semibold text-white"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setLoginOpen(true);
                      setMobileMenuOpen(false);
                    }}
                    className="border border-black px-4 py-3 text-sm font-semibold text-black"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      setSignupOpen(true);
                      setMobileMenuOpen(false);
                    }}
                    className="bg-black px-4 py-3 text-sm font-semibold text-white"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </nav>
        </div>

        <form
          onSubmit={handleSearchSubmit}
          className={`border-t border-gray-100 bg-white px-4 transition-[max-height,opacity,padding] duration-300 ${
            searchOpen ? "max-h-[75vh] py-3 opacity-100" : "max-h-0 overflow-hidden py-0 opacity-0"
          }`}
        >
          <div className="mx-auto max-w-3xl">
            <div className="flex items-center gap-2">
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                autoFocus={searchOpen}
                type="search"
                placeholder="Search socks"
                className="min-w-0 flex-1 border border-gray-300 px-4 py-3 text-sm text-black outline-none focus:border-black"
              />
              <button type="submit" className="bg-black px-5 py-3 text-sm font-semibold text-white">
                Search
              </button>
            </div>

            {debouncedSearchQuery && (
              <div className="mt-3 max-h-[52vh] overflow-y-auto border border-gray-200 bg-white shadow-sm">
                {suggestionsLoading && (
                  <p className="px-4 py-3 text-sm text-gray-500">Searching...</p>
                )}

                {!suggestionsLoading && matchedCategories.length > 0 && (
                  <div className="border-b border-gray-100 py-2">
                    <p className="px-4 pb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-gray-400">
                      Categories
                    </p>
                    {matchedCategories.map((category) => (
                      <Link
                        key={category.id}
                        href={`/collections/${category.slug}`}
                        onClick={closeSearch}
                        className="block px-4 py-2 text-sm font-semibold text-black hover:bg-gray-50"
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                )}

                {!suggestionsLoading && productSuggestions.length > 0 && (
                  <div className="py-2">
                    <p className="px-4 pb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-gray-400">
                      Products
                    </p>
                    {productSuggestions.map((product) => (
                      <Link
                        key={product.id}
                        href={`/collections/${getProductGender(product, categories)}/${product.slug}?id=${product.id}`}
                        onClick={closeSearch}
                        className="block px-4 py-2 text-sm text-black hover:bg-gray-50"
                      >
                        <span className="font-semibold">{product.name}</span>
                        {product.short_description && (
                          <span className="mt-0.5 block truncate text-xs text-gray-500">
                            {product.short_description}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                )}

                {!suggestionsLoading && matchedCategories.length === 0 && productSuggestions.length === 0 && (
                  <p className="px-4 py-3 text-sm text-gray-500">No suggestions found.</p>
                )}

                <Link
                  href={`/search?q=${encodeURIComponent(debouncedSearchQuery)}`}
                  onClick={closeSearch}
                  className="block border-t border-gray-100 px-4 py-3 text-sm font-bold text-black hover:bg-gray-50"
                >
                  View all results
                </Link>
              </div>
            )}
          </div>
        </form>
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
