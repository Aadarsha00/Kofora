"use client";

import { FormEvent, ReactNode, useMemo, useState } from "react";
import { useCategories } from "@/hooks/useCategories";
import { useInternationalShippingOptions } from "@/hooks/useAdminProducts";
import { AdminProductInput, CURRENCY_OPTIONS } from "@/interface/admin";
import {
  TaxonomyCategoryOption,
  getCategoryIdsBySlugs,
  getAudienceOptions,
  getProductFamilyOptions,
  getSockHeightOptions,
  getSockPurposeOptions,
  getTaxonomyValidationMessage,
} from "@/lib/productTaxonomy";

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

function CategoryOption({
  option,
  checked,
  onChange,
  type = "checkbox",
}: {
  option: TaxonomyCategoryOption;
  checked: boolean;
  onChange: () => void;
  type?: "checkbox" | "radio";
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-gray-700">
      <input type={type} checked={checked} onChange={onChange} />
      {option.label}
    </label>
  );
}

function CategoryGroup({
  title,
  options,
  selectedIds,
  onToggle,
  onSelect,
  required = false,
  single = false,
}: {
  title: string;
  options: TaxonomyCategoryOption[];
  selectedIds: number[];
  onToggle?: (id: number) => void;
  onSelect?: (id: number) => void;
  required?: boolean;
  single?: boolean;
}) {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">
        {title}
        {required && <span className="text-red-500"> *</span>}
      </h3>
      {options.length === 0 ? (
        <p className="text-sm text-gray-500">No options available.</p>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {options.map((option) => (
            <CategoryOption
              key={option.id}
              option={option}
              checked={selectedIds.includes(option.id)}
              type={single ? "radio" : "checkbox"}
              onChange={() => (single ? onSelect?.(option.id) : onToggle?.(option.id))}
            />
          ))}
        </div>
      )}
    </div>
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
  const { data: internationalShippingOptions = [] } = useInternationalShippingOptions();
  const [values, setValues] = useState<AdminProductInput>(initial);
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [internalError, setInternalError] = useState("");

  const productFamilyOptions = useMemo(
    () => getProductFamilyOptions(categories),
    [categories]
  );
  const audienceOptions = useMemo(
    () => getAudienceOptions(categories),
    [categories]
  );
  const heightOptions = useMemo(
    () => getSockHeightOptions(categories),
    [categories]
  );
  const purposeOptions = useMemo(
    () => getSockPurposeOptions(categories),
    [categories]
  );
  const productFamilyIds = useMemo(
    () => productFamilyOptions.map((option) => option.id),
    [productFamilyOptions]
  );
  const heightIds = useMemo(
    () => heightOptions.map((option) => option.id),
    [heightOptions]
  );
  const socksCategoryIds = useMemo(() => getCategoryIdsBySlugs(categories, ["socks"]), [categories]);
  const selectedCategoryIds = useMemo(() => {
    if (
      mode === "create" &&
      productFamilyOptions.length === 1 &&
      !values.categories.some((id) => productFamilyIds.includes(id))
    ) {
      return [...values.categories, productFamilyOptions[0].id];
    }

    return values.categories;
  }, [mode, productFamilyIds, productFamilyOptions, values.categories]);
  const isSocksSelected = selectedCategoryIds.some((id) => socksCategoryIds.includes(id));

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
    setInternalError("");
    setValues((current) => ({
      ...current,
      categories: current.categories.includes(id)
        ? current.categories.filter((value) => value !== id)
        : [...current.categories, id],
    }));
  };

  const selectCategoryFromGroup = (groupIds: number[], id: number) => {
    setInternalError("");
    setValues((current) => ({
      ...current,
      categories: [...current.categories.filter((value) => !groupIds.includes(value)), id],
    }));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const validationMessage = getTaxonomyValidationMessage(selectedCategoryIds, categories);
    if (validationMessage) {
      setInternalError(validationMessage);
      return;
    }

    setInternalError("");
    onSubmit({ ...values, categories: selectedCategoryIds, slug: values.slug || slugify(values.name) });
  };
  const displayError = internalError || error;

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
            <span className="font-semibold text-black">International shipping</span>
            <select
              value={values.international_shipping ?? ""}
              onChange={(event) =>
                set("international_shipping", event.target.value ? Number(event.target.value) : null)
              }
              className="border border-gray-300 px-3 py-2.5 text-sm text-black outline-none focus:border-black"
            >
              <option value="">No international shipping details</option>
              {internationalShippingOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.title} - {option.destination_country}
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
        <h2 className="mb-4 text-lg font-bold text-black">Taxonomy</h2>
        <div className="grid gap-5">
          <CategoryGroup
            title="Product family"
            options={productFamilyOptions}
            selectedIds={selectedCategoryIds}
            onSelect={(id) => selectCategoryFromGroup(productFamilyIds, id)}
            required
            single
          />
          <CategoryGroup
            title="Audience"
            options={audienceOptions}
            selectedIds={selectedCategoryIds}
            onToggle={toggleCategory}
            required
          />
          <CategoryGroup
            title="Height"
            options={heightOptions}
            selectedIds={selectedCategoryIds}
            onSelect={(id) => selectCategoryFromGroup(heightIds, id)}
            required={isSocksSelected}
            single
          />
          <CategoryGroup
            title="Purpose"
            options={purposeOptions}
            selectedIds={selectedCategoryIds}
            onToggle={toggleCategory}
          />
        </div>
        {internalError && <p className="mt-4 text-sm font-semibold text-red-600">{internalError}</p>}
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
          {displayError && <span className="text-sm font-semibold text-red-600">{displayError}</span>}
        </div>
      )}
    </form>
  );
}
