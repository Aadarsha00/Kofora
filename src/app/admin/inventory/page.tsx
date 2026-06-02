"use client";

import { FormEvent, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, History, PackageSearch, Search, SlidersHorizontal } from "lucide-react";
import {
  useAdminInventoryAdjustments,
  useAdminInventoryVariants,
  useCreateAdminInventoryAdjustment,
} from "@/hooks/useAdminInventory";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { AdminInventoryListParams, AdminInventoryVariant } from "@/interface/admin";
import { getApiErrorMessage } from "@/lib/apiError";

const PAGE_SIZE = 20;
const STOCK_STATUS_VALUES = new Set(["available", "low", "out"]);

function formatDate(value: string): string {
  return new Date(value).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function stockTone(variant: AdminInventoryVariant): { label: string; className: string } {
  if (variant.available_quantity <= 0) {
    return { label: "Out", className: "bg-red-100 text-red-700" };
  }
  if (variant.available_quantity <= variant.low_stock_threshold) {
    return { label: "Low", className: "bg-amber-100 text-amber-800" };
  }
  return { label: "Available", className: "bg-green-100 text-green-800" };
}

function signed(value: number): string {
  return value > 0 ? `+${value}` : String(value);
}

export default function AdminInventoryPage() {
  const searchParams = useSearchParams();
  const requestedStockStatus = searchParams.get("stock_status") ?? "";
  const initialStockStatus = STOCK_STATUS_VALUES.has(requestedStockStatus) ? requestedStockStatus : "";
  const [search, setSearch] = useState("");
  const [stockStatus, setStockStatus] = useState(initialStockStatus);
  const [active, setActive] = useState("");
  const [page, setPage] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<AdminInventoryVariant | null>(null);
  const [targetStock, setTargetStock] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim(), 300);

  const params = useMemo<AdminInventoryListParams>(() => {
    const next: AdminInventoryListParams = {
      page,
      page_size: PAGE_SIZE,
      ordering: "stock_quantity",
    };
    if (debouncedSearch) next.search = debouncedSearch;
    if (stockStatus) next.stock_status = stockStatus;
    if (active) next.is_active = active;
    return next;
  }, [active, debouncedSearch, page, stockStatus]);

  const { data, isLoading, isFetching, isError } = useAdminInventoryVariants(params);
  const adjustmentsQuery = useAdminInventoryAdjustments({ page_size: 8, ordering: "-created_at" });
  const createAdjustment = useCreateAdminInventoryAdjustment();

  const variants = data?.results ?? [];
  const total = data?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const visibleLow = variants.filter(
    (variant) => variant.available_quantity > 0 && variant.available_quantity <= variant.low_stock_threshold
  ).length;
  const visibleOut = variants.filter((variant) => variant.available_quantity <= 0).length;
  const visibleReserved = variants.reduce((sum, variant) => sum + variant.reserved_quantity, 0);
  const targetStockNumber = targetStock.trim() === "" ? null : Number(targetStock);
  const stockChange =
    selectedVariant && targetStockNumber !== null && Number.isInteger(targetStockNumber)
      ? targetStockNumber - selectedVariant.stock_quantity
      : null;

  const resetAdjustment = () => {
    setSelectedVariant(null);
    setTargetStock("");
    setNotes("");
    setError("");
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (!selectedVariant) {
      setError("Choose a variant first.");
      return;
    }
    const nextStock = Number(targetStock);
    if (!Number.isInteger(nextStock) || nextStock < 0) {
      setError("Enter a whole-number stock count.");
      return;
    }
    if (nextStock < selectedVariant.reserved_quantity) {
      setError("Stock count cannot be lower than already reserved orders.");
      return;
    }
    const delta = nextStock - selectedVariant.stock_quantity;
    if (delta === 0) {
      setError("Stock already matches this count.");
      return;
    }

    createAdjustment.mutate(
      {
        variant: selectedVariant.id,
        quantity_delta: delta,
        notes: notes.trim() || `Stock count set to ${nextStock}`,
      },
      {
        onSuccess: resetAdjustment,
        onError: (err) => setError(getApiErrorMessage(err, "Failed to save stock count.")),
      }
    );
  };

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-bold text-black">Inventory</h1>
          <p className="mt-1 text-sm text-gray-500">
            {isFetching ? "Loading..." : `${total} variant${total === 1 ? "" : "s"}`}
          </p>
        </div>
      </div>

      <div className="mb-5 grid gap-3 md:grid-cols-3">
        <div className="border border-gray-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase text-gray-500">Variants shown</p>
          <p className="mt-2 text-2xl font-bold text-black">{variants.length}</p>
        </div>
        <div className="border border-gray-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase text-gray-500">Reserved shown</p>
          <p className="mt-2 text-2xl font-bold text-black">{visibleReserved}</p>
        </div>
        <div className="border border-gray-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase text-gray-500">Low / out shown</p>
          <p className="mt-2 text-2xl font-bold text-amber-700">
            {visibleLow} <span className="text-gray-300">/</span> <span className="text-red-700">{visibleOut}</span>
          </p>
        </div>
      </div>

      <div className="mb-5 flex flex-col gap-3 lg:flex-row">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search product, SKU, color, or size"
            className="w-full border border-gray-300 bg-white py-2.5 pl-9 pr-3 text-sm text-black outline-none focus:border-black"
          />
        </div>
        <select
          value={stockStatus}
          onChange={(event) => {
            setStockStatus(event.target.value);
            setPage(1);
          }}
          className="border border-gray-300 bg-white px-3 py-2.5 text-sm text-black outline-none focus:border-black"
        >
          <option value="">All stock</option>
          <option value="available">Available</option>
          <option value="low">Low stock</option>
          <option value="out">Out of stock</option>
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

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="overflow-hidden border border-gray-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <th className="px-4 py-3">Variant</th>
                  <th className="px-4 py-3">Option</th>
                  <th className="px-4 py-3">Available</th>
                  <th className="px-4 py-3">Physical / Reserved</th>
                  <th className="px-4 py-3">Threshold</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                      Loading inventory...
                    </td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-red-600">
                      Failed to load inventory.
                    </td>
                  </tr>
                ) : variants.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                      No variants found.
                    </td>
                  </tr>
                ) : (
                  variants.map((variant) => {
                    const tone = stockTone(variant);
                    return (
                      <tr key={variant.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-black">{variant.product_name}</div>
                          <div className="text-xs text-gray-500">{variant.sku}</div>
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {variant.color} / {variant.size}
                        </td>
                        <td className="px-4 py-3 font-semibold text-black">{variant.available_quantity}</td>
                        <td className="px-4 py-3 text-gray-600">
                          {variant.stock_quantity}
                          <span className="text-gray-400"> / {variant.reserved_quantity}</span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{variant.low_stock_threshold}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tone.className}`}>
                            {tone.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedVariant(variant);
                              setTargetStock(String(variant.stock_quantity));
                              setNotes("");
                              setError("");
                            }}
                            className="inline-flex items-center gap-1 border border-gray-300 px-2.5 py-1.5 text-xs font-semibold text-black hover:bg-gray-50"
                          >
                            <SlidersHorizontal size={13} />
                            Set count
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="space-y-6">
          <section className="border border-gray-200 bg-white p-5">
            <div className="mb-4 flex items-center gap-2">
              <PackageSearch size={18} />
              <h2 className="text-base font-bold text-black">Set stock count</h2>
            </div>
            {selectedVariant ? (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <p className="font-semibold text-black">{selectedVariant.product_name}</p>
                  <p className="text-xs text-gray-500">
                    {selectedVariant.sku} - {selectedVariant.color} / {selectedVariant.size}
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="border border-gray-200 p-2">
                    <p className="text-[11px] font-semibold uppercase text-gray-500">Physical</p>
                    <p className="mt-1 text-lg font-bold text-black">{selectedVariant.stock_quantity}</p>
                  </div>
                  <div className="border border-gray-200 p-2">
                    <p className="text-[11px] font-semibold uppercase text-gray-500">Reserved</p>
                    <p className="mt-1 text-lg font-bold text-black">{selectedVariant.reserved_quantity}</p>
                  </div>
                  <div className="border border-gray-200 p-2">
                    <p className="text-[11px] font-semibold uppercase text-gray-500">Available</p>
                    <p className="mt-1 text-lg font-bold text-black">{selectedVariant.available_quantity}</p>
                  </div>
                </div>
                <label className="grid gap-1.5 text-sm">
                  <span className="font-semibold text-gray-600">New physical stock</span>
                  <input
                    value={targetStock}
                    onChange={(event) => setTargetStock(event.target.value)}
                    placeholder="0"
                    inputMode="numeric"
                    className="border border-gray-300 px-3 py-2.5 text-sm text-black outline-none focus:border-black"
                  />
                </label>
                {stockChange !== null && (
                  <div className="border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
                    <span className="font-semibold text-gray-600">Change from current: </span>
                    <span
                      className={
                        stockChange > 0
                          ? "font-bold text-green-700"
                          : stockChange < 0
                            ? "font-bold text-red-700"
                            : "font-bold text-gray-600"
                      }
                    >
                      {signed(stockChange)}
                    </span>
                  </div>
                )}
                <label className="grid gap-1.5 text-sm">
                  <span className="font-semibold text-gray-600">Notes</span>
                  <textarea
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    rows={3}
                    placeholder="Restock, damage, recount..."
                    className="border border-gray-300 px-3 py-2.5 text-sm text-black outline-none focus:border-black"
                  />
                </label>
                {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={createAdjustment.isPending || stockChange === 0}
                    className="bg-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
                  >
                    {createAdjustment.isPending ? "Saving..." : "Save stock count"}
                  </button>
                  <button
                    type="button"
                    onClick={resetAdjustment}
                    className="border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <p className="text-sm text-gray-500">Choose a variant from the table to set its stock count.</p>
            )}
          </section>

          <section className="border border-gray-200 bg-white p-5">
            <div className="mb-4 flex items-center gap-2">
              <History size={18} />
              <h2 className="text-base font-bold text-black">Recent adjustments</h2>
            </div>
            <div className="space-y-3">
              {(adjustmentsQuery.data?.results ?? []).length === 0 ? (
                <p className="text-sm text-gray-500">No adjustments yet.</p>
              ) : (
                (adjustmentsQuery.data?.results ?? []).map((adjustment) => (
                  <div key={adjustment.id} className="border-t border-gray-100 pt-3 first:border-t-0 first:pt-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-black">{adjustment.product_name}</p>
                        <p className="text-xs text-gray-500">{adjustment.variant_sku}</p>
                      </div>
                      <span className={adjustment.quantity_delta >= 0 ? "text-sm font-bold text-green-700" : "text-sm font-bold text-red-700"}>
                        {signed(adjustment.quantity_delta)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-400">{formatDate(adjustment.created_at)}</p>
                    {adjustment.notes && <p className="mt-1 text-xs text-gray-600">{adjustment.notes}</p>}
                  </div>
                ))
              )}
            </div>
          </section>
        </aside>
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
