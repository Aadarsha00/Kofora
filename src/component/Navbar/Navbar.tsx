"use client";

import { useState, useEffect } from "react";
import { Search, User, LogOut, Menu, X, LayoutDashboard, ChevronDown } from "lucide-react";
import { HandbagIcon } from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import LoginModal from "@/component/Auth/LoginModal";
import SignupModal from "@/component/Auth/SignupModal";
import { useTotalCartItemCount, useClearCartCache } from "@/hooks/useCart";
import { useCategories } from "@/hooks/useCategories";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useNewArrivalsByCategory, useSearchPageProducts } from "@/hooks/useProducts";
import { useCartSidebarStore } from "@/store/cartSidebarStore";
import CartSidebar from "../Cart/CartSidebar";
import { MegaMenuPanel, MobileMegaMenuSections, getMegaMenuSections } from "./MegaMenu";
import { useAuth } from "@/context/AuthContext";
import { useLogout } from "@/hooks/useAuthMutations";
import { getMatchedCategories, getMatchedCategoryIds, getProductGender } from "@/lib/searchHelpers";

type NavItem =
  | { label: string; href: string; gender: string; genderName: string }
  | { label: string; href: string; gender?: undefined; genderName?: undefined };

const NAV_ITEMS: NavItem[] = [
  { label: "WOMEN", href: "/collections/women", gender: "women", genderName: "Women" },
  { label: "MEN", href: "/collections/men", gender: "men", genderName: "Men" },
  { label: "KIDS", href: "/collections/kids", gender: "kids", genderName: "Kids" },
  { label: "SIZE CHART", href: "/size-chart" },
  { label: "ABOUT", href: "/about" },
  { label: "CONTACT", href: "/contact" },
];

