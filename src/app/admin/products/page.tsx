"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useAdminProducts, useDeleteAdminProduct } from "@/hooks/useAdminProducts";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { AdminProductListParams } from "@/interface/admin";
import { Product } from "@/interface/Product";
import { getApiErrorMessage } from "@/lib/apiError";
import { primaryProductImage } from "@/lib/productImages";

const PAGE_SIZE = 20;

function productThumb(product: Product): string | null {
  return primaryProductImage(product)?.image ?? null;
}

function priceRange(product: Product): string {
  const prices = product.variants
    .filter((variant) => variant.is_active)
    .map((variant) => Number(variant.price))
    .filter((value) => !Number.isNaN(value));
  if (prices.length === 0) return "-";
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const currency = product.base_currency;
  return min === max
    ? `${currency} ${min.toFixed(2)}`
    : `${currency} ${min.toFixed(2)}-${max.toFixed(2)}`;
}

function totalStock(product: Product): number {
  return product.variants.reduce((sum, variant) => sum + (variant.available_quantity ?? 0), 0);
}

function Badge({ label, tone }: { label: string; tone: "green" | "gray" | "amber" }) {
  const tones = {
    green: "bg-green-100 text-green-800",
    gray: "bg-gray-100 text-gray-600",
    amber: "bg-amber-100 text-amber-800",
  };
  return <span className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${tones[tone]}`}>{label}</span>;
}

export default function AdminProductsPage() {
  const [search, setSearch] = useState("");
  const [published, setPublished] = useState("");
  const [active, setActive] = useState("");
  const [page, setPage] = useState(1);
  const [actionError, setActionError] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim(), 300);

  const params = useMemo<AdminProductListParams>(() => {
    const next: AdminProductListParams = { page, page_size: PAGE_SIZE, ordering: "-created_at" };
    if (debouncedSearch) next.search = debouncedSearch;
    if (published) next.is_published = published;
    if (active) next.is_active = active;
    return next;
  }, [page, debouncedSearch, published, active]);

  const { data, isLoading, isFetching, isError } = useAdminProducts(params);
  const deleteProduct = useDeleteAdminProduct();

  const products = data?.results ?? [];
  const total = data?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleDelete = (product: Product) => {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    setActionError("");
    deleteProduct.mutate(product.id, {
      onError: (err) => setActionError(getApiErrorMessage(err, "Failed to delete product.")),
    });
  };

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-bold text-black">Products</h1>
          <p className="mt-1 text-sm text-gray-500">
            {isFetching ? "Loading..." : `${total} product${total === 1 ? "" : "s"}`}
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 bg-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
        >
          <Plus size={16} />
          New product
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
            placeholder="Search by name or brand"
            className="w-full border border-gray-300 bg-white py-2.5 pl-9 pr-3 text-sm text-black outline-none focus:border-black"
          />
        </div>
        <select
          value={published}
          onChange={(event) => {
            setPublished(event.target.value);
            setPage(1);
          }}
          className="border border-gray-300 bg-white px-3 py-2.5 text-sm text-black outline-none focus:border-black"
        >
          <option value="">All visibility</option>
          <option value="true">Published</option>
          <option value="false">Draft</option>
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
      {actionError && <p className="mb-4 text-sm font-semibold text-red-600">{actionError}</p>}

      <div className="overflow-hidden border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Variants</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                    Loading products...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-red-600">
                    Failed to load products.
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                    No products found.
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const thumb = productThumb(product);
                  return (
                    <tr key={product.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden border border-gray-200 bg-gray-50">
                            {thumb ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={thumb} alt={product.name} className="h-full w-full object-cover" />
                            ) : (
                              <span className="text-[10px] text-gray-400">No image</span>
                            )}
                          </span>
                          <span>
                            <span className="block font-semibold text-black">{product.name}</span>
                            <span className="block text-xs text-gray-500">{product.brand}</span>
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          {product.is_published ? <Badge label="Published" tone="green" /> : <Badge label="Draft" tone="gray" />}
                          {!product.is_active && <Badge label="Inactive" tone="amber" />}
                          {product.is_featured && <Badge label="Featured" tone="green" />}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{product.variants.length}</td>
                      <td className="px-4 py-3 font-semibold text-black">{priceRange(product)}</td>
                      <td className="px-4 py-3 text-gray-600">{totalStock(product)}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/admin/products/${product.id}`}
                            className="inline-flex items-center gap-1 border border-gray-300 px-2.5 py-1.5 text-xs font-semibold text-black hover:bg-gray-50"
                          >
                            <Pencil size={13} />
                            Edit
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDelete(product)}
                            disabled={deleteProduct.isPending}
                            className="inline-flex items-center gap-1 border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                          >
                            <Trash2 size={13} />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
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
