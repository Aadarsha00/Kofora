"use client";

import { FormEvent, ReactNode, useMemo, useState } from "react";
import { useCategories } from "@/hooks/useCategories";
import { AdminProductInput, CURRENCY_OPTIONS } from "@/interface/admin";

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function Field({
  label,
  value,
  onChange,
  required = false,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="font-semibold text-black">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      <input
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="border border-gray-300 px-3 py-2.5 text-sm text-black outline-none focus:border-black"
      />
    </label>
  );
}

export default function ProductForm({
  mode,
  initial,
  submitting,
  error,
  message,
  onSubmit,
  children,
  formId,
  showActions = true,
}: {
  mode: "create" | "edit";
  initial: AdminProductInput;
  submitting: boolean;
  error: string;
  message?: string;
  onSubmit: (values: AdminProductInput) => void;
  children?: ReactNode;
  formId?: string;
  showActions?: boolean;
}) {
  const { data: categories } = useCategories();
  const [values, setValues] = useState<AdminProductInput>(initial);
  const [slugTouched, setSlugTouched] = useState(mode === "edit");

  const categoryOptions = useMemo(() => {
    const list: { id: number; label: string }[] = [];
    (categories ?? []).forEach((parent) => {
      list.push({ id: parent.id, label: parent.name });
      parent.children.forEach((child) => list.push({ id: child.id, label: `${parent.name} › ${child.name}` }));
    });
    return list;
  }, [categories]);

  const set = <K extends keyof AdminProductInput>(key: K, value: AdminProductInput[K]) =>
    setValues((current) => ({ ...current, [key]: value }));

  const handleName = (name: string) => {
    setValues((current) => ({
      ...current,
      name,
      slug: slugTouched ? current.slug : slugify(name),
    }));
  };

  const toggleCategory = (id: number) => {
    setValues((current) => ({
      ...current,
      categories: current.categories.includes(id)
        ? current.categories.filter((value) => value !== id)
        : [...current.categories, id],
    }));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit({ ...values, slug: values.slug || slugify(values.name) });
  };

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-6">
      <section className="border border-gray-200 bg-white p-5">
        <h2 className="mb-4 text-lg font-bold text-black">Details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" required value={values.name} onChange={handleName} />
          <label className="grid gap-1.5 text-sm">
            <span className="font-semibold text-black">
              Slug<span className="text-red-500"> *</span>
            </span>
            <input
              value={values.slug}
              required
              onChange={(event) => {
                setSlugTouched(true);
                set("slug", slugify(event.target.value));
              }}
              className="border border-gray-300 px-3 py-2.5 text-sm text-black outline-none focus:border-black"
            />
          </label>
          <Field label="Brand" value={values.brand} onChange={(value) => set("brand", value)} />
          <label className="grid gap-1.5 text-sm">
            <span className="font-semibold text-black">Currency</span>
            <select
              value={values.base_currency}
              onChange={(event) => set("base_currency", event.target.value)}
              className="border border-gray-300 px-3 py-2.5 text-sm text-black outline-none focus:border-black"
            >
              {CURRENCY_OPTIONS.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1.5 text-sm sm:col-span-2">
            <span className="font-semibold text-black">Short description</span>
            <input
              value={values.short_description}
              onChange={(event) => set("short_description", event.target.value)}
              maxLength={320}
              className="border border-gray-300 px-3 py-2.5 text-sm text-black outline-none focus:border-black"
            />
          </label>
          <label className="grid gap-1.5 text-sm sm:col-span-2">
            <span className="font-semibold text-black">Full description</span>
            <textarea
              value={values.full_description}
              onChange={(event) => set("full_description", event.target.value)}
              rows={4}
              className="border border-gray-300 px-3 py-2.5 text-sm text-black outline-none focus:border-black"
            />
          </label>
        </div>
      </section>

      <section className="border border-gray-200 bg-white p-5">
        <h2 className="mb-4 text-lg font-bold text-black">Visibility</h2>
        <div className="flex flex-wrap gap-5 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={values.is_published} onChange={(event) => set("is_published", event.target.checked)} />
            Published
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={values.is_active} onChange={(event) => set("is_active", event.target.checked)} />
            Active
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={values.is_featured} onChange={(event) => set("is_featured", event.target.checked)} />
            Featured
          </label>
        </div>
      </section>

      <section className="border border-gray-200 bg-white p-5">
        <h2 className="mb-4 text-lg font-bold text-black">Categories</h2>
        {categoryOptions.length === 0 ? (
          <p className="text-sm text-gray-500">No categories available.</p>
        ) : (
          <div className="grid max-h-56 gap-2 overflow-y-auto sm:grid-cols-2">
            {categoryOptions.map((option) => (
              <label key={option.id} className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={values.categories.includes(option.id)}
                  onChange={() => toggleCategory(option.id)}
                />
                {option.label}
              </label>
            ))}
          </div>
        )}
      </section>

      <section className="border border-gray-200 bg-white p-5">
        <h2 className="mb-4 text-lg font-bold text-black">SEO</h2>
        <div className="grid gap-4">
          <Field label="SEO title" value={values.seo_title} onChange={(value) => set("seo_title", value)} />
          <label className="grid gap-1.5 text-sm">
            <span className="font-semibold text-black">SEO description</span>
            <textarea
              value={values.seo_description}
              onChange={(event) => set("seo_description", event.target.value)}
              rows={2}
              maxLength={500}
              className="border border-gray-300 px-3 py-2.5 text-sm text-black outline-none focus:border-black"
            />
          </label>
        </div>
      </section>

      {children}

      {showActions && (
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="bg-black px-6 py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {submitting ? "Saving..." : mode === "create" ? "Create product" : "Save changes"}
          </button>
          {message && <span className="text-sm font-semibold text-green-700">{message}</span>}
          {error && <span className="text-sm font-semibold text-red-600">{error}</span>}
        </div>
      )}
    </form>
  );
}
