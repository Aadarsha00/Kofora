"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useAdminOrders } from "@/hooks/useAdminOrders";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import {
  AdminOrderListParams,
  FULFILLMENT_STATUS_LABELS,
  FULFILLMENT_STATUSES,
} from "@/interface/admin";

const PAGE_SIZE = 20;

function money(currency: string, value: string | number): string {
  const amount = Number(value ?? 0);
  return `${currency || "USD"} ${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function StatusBadge({ status }: { status: string }) {
  const good = ["paid", "processing", "shipped", "delivered"].includes(status);
  const bad = ["cancelled", "refunded", "returned", "partially_refunded"].includes(status);
  const tone = good
    ? "bg-green-100 text-green-800"
    : bad
      ? "bg-red-100 text-red-700"
      : "bg-gray-100 text-gray-700";
  return (
    <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}>
      {FULFILLMENT_STATUS_LABELS[status] ?? status}
    </span>
  );
}

export default function AdminOrdersPage() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") ?? "";
  const [search, setSearch] = useState(initialSearch);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search.trim(), 300);

  const params = useMemo<AdminOrderListParams>(() => {
    const next: AdminOrderListParams = { page, page_size: PAGE_SIZE };
    if (debouncedSearch) next.search = debouncedSearch;
    if (status) next.fulfillment_status = status;
    return next;
  }, [page, debouncedSearch, status]);

  const { data, isLoading, isFetching, isError } = useAdminOrders(params);

  const orders = data?.results ?? [];
  const total = data?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-bold text-black">Orders</h1>
          <p className="mt-1 text-sm text-gray-500">
            {isFetching ? "Loading..." : `${total} order${total === 1 ? "" : "s"}`}
          </p>
        </div>
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
            placeholder="Search by order number or customer"
            className="w-full border border-gray-300 bg-white py-2.5 pl-9 pr-3 text-sm text-black outline-none focus:border-black"
          />
        </div>
        <select
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            setPage(1);
          }}
          className="border border-gray-300 bg-white px-3 py-2.5 text-sm text-black outline-none focus:border-black"
        >
          <option value="">All statuses</option>
          {FULFILLMENT_STATUSES.map((value) => (
            <option key={value} value={value}>
              {FULFILLMENT_STATUS_LABELS[value]}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Fulfillment</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                    Loading orders...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-red-600">
                    Failed to load orders.
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                    No orders found.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link href={`/admin/orders/${order.id}`} className="font-semibold text-black hover:underline">
                        {order.order_number}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      <div className="font-medium text-black">
                        {order.customer.first_name || order.customer.last_name
                          ? `${order.customer.first_name} ${order.customer.last_name}`.trim()
                          : order.customer.email}
                      </div>
                      <div className="text-xs text-gray-500">{order.customer.email}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(order.created_at)}</td>
                    <td className="px-4 py-3 text-gray-600">{order.item_count}</td>
                    <td className="px-4 py-3 font-semibold text-black">{money(order.currency, order.grand_total)}</td>
                    <td className="px-4 py-3 capitalize text-gray-700">{order.payment_status}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={order.fulfillment_status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Page {page} of {totalPages}
        </p>
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
