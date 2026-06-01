"use client";

import { FormEvent, useState } from "react";
import { Trash2, X } from "lucide-react";
import { useDeleteAdminVariant, useSaveAdminVariant } from "@/hooks/useAdminProducts";
import { AdminVariantInput } from "@/interface/admin";
import { ProductVariant } from "@/interface/Product";
import { getApiErrorMessage } from "@/lib/apiError";

interface VariantFormState {
  sku: string;
  barcode: string;
  title: string;
  size: string;
  color: string;
  price: string;
  compare_at_price: string;
  cost_price: string;
  stock_quantity: string;
  low_stock_threshold: string;
  is_active: boolean;
  weight_grams: string;
}

const EMPTY: VariantFormState = {
  sku: "",
  barcode: "",
  title: "",
  size: "",
  color: "",
  price: "",
  compare_at_price: "",
  cost_price: "",
  stock_quantity: "0",
  low_stock_threshold: "10",
  is_active: true,
  weight_grams: "",
};

function Cell({
  label,
  value,
  onChange,
  placeholder,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-1 text-xs">
      <span className="font-semibold text-gray-600">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="border border-gray-300 px-2.5 py-2 text-sm text-black outline-none focus:border-black"
      />
    </label>
  );
}

export default function VariantManager({
  productId,
  variants,
}: {
  productId: number;
  variants: ProductVariant[];
}) {
  const [form, setForm] = useState<VariantFormState>(EMPTY);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const saveVariant = useSaveAdminVariant(productId);
  const deleteVariant = useDeleteAdminVariant(productId);

  const set = (key: keyof VariantFormState, value: string | boolean) =>
    setForm((current) => ({ ...current, [key]: value }));

  const resetForm = () => {
    setForm(EMPTY);
    setEditingId(null);
    setError("");
  };

  const startEdit = (variant: ProductVariant) => {
    setEditingId(variant.id);
    setError("");
    setForm({
      sku: variant.sku,
      barcode: variant.barcode ?? "",
      title: variant.title ?? "",
      size: variant.size,
      color: variant.color,
      price: variant.price,
      compare_at_price: variant.compare_at_price ?? "",
      cost_price: variant.cost_price ?? "",
      stock_quantity: String(variant.stock_quantity),
      low_stock_threshold: String(variant.low_stock_threshold),
      is_active: variant.is_active,
      weight_grams: variant.weight_grams != null ? String(variant.weight_grams) : "",
    });
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setError("");

    if (!form.sku.trim() || !form.size.trim() || !form.color.trim() || !form.price.trim()) {
      setError("SKU, size, color and price are required.");
      return;
    }

    const payload: AdminVariantInput = {
      product: productId,
      sku: form.sku.trim(),
      barcode: form.barcode.trim() || undefined,
      title: form.title.trim() || undefined,
      size: form.size.trim(),
      color: form.color.trim(),
      price: form.price.trim(),
      compare_at_price: form.compare_at_price.trim() ? form.compare_at_price.trim() : null,
      cost_price: form.cost_price.trim() ? form.cost_price.trim() : null,
      stock_quantity: Number(form.stock_quantity || 0),
      low_stock_threshold: Number(form.low_stock_threshold || 0),
      is_active: form.is_active,
      weight_grams: form.weight_grams.trim() ? Number(form.weight_grams) : null,
    };

    saveVariant.mutate(
      { id: editingId ?? undefined, payload },
      {
        onSuccess: () => resetForm(),
        onError: (err) => setError(getApiErrorMessage(err, "Failed to save variant.")),
      }
    );
  };

  const handleDelete = (variant: ProductVariant) => {
    if (!window.confirm(`Delete variant ${variant.sku}?`)) return;
    deleteVariant.mutate(variant.id);
  };

  return (
    <section className="border border-gray-200 bg-white p-5">
      <h2 className="mb-4 text-lg font-bold text-black">Variants</h2>

      {variants.length === 0 ? (
        <p className="mb-5 border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
          No variants yet. Add at least one so the product is purchasable.
        </p>
      ) : (
        <div className="mb-6 overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <th className="px-3 py-2">SKU</th>
                <th className="px-3 py-2">Size / Color</th>
                <th className="px-3 py-2">Price</th>
                <th className="px-3 py-2">Stock</th>
                <th className="px-3 py-2">Active</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {variants.map((variant) => (
                <tr key={variant.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-3 py-2 font-medium text-black">{variant.sku}</td>
                  <td className="px-3 py-2 text-gray-600">
                    {variant.size} / {variant.color}
                  </td>
                  <td className="px-3 py-2 text-black">{variant.price}</td>
                  <td className="px-3 py-2 text-gray-600">
                    {variant.available_quantity}
                    <span className="text-gray-400"> / {variant.stock_quantity}</span>
                  </td>
                  <td className="px-3 py-2">{variant.is_active ? "Yes" : "No"}</td>
                  <td className="px-3 py-2">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(variant)}
                        className="border border-gray-300 px-2.5 py-1.5 text-xs font-semibold text-black hover:bg-gray-50"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(variant)}
                        className="inline-flex items-center gap-1 border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <form onSubmit={handleSubmit} className="border-t border-gray-200 pt-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold text-black">{editingId ? "Edit variant" : "Add variant"}</h3>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-black"
            >
              <X size={13} />
              Cancel edit
            </button>
          )}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Cell label="SKU" required value={form.sku} onChange={(value) => set("sku", value)} />
          <Cell label="Size" required value={form.size} onChange={(value) => set("size", value)} placeholder="M" />
          <Cell label="Color" required value={form.color} onChange={(value) => set("color", value)} placeholder="Black" />
          <Cell label="Price" required value={form.price} onChange={(value) => set("price", value)} placeholder="19.99" />
          <Cell label="Compare-at price" value={form.compare_at_price} onChange={(value) => set("compare_at_price", value)} />
          <Cell label="Cost price" value={form.cost_price} onChange={(value) => set("cost_price", value)} />
          <Cell label="Stock quantity" value={form.stock_quantity} onChange={(value) => set("stock_quantity", value)} />
          <Cell label="Low-stock threshold" value={form.low_stock_threshold} onChange={(value) => set("low_stock_threshold", value)} />
          <Cell label="Title" value={form.title} onChange={(value) => set("title", value)} />
          <Cell label="Barcode" value={form.barcode} onChange={(value) => set("barcode", value)} />
          <Cell label="Weight (g)" value={form.weight_grams} onChange={(value) => set("weight_grams", value)} />
          <label className="flex items-end gap-2 text-sm">
            <input type="checkbox" checked={form.is_active} onChange={(event) => set("is_active", event.target.checked)} />
            Active
          </label>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <button
            type="submit"
            disabled={saveVariant.isPending}
            className="bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {saveVariant.isPending ? "Saving..." : editingId ? "Update variant" : "Add variant"}
          </button>
          {error && <span className="text-sm font-semibold text-red-600">{error}</span>}
        </div>
      </form>
    </section>
  );
}
