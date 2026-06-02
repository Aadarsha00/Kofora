"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Boxes, LayoutDashboard, Package, ShoppingBag, Tag, Users } from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  icon: typeof ShoppingBag;
  ready: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard, ready: true },
  { label: "Orders", href: "/admin/orders", icon: ShoppingBag, ready: true },
  { label: "Products", href: "/admin/products", icon: Package, ready: true },
  { label: "Customers", href: "/admin/customers", icon: Users, ready: true },
  { label: "Discounts", href: "/admin/discounts", icon: Tag, ready: true },
  { label: "Inventory", href: "/admin/inventory", icon: Boxes, ready: true },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-gray-200 bg-white md:flex">
      <div className="border-b border-gray-200 px-6 py-5">
        <Link href="/admin/dashboard" className="text-lg font-black uppercase tracking-widest text-black">
          Kofora
        </Link>
        <p className="mt-0.5 text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">Admin</p>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname?.startsWith(item.href) ?? false;

          if (!item.ready) {
            return (
              <span
                key={item.href}
                className="flex cursor-not-allowed items-center justify-between gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-gray-300"
                title="Coming soon"
              >
                <span className="flex items-center gap-3">
                  <Icon size={18} />
                  {item.label}
                </span>
                <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-gray-400">
                  Soon
                </span>
              </span>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold transition-colors ${
                isActive ? "bg-black text-white" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
