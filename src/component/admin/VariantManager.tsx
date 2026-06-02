"use client";

import { FormEvent, useState } from "react";
import { Trash2, X } from "lucide-react";
import ColorMixEditor, {
  ColorMixFormItem,
  colorMixFromFormItems,
  formItemsFromColorLabel,
  formItemsFromColorMix,
} from "@/component/admin/ColorMixEditor";
import { useDeleteAdminVariant, useSaveAdminVariant } from "@/hooks/useAdminProducts";
import { AdminVariantInput } from "@/interface/admin";
import { ProductVariant } from "@/interface/Product";
import { getApiErrorMessage } from "@/lib/apiError";
import { colorMixSummary, needsSwatchBorder, swatchBackground, variantSwatchColors } from "@/lib/colorMix";
import { generateVariantSku } from "@/lib/sku";

interface VariantFormState {
  sku: string;
  barcode: string;
  title: string;
  size: string;
  color: string;
  color_mix: ColorMixFormItem[];
  is_combo: boolean;
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
  color_mix: [],
  is_combo: false,
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
  const [skuTouched, setSkuTouched] = useState(false);
  const saveVariant = useSaveAdminVariant(productId);
  const deleteVariant = useDeleteAdminVariant(productId);

  const existingSkus = variants
    .filter((variant) => variant.id !== editingId)
    .map((variant) => variant.sku);

  const nextSku = (current: VariantFormState) =>
    generateVariantSku({
      color: current.color,
      size: current.size,
      existingSkus,
    });

  const set = (key: keyof VariantFormState, value: string | boolean | ColorMixFormItem[]) =>
    setForm((current) => {
      const next = { ...current, [key]: value };
      if ((key === "size" || key === "color") && !skuTouched) {
        next.sku = nextSku(next);
      }
      if (key === "color" && current.is_combo && current.color_mix.length === 0 && typeof value === "string") {
        next.color_mix = formItemsFromColorLabel(value);
      }
      return next;
    });

  const resetForm = () => {
    setForm(EMPTY);
    setEditingId(null);
    setSkuTouched(false);
    setError("");
  };

  const startEdit = (variant: ProductVariant) => {
    setEditingId(variant.id);
    setSkuTouched(true);
    setError("");
    setForm({
      sku: variant.sku,
      barcode: variant.barcode ?? "",
      title: variant.title ?? "",
      size: variant.size,
      color: variant.color,
      color_mix: formItemsFromColorMix(variant.color_mix),
      is_combo: Array.isArray(variant.color_mix) && variant.color_mix.length > 0,
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

    const sku = form.sku.trim() || nextSku(form);
    if (!form.size.trim() || !form.color.trim() || !form.price.trim()) {
      setError("Size, color and price are required.");
      return;
    }

    const payload: AdminVariantInput = {
      product: productId,
      sku,
      barcode: form.barcode.trim() || undefined,
      title: form.title.trim() || undefined,
      size: form.size.trim(),
      color: form.color.trim(),
      color_mix: form.is_combo ? colorMixFromFormItems(form.color_mix) : [],
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
                    <span className="inline-flex items-center gap-2">
                      <span
                        className="h-4 w-4 shrink-0 rounded-full"
                        style={{
                          background: swatchBackground(variantSwatchColors(variant)),
                          border: needsSwatchBorder(variantSwatchColors(variant)) ? "1px solid #c7c7c7" : "1px solid transparent",
                        }}
                        title={colorMixSummary(variantSwatchColors(variant))}
                      />
                      {variant.size} / {variant.color}
                    </span>
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
          <label className="grid gap-1 text-xs">
            <span className="font-semibold text-gray-600">
              SKU<span className="text-red-500"> *</span>
            </span>
            <div className="flex gap-2">
              <input
                value={form.sku}
                placeholder="Auto-generated"
                onChange={(event) => {
                  setSkuTouched(true);
                  set("sku", event.target.value);
                }}
                className="min-w-0 flex-1 border border-gray-300 px-2.5 py-2 text-sm text-black outline-none focus:border-black"
              />
              <button
                type="button"
                onClick={() => {
                  setForm((current) => ({ ...current, sku: nextSku(current) }));
                  setSkuTouched(false);
                }}
                className="border border-gray-300 px-2.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Auto
              </button>
            </div>
          </label>
          <Cell label="Size" required value={form.size} onChange={(value) => set("size", value)} placeholder="M" />
          <Cell label="Color / option" required value={form.color} onChange={(value) => set("color", value)} placeholder="Black" />
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
          <label className="flex items-end gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.is_combo}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  is_combo: event.target.checked,
                  color_mix:
                    event.target.checked && current.color_mix.length === 0
                      ? formItemsFromColorLabel(current.color)
                      : current.color_mix,
                }))
              }
            />
            Mixed/combo pack
          </label>
          {form.is_combo && (
            <ColorMixEditor
              value={form.color_mix}
              fallbackColorLabel={form.color}
              onChange={(items) => set("color_mix", items)}
            />
          )}
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