export default function MainNavbar() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openMegaMenu, setOpenMegaMenu] = useState<string | null>(null);
  const [mobileExpandedGender, setMobileExpandedGender] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [hasMounted, setHasMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { isOpen: cartOpen, openCart, closeCart } = useCartSidebarStore();
  const { isAuthenticated, user, logout: contextLogout } = useAuth();
  const { mutate: logout } = useLogout();
  const itemCount = useTotalCartItemCount();
  const debouncedSearchQuery = useDebouncedValue(searchQuery.trim(), 250);
  const { data: categories } = useCategories();
  const activeMegaItem = openMegaMenu
    ? NAV_ITEMS.find((item) => item.gender === openMegaMenu)
    : undefined;
  const activeMegaCategory = categories?.find(
    (category) => category.slug === activeMegaItem?.gender
  );
  const {
    data: newestMenuProducts,
    isLoading: newestMenuProductLoading,
  } = useNewArrivalsByCategory(activeMegaCategory);
  const newestMenuProduct = [...(newestMenuProducts ?? [])].sort(
    (a, b) => Date.parse(b.created_at) - Date.parse(a.created_at)
  )[0];
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
  const isAdmin = isAuthenticated && (user?.role === "admin" || user?.role === "staff");

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

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setMobileExpandedGender(null);
  };

  return (
    <>
      <div
        className="sticky top-0 z-30 w-full bg-white"
        onMouseLeave={() => setOpenMegaMenu(null)}
      >
        <div className="hidden h-16 w-full items-center lg:flex">
          <div className="mx-auto flex h-16 w-full max-w-[1520px] flex-row items-center pl-12 pr-8">
          <div className="order-1 flex flex-1 items-center justify-start">
            <Link href="/" className="h-8 w-32 shrink-0" onMouseEnter={() => setOpenMegaMenu(null)}>
              <Image src="/logo.png" alt="Kofora" className="w-full h-full object-contain" width={472} height={80} />
            </Link>
          </div>

          <ul className="order-2 flex h-full flex-row items-center gap-4 list-none m-0 p-0">
            {NAV_ITEMS.map((item) => {
              const isActive =
                pathname === item.href ||
                Boolean(item.gender && pathname?.startsWith(`/collections/${item.gender}`));

              return (
                <li key={item.label} onMouseEnter={() => setOpenMegaMenu(item.gender ?? null)}>
                  <Link
                    href={item.href}
                    onClick={() => setOpenMegaMenu(null)}
                    onFocus={() => setOpenMegaMenu(item.gender ?? null)}
                    aria-current={isActive ? "page" : undefined}
                    aria-haspopup={item.gender ? "true" : undefined}
                    aria-expanded={item.gender ? openMegaMenu === item.gender : undefined}
                    className={`relative mx-2 inline-flex items-center py-2 text-sm font-extrabold leading-[1.15em] tracking-normal text-black no-underline whitespace-nowrap after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:origin-left after:bg-current after:transition-transform after:duration-[400ms] after:ease-[cubic-bezier(0,0.5,0.5,1)] hover:after:scale-x-100 focus-visible:outline-none focus-visible:after:scale-x-100 ${
                      isActive || openMegaMenu === item.gender
                        ? "after:scale-x-100"
                        : "after:scale-x-0"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="order-3 flex flex-1 flex-row items-center justify-end gap-1" onMouseEnter={() => setOpenMegaMenu(null)}>
            <div className="relative">
              <button
                aria-label={hasMounted && isAuthenticated ? userDisplayName : "User account"}
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex h-10 min-w-12 items-center justify-center gap-1.5 rounded-[20px] px-2 text-black transition-colors hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black cursor-pointer"
              >
                <User size={20} strokeWidth={1.5} color="#000000" />
                {hasMounted && isAuthenticated && (
                  <span className="max-w-28 truncate text-sm font-semibold leading-none text-black">
                    {userDisplayName}
                  </span>
                )}
              </button>

              {hasMounted && isAuthenticated && userMenuOpen && (
                <div className="absolute right-0 top-8 bg-white rounded shadow-lg py-2 z-40 min-w-48 border border-gray-200">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-semibold text-black">{userMenuTitle}</p>
                    {user?.email && user?.email !== userMenuTitle && (
                      <p className="text-xs text-gray-500">{user.email}</p>
                    )}
                  </div>
                  {isAdmin && (
                    <Link
                      href="/admin/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 border-b border-gray-100 px-4 py-2 text-sm font-semibold text-black hover:bg-gray-50 transition-colors"
                    >
                      <LayoutDashboard size={16} />
                      Admin dashboard
                    </Link>
                  )}
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
                <div className="absolute right-0 top-8 bg-white rounded shadow-lg py-2 z-40 min-w-48 border border-gray-200">
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
              className="flex h-10 w-12 items-center justify-center rounded-[20px] text-black transition-colors hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black cursor-pointer"
            >
              <Search size={20} strokeWidth={1.5} color="#000000" />
            </button>
            <button
              aria-label="Cart"
              onClick={openCart}
              className="relative flex h-10 w-12 items-center justify-center rounded-[20px] text-black transition-colors hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black cursor-pointer"
            >
              <HandbagIcon size={20} />
              {hasMounted && itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-black text-white text-xs font-semibold w-5 h-5 rounded-full flex items-center justify-center">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
        </div>

        {activeMegaItem?.gender && (
          <div className="hidden lg:block">
            <MegaMenuPanel
              sections={getMegaMenuSections(
                categories,
                activeMegaItem.gender,
                activeMegaItem.genderName
              )}
              gender={activeMegaItem.gender}
              genderName={activeMegaItem.genderName}
              featuredProduct={newestMenuProduct}
              featuredLoading={newestMenuProductLoading}
              onNavigate={() => setOpenMegaMenu(null)}
            />
          </div>
        )}

        <div className="flex h-16 items-center px-3 md:px-8 lg:hidden">
          <div className="flex flex-1 items-center justify-start">
            <button
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="flex h-10 w-12 items-center justify-center rounded-[20px] text-black"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          <div className="flex flex-1 items-center justify-center">
            <Link href="/" onClick={closeMobileMenu} className="h-7 w-28 shrink-0">
              <Image src="/logo.png" alt="Kofora" className="h-full w-full object-contain" width={472} height={80} />
            </Link>
          </div>

          <div className="flex flex-1 items-center justify-end gap-1">
            <button
              aria-label="Search"
              onClick={() => setSearchOpen((open) => !open)}
              className="flex h-10 w-12 items-center justify-center rounded-[20px] text-black"
            >
              <Search size={20} strokeWidth={1.5} />
            </button>
            <button
              aria-label="Cart"
              onClick={openCart}
              className="relative flex h-10 w-12 items-center justify-center rounded-[20px] text-black"
            >
              <HandbagIcon size={20} />
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
            {NAV_ITEMS.map((item) =>
              item.gender ? (
                <div key={item.label} className="border-b border-gray-100">
                  <button
                    type="button"
                    onClick={() =>
                      setMobileExpandedGender((prev) =>
                        prev === item.gender ? null : item.gender
                      )
                    }
                    aria-expanded={mobileExpandedGender === item.gender}
                    className="flex w-full items-center justify-between py-4 text-left text-[15px] font-bold uppercase tracking-[0.12em] text-black"
                  >
                    {item.label}
                    <ChevronDown
                      size={18}
                      className={`transition-transform duration-200 ${
                        mobileExpandedGender === item.gender ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {mobileExpandedGender === item.gender && (
                    <MobileMegaMenuSections
                      sections={getMegaMenuSections(categories, item.gender, item.genderName)}
                      onNavigate={closeMobileMenu}
                    />
                  )}
                </div>
              ) : (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={closeMobileMenu}
                  className="border-b border-gray-100 py-4 text-[15px] font-bold uppercase tracking-[0.12em] text-black"
                >
                  {item.label}
                </Link>
              )
            )}

            <div className="mt-6 grid grid-cols-2 gap-3">
              {hasMounted && isAuthenticated ? (
                <>
                  {isAdmin && (
                    <Link
                      href="/admin/dashboard"
                      onClick={closeMobileMenu}
                      className="col-span-2 flex items-center justify-center gap-2 inline-flex h-11 items-center justify-center bg-black px-6 text-sm font-semibold text-white"
                    >
                      <LayoutDashboard size={16} />
                      Admin dashboard
                    </Link>
                  )}
                  <Link
                    href="/profile"
                    onClick={closeMobileMenu}
                    className="inline-flex h-11 items-center justify-center border border-black px-6 text-sm font-semibold text-black"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      closeMobileMenu();
                    }}
                    className="inline-flex h-11 items-center justify-center bg-black px-6 text-sm font-semibold text-white"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setLoginOpen(true);
                      closeMobileMenu();
                    }}
                    className="inline-flex h-11 items-center justify-center border border-black px-6 text-sm font-semibold text-black"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      setSignupOpen(true);
                      closeMobileMenu();
                    }}
                    className="inline-flex h-11 items-center justify-center bg-black px-6 text-sm font-semibold text-white"
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
                placeholder="Search socks, caps & more"
                className="min-w-0 flex-1 border border-gray-300 px-4 py-3 text-sm text-black outline-none focus:border-black"
              />
              <button type="submit" className="inline-flex h-11 items-center justify-center bg-black px-6 text-sm font-semibold text-white">
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
