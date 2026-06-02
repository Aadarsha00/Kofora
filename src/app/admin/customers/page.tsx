"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Search, UserCheck, UserX } from "lucide-react";
import { useAdminCustomers, useUpdateAdminCustomerStatus } from "@/hooks/useAdminCustomers";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { AdminCustomer, AdminCustomerListParams } from "@/interface/admin";
import { getApiErrorMessage } from "@/lib/apiError";

const PAGE_SIZE = 20;

function customerName(customer: AdminCustomer): string {
  return `${customer.first_name} ${customer.last_name}`.trim() || customer.username || customer.email;
}

function formatDate(value: string | null): string {
  if (!value) return "-";
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function money(value: string | number): string {
  const amount = Number(value ?? 0);
  return `USD ${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function Badge({ label, tone }: { label: string; tone: "green" | "gray" | "amber" | "red" }) {
  const tones = {
    green: "bg-green-100 text-green-800",
    gray: "bg-gray-100 text-gray-600",
    amber: "bg-amber-100 text-amber-800",
    red: "bg-red-100 text-red-700",
  };
  return <span className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${tones[tone]}`}>{label}</span>;
}

export default function AdminCustomersPage() {
  const [search, setSearch] = useState("");
  const [active, setActive] = useState("");
  const [verified, setVerified] = useState("");
  const [marketing, setMarketing] = useState("");
  const [page, setPage] = useState(1);
  const [statusError, setStatusError] = useState("");
  const [pendingCustomerId, setPendingCustomerId] = useState<number | null>(null);
  const debouncedSearch = useDebouncedValue(search.trim(), 300);

  const params = useMemo<AdminCustomerListParams>(() => {
    const next: AdminCustomerListParams = { page, page_size: PAGE_SIZE, ordering: "-created_at" };
    if (debouncedSearch) next.search = debouncedSearch;
    if (active) next.is_active = active;
    if (verified) next.is_email_verified = verified;
    if (marketing) next.marketing_opt_in = marketing;
    return next;
  }, [active, debouncedSearch, marketing, page, verified]);

  const { data, isLoading, isFetching, isError } = useAdminCustomers(params);
  const updateCustomerStatus = useUpdateAdminCustomerStatus();

  const customers = data?.results ?? [];
  const total = data?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const visibleBuyers = customers.filter((customer) => customer.order_count > 0).length;
  const visibleMarketing = customers.filter((customer) => customer.marketing_opt_in).length;

  const handleStatusChange = (customer: AdminCustomer) => {
    const nextActive = !customer.is_active;
    if (!nextActive && !window.confirm(`Deactivate ${customerName(customer)}? They will not be able to log in.`)) {
      return;
    }

    setStatusError("");
    setPendingCustomerId(customer.id);
    updateCustomerStatus.mutate(
      { id: customer.id, payload: { is_active: nextActive } },
      {
        onError: (error) => setStatusError(getApiErrorMessage(error, "Failed to update customer account.")),
        onSettled: () => setPendingCustomerId(null),
      }
    );
  };

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-bold text-black">Customers</h1>
          <p className="mt-1 text-sm text-gray-500">
            {isFetching ? "Loading..." : `${total} customer${total === 1 ? "" : "s"}`}
          </p>
        </div>
      </div>

      <div className="mb-5 grid gap-3 md:grid-cols-3">
        <div className="border border-gray-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase text-gray-500">Current page</p>
          <p className="mt-2 text-2xl font-bold text-black">{customers.length}</p>
        </div>
        <div className="border border-gray-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase text-gray-500">Customers with orders</p>
          <p className="mt-2 text-2xl font-bold text-black">{visibleBuyers}</p>
        </div>
        <div className="border border-gray-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase text-gray-500">Marketing opt-in</p>
          <p className="mt-2 text-2xl font-bold text-black">{visibleMarketing}</p>
        </div>
      </div>

      <div className="mb-5 flex flex-col gap-3 xl:flex-row">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search name, email, username, or phone"
            className="w-full border border-gray-300 bg-white py-2.5 pl-9 pr-3 text-sm text-black outline-none focus:border-black"
          />
        </div>
        <select
          value={active}
          onChange={(event) => {
            setActive(event.target.value);
            setPage(1);
          }}
          className="border border-gray-300 bg-white px-3 py-2.5 text-sm text-black outline-none focus:border-black"
        >
          <option value="">All accounts</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        <select
          value={verified}
          onChange={(event) => {
            setVerified(event.target.value);
            setPage(1);
          }}
          className="border border-gray-300 bg-white px-3 py-2.5 text-sm text-black outline-none focus:border-black"
        >
          <option value="">All verification</option>
          <option value="true">Email verified</option>
          <option value="false">Unverified</option>
        </select>
        <select
          value={marketing}
          onChange={(event) => {
            setMarketing(event.target.value);
            setPage(1);
          }}
          className="border border-gray-300 bg-white px-3 py-2.5 text-sm text-black outline-none focus:border-black"
        >
          <option value="">All marketing</option>
          <option value="true">Opted in</option>
          <option value="false">Not opted in</option>
        </select>
      </div>
      {statusError && <p className="mb-4 text-sm font-semibold text-red-600">{statusError}</p>}

      <div className="overflow-hidden border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1040px] text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Orders</th>
                <th className="px-4 py-3">Paid spend</th>
                <th className="px-4 py-3">Last order</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                    Loading customers...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-red-600">
                    Failed to load customers.
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                    No customers found.
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-black">{customerName(customer)}</div>
                      <div className="text-xs text-gray-500">{customer.email}</div>
                      {customer.phone && <div className="text-xs text-gray-400">{customer.phone}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {customer.is_active ? <Badge label="Active" tone="green" /> : <Badge label="Inactive" tone="red" />}
                        {customer.is_email_verified ? <Badge label="Verified" tone="green" /> : <Badge label="Unverified" tone="gray" />}
                        {customer.marketing_opt_in && <Badge label="Marketing" tone="amber" />}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-black">{customer.order_count}</td>
                    <td className="px-4 py-3 font-semibold text-black">{money(customer.total_spend)}</td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(customer.last_order_at)}</td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(customer.created_at)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/orders?search=${encodeURIComponent(customer.email)}`}
                          className="inline-flex items-center gap-1 border border-gray-300 px-2.5 py-1.5 text-xs font-semibold text-black hover:bg-gray-50"
                        >
                          Orders
                        </Link>
                        <button
                          type="button"
                          disabled={pendingCustomerId === customer.id}
                          onClick={() => handleStatusChange(customer)}
                          className={`inline-flex items-center gap-1 border px-2.5 py-1.5 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${
                            customer.is_active
                              ? "border-red-200 text-red-700 hover:bg-red-50"
                              : "border-green-200 text-green-700 hover:bg-green-50"
                          }`}
                        >
                          {customer.is_active ? <UserX size={13} /> : <UserCheck size={13} />}
                          {pendingCustomerId === customer.id
                            ? "Saving..."
                            : customer.is_active
                              ? "Deactivate"
                              : "Reactivate"}
                        </button>
                      </div>
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
