"use client";

import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { createCategory } from "@/api/category.api";
import { useCategories } from "@/hooks/useCategories";
import { TaxonomyGroup } from "@/interface/Category";
import { getApiErrorMessage } from "@/lib/apiError";
import {
  getAudienceOptions,
  getProductFamilyOptions,
  getSockHeightOptions,
  getSockPurposeOptions,
} from "@/lib/productTaxonomy";

const GROUPS: { value: TaxonomyGroup; label: string; parentSlug: string | null }[] = [
  { value: "product_family", label: "Product Family", parentSlug: null },
  { value: "audience", label: "Audience", parentSlug: null },
  { value: "height", label: "Height", parentSlug: "socks" },
  { value: "purpose", label: "Purpose", parentSlug: "socks" },
];

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function AdminTaxonomyPage() {
  const queryClient = useQueryClient();
  const { data: categories, isLoading } = useCategories();
  const [group, setGroup] = useState<TaxonomyGroup>("audience");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [sortOrder, setSortOrder] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const groupOptions = useMemo(
    () => ({
      product_family: getProductFamilyOptions(categories),
      audience: getAudienceOptions(categories),
      height: getSockHeightOptions(categories),
      purpose: getSockPurposeOptions(categories),
    }),
    [categories]
  );
  const selectedGroup = GROUPS.find((item) => item.value === group) ?? GROUPS[1];
  const socksExists = Boolean(categories?.some((category) => category.slug === "socks"));
  const nextSortOrder = useMemo(() => {
    const current = groupOptions[group] ?? [];
    const maxSort = current.reduce((max, option) => Math.max(max, option.sortOrder ?? 0), 0);
    return maxSort + 10;
  }, [group, groupOptions]);

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setName("");
      setSlug("");
      setSlugTouched(false);
      setSortOrder("");
      setMessage("Taxonomy option added.");
      setError("");
    },
    onError: (err) => {
      setMessage("");
      setError(getApiErrorMessage(err, "Failed to add taxonomy option."));
    },
  });

  const handleName = (value: string) => {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setMessage("");
    setError("");

    const finalSlug = slugify(slug || name);
    if (!name.trim() || !finalSlug) {
      setError("Name and slug are required.");
      return;
    }
    if (selectedGroup.parentSlug === "socks" && !socksExists) {
      setError("Create the Socks product family before adding sock taxonomy.");
      return;
    }

    createMutation.mutate({
      name: name.trim(),
      slug: finalSlug,
      taxonomy_group: group,
      parent: selectedGroup.parentSlug,
      sort_order: sortOrder.trim() ? Number(sortOrder) : nextSortOrder,
      is_active: true,
      description: "",
      seo_title: "",
      seo_description: "",
    });
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="border-b border-gray-200 pb-6">
        <h1 className="text-2xl font-bold text-black">Taxonomy</h1>
      </div>

      <section className="border border-gray-200 bg-white p-5">
        <h2 className="mb-4 text-lg font-bold text-black">Add Option</h2>
        <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-[1fr_1fr_1fr_120px_auto] lg:items-end">
          <label className="grid gap-1.5 text-sm">
            <span className="font-semibold text-black">Group</span>
            <select
              value={group}
              onChange={(event) => {
                setGroup(event.target.value as TaxonomyGroup);
                setMessage("");
                setError("");
              }}
              className="border border-gray-300 px-3 py-2.5 text-sm text-black outline-none focus:border-black"
            >
              {GROUPS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1.5 text-sm">
            <span className="font-semibold text-black">Name</span>
            <input
              value={name}
              onChange={(event) => handleName(event.target.value)}
              className="border border-gray-300 px-3 py-2.5 text-sm text-black outline-none focus:border-black"
            />
          </label>
          <label className="grid gap-1.5 text-sm">
            <span className="font-semibold text-black">Slug</span>
            <input
              value={slug}
              onChange={(event) => {
                setSlugTouched(true);
                setSlug(slugify(event.target.value));
              }}
              className="border border-gray-300 px-3 py-2.5 text-sm text-black outline-none focus:border-black"
            />
          </label>
          <label className="grid gap-1.5 text-sm">
            <span className="font-semibold text-black">Sort</span>
            <input
              value={sortOrder}
              inputMode="numeric"
              placeholder={String(nextSortOrder)}
              onChange={(event) => setSortOrder(event.target.value.replace(/\D/g, ""))}
              className="border border-gray-300 px-3 py-2.5 text-sm text-black outline-none focus:border-black"
            />
          </label>
          <button
            type="submit"
            disabled={createMutation.isPending || isLoading}
            className="inline-flex items-center justify-center gap-2 bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
          >
            <Plus size={16} />
            Add
          </button>
        </form>
        {(message || error) && (
          <p className={`mt-4 text-sm font-semibold ${error ? "text-red-600" : "text-green-700"}`}>
            {error || message}
          </p>
        )}
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        {GROUPS.map((item) => {
          const options = groupOptions[item.value] ?? [];

          return (
            <section key={item.value} className="border border-gray-200 bg-white p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-lg font-bold text-black">{item.label}</h2>
                <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                  {options.length}
                </span>
              </div>
              {options.length === 0 ? (
                <p className="text-sm text-gray-500">No options yet.</p>
              ) : (
                <div className="overflow-hidden border border-gray-100">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-xs uppercase tracking-widest text-gray-400">
                      <tr>
                        <th className="px-3 py-2 font-semibold">Name</th>
                        <th className="px-3 py-2 font-semibold">Slug</th>
                      </tr>
                    </thead>
                    <tbody>
                      {options.map((option) => (
                        <tr key={option.id} className="border-t border-gray-100">
                          <td className="px-3 py-2 font-semibold text-black">{option.label}</td>
                          <td className="px-3 py-2 text-gray-500">{option.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
