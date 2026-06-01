"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { StagedVariantInput } from "@/interface/admin";

interface FormState {
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

const EMPTY: FormState = {
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
        onKeyDown={(event) => {
          if (event.key === "Enter") event.preventDefault();
        }}
        className="border border-gray-300 px-2.5 py-2 text-sm text-black outline-none focus:border-black"
      />
    </label>
  );
}

export default function StagedVariantList({
  value,
  onChange,
}: {
  value: StagedVariantInput[];
  onChange: (variants: StagedVariantInput[]) => void;
}) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [error, setError] = useState("");

  const set = (key: keyof FormState, fieldValue: string | boolean) =>
    setForm((current) => ({ ...current, [key]: fieldValue }));

  const handleAdd = () => {
    setError("");
    if (!form.sku.trim() || !form.size.trim() || !form.color.trim() || !form.price.trim()) {
      setError("SKU, size, color and price are required.");
      return;
    }
    if (value.some((variant) => variant.sku === form.sku.trim())) {
      setError("That SKU is already in the list.");
      return;
    }

    const variant: StagedVariantInput = {
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
    onChange([...value, variant]);
    setForm(EMPTY);
  };

  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <section className="border border-gray-200 bg-white p-5">
      <h2 className="mb-1 text-lg font-bold text-black">Variants</h2>
      <p className="mb-4 text-xs text-gray-500">
        Add each size/color this product comes in. A product needs at least one variant to be purchasable.
      </p>

      {value.length > 0 && (
        <div className="mb-5 overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <th className="px-3 py-2">SKU</th>
                <th className="px-3 py-2">Size / Color</th>
                <th className="px-3 py-2">Price</th>
                <th className="px-3 py-2">Stock</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {value.map((variant, index) => (
                <tr key={`${variant.sku}-${index}`} className="border-b border-gray-100 last:border-0">
                  <td className="px-3 py-2 font-medium text-black">{variant.sku}</td>
                  <td className="px-3 py-2 text-gray-600">
                    {variant.size} / {variant.color}
                  </td>
                  <td className="px-3 py-2 text-black">{variant.price}</td>
                  <td className="px-3 py-2 text-gray-600">{variant.stock_quantity}</td>
                  <td className="px-3 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => handleRemove(index)}
                      className="inline-flex items-center gap-1 border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Cell label="SKU" required value={form.sku} onChange={(v) => set("sku", v)} />
        <Cell label="Size" required value={form.size} onChange={(v) => set("size", v)} placeholder="M" />
        <Cell label="Color" required value={form.color} onChange={(v) => set("color", v)} placeholder="Black" />
        <Cell label="Price" required value={form.price} onChange={(v) => set("price", v)} placeholder="19.99" />
        <Cell label="Compare-at price" value={form.compare_at_price} onChange={(v) => set("compare_at_price", v)} />
        <Cell label="Cost price" value={form.cost_price} onChange={(v) => set("cost_price", v)} />
        <Cell label="Stock quantity" value={form.stock_quantity} onChange={(v) => set("stock_quantity", v)} />
        <Cell label="Low-stock threshold" value={form.low_stock_threshold} onChange={(v) => set("low_stock_threshold", v)} />
        <Cell label="Title" value={form.title} onChange={(v) => set("title", v)} />
        <Cell label="Barcode" value={form.barcode} onChange={(v) => set("barcode", v)} />
        <Cell label="Weight (g)" value={form.weight_grams} onChange={(v) => set("weight_grams", v)} />
        <label className="flex items-end gap-2 text-sm">
          <input type="checkbox" checked={form.is_active} onChange={(event) => set("is_active", event.target.checked)} />
          Active
        </label>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center gap-2 border border-black px-4 py-2 text-sm font-semibold text-black hover:bg-gray-50"
        >
          <Plus size={15} />
          Add variant to list
        </button>
        {error && <span className="text-sm font-semibold text-red-600">{error}</span>}
      </div>
    </section>
  );
}
