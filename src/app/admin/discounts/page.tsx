"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Search } from "lucide-react";
import { useAdminDiscounts } from "@/hooks/useAdminDiscounts";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { AdminDiscount, AdminDiscountListParams } from "@/interface/admin";

const PAGE_SIZE = 20;

function valueLabel(discount: AdminDiscount): string {
  if (discount.discount_type === "flat") return `Flat ${Number(discount.flat_amount ?? 0).toFixed(2)}`;
  return `${Number(discount.percentage ?? 0)}%`;
}

function windowLabel(discount: AdminDiscount): string {
  const fmt = (value: string | null) =>
    value ? new Date(value).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : null;
  const start = fmt(discount.starts_at);
  const end = fmt(discount.expires_at);
  if (!start && !end) return "Always";
  return `${start ?? "—"} → ${end ?? "—"}`;
}

function Badge({ label, tone }: { label: string; tone: "green" | "gray" | "blue" }) {
  const tones = {
    green: "bg-green-100 text-green-800",
    gray: "bg-gray-100 text-gray-600",
    blue: "bg-blue-100 text-blue-800",
  };
  return <span className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${tones[tone]}`}>{label}</span>;
}

export default function AdminDiscountsPage() {
  const [search, setSearch] = useState("");
  const [active, setActive] = useState("");
  const [type, setType] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search.trim(), 300);

  const params = useMemo<AdminDiscountListParams>(() => {
    const next: AdminDiscountListParams = { page, page_size: PAGE_SIZE };
    if (debouncedSearch) next.search = debouncedSearch;
    if (active) next.is_active = active;
    if (type) next.discount_type = type;
    return next;
  }, [page, debouncedSearch, active, type]);

  const { data, isLoading, isFetching, isError } = useAdminDiscounts(params);
  const discounts = data?.results ?? [];
  const total = data?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-bold text-black">Discounts</h1>
          <p className="mt-1 text-sm text-gray-500">{isFetching ? "Loading..." : `${total} discount${total === 1 ? "" : "s"}`}</p>
        </div>
        <Link
          href="/admin/discounts/new"
          className="inline-flex items-center gap-2 bg-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
        >
          <Plus size={16} />
          New discount
        </Link>
      </div>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search by name"
            className="w-full border border-gray-300 bg-white py-2.5 pl-9 pr-3 text-sm text-black outline-none focus:border-black"
          />
        </div>
        <select
          value={type}
          onChange={(event) => {
            setType(event.target.value);
            setPage(1);
          }}
          className="border border-gray-300 bg-white px-3 py-2.5 text-sm text-black outline-none focus:border-black"
        >
          <option value="">All types</option>
          <option value="flat">Flat</option>
          <option value="percent">Percent</option>
        </select>
        <select
          value={active}
          onChange={(event) => {
            setActive(event.target.value);
            setPage(1);
          }}
          className="border border-gray-300 bg-white px-3 py-2.5 text-sm text-black outline-none focus:border-black"
        >
          <option value="">All states</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      <div className="overflow-hidden border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Value</th>
                <th className="px-4 py-3">Flags</th>
                <th className="px-4 py-3">Min order</th>
                <th className="px-4 py-3">Window</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-500">Loading discounts...</td></tr>
              ) : isError ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-red-600">Failed to load discounts.</td></tr>
              ) : discounts.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-500">No discounts found.</td></tr>
              ) : (
                discounts.map((discount) => (
                  <tr key={discount.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link href={`/admin/discounts/${discount.id}`} className="font-semibold text-black hover:underline">
                        {discount.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-semibold text-black">{valueLabel(discount)}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {discount.is_active ? <Badge label="Active" tone="green" /> : <Badge label="Inactive" tone="gray" />}
                        {discount.is_auto_applied && <Badge label="Auto" tone="blue" />}
                        {discount.first_order_only && <Badge label="First order" tone="blue" />}
                        {discount.is_stackable && <Badge label="Stackable" tone="blue" />}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{Number(discount.minimum_order_amount).toFixed(2)}</td>
                    <td className="px-4 py-3 text-gray-600">{windowLabel(discount)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
        <div className="flex gap-2">
          <button
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page <= 1 || isFetching}
            className="inline-flex items-center gap-1 border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronLeft size={16} />
            Prev
          </button>
          <button
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            disabled={page >= totalPages || isFetching}
            className="inline-flex items-center gap-1 border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
