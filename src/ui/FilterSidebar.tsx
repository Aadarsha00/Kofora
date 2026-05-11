"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Slider } from "./slider";
import type { SubCategoryOption } from "@/lib/categoryFilters";

interface FilterSidebarProps {
  availableSubCategories: SubCategoryOption[];
  minPrice: number;
  maxPrice: number;
}

const PARAMS = {
  subCategory: "sub_category",
  minPrice: "min_price",
  maxPrice: "max_price",
} as const;

interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function FilterSection({
  title,
  children,
  defaultOpen = true,
}: FilterSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="border-b border-gray-200 py-4">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="text-xs font-semibold uppercase tracking-widest text-gray-800">
          {title}
        </span>

        <span
          className={`inline-block h-2.5 w-2.5 border-r-2 border-b-2 border-gray-600 transition-transform duration-200 ${
            open ? "-rotate-135" : "rotate-45"
          }`}
        />
      </button>

      <div
        className={`grid transition-all duration-300 ease-in-out ${
          open
            ? "grid-rows-[1fr] opacity-100 pt-3"
            : "grid-rows-[0fr] opacity-0 pt-0"
        }`}
      >
        <div className="overflow-hidden">{children}</div>
      </div>
    </section>
  );
}

interface CheckboxOptionProps {
  label: string;
  checked: boolean;
  onChange: () => void;
}

const CheckboxOption = memo(function CheckboxOption({
  label,
  checked,
  onChange,
}: CheckboxOptionProps) {
  return (
    <label className="group mb-2 flex cursor-pointer items-center gap-2.5">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 cursor-pointer border-gray-300 accent-black"
      />
      <span
        className={`text-sm transition-colors ${
          checked
            ? "font-medium text-black"
            : "text-gray-500 group-hover:text-black"
        }`}
      >
        {label}
      </span>
    </label>
  );
});

function parsePriceParam(
  value: string | null,
  fallback: number,
  min: number,
  max: number
) {
  if (value === null) return fallback;

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;

  return Math.min(Math.max(parsed, min), max);
}

export default function FilterSidebar({
  availableSubCategories,
  minPrice,
  maxPrice,
}: FilterSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  console.log("🏷️ FilterSidebar Props - minPrice:", minPrice, "maxPrice:", maxPrice);

  const activeSubCategories = searchParams.getAll(PARAMS.subCategory);

  const rawMinPrice = parsePriceParam(
    searchParams.get(PARAMS.minPrice),
    minPrice,
    minPrice,
    maxPrice
  );

  const rawMaxPrice = parsePriceParam(
    searchParams.get(PARAMS.maxPrice),
    maxPrice,
    minPrice,
    maxPrice
  );

  console.log("📌 rawMinPrice:", rawMinPrice, "rawMaxPrice:", rawMaxPrice);

  const activeMinPrice = Math.min(rawMinPrice, rawMaxPrice);
  const activeMaxPrice = Math.max(rawMinPrice, rawMaxPrice);

  console.log("🎯 activeMinPrice:", activeMinPrice, "activeMaxPrice:", activeMaxPrice);

  const [draftPrice, setDraftPrice] = useState<[number, number]>([
    activeMinPrice,
    activeMaxPrice,
  ]);

  console.log("📝 draftPrice state:", draftPrice);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
    console.log("🔄 useEffect: Updating draftPrice to:", [activeMinPrice, activeMaxPrice]);
      setDraftPrice([activeMinPrice, activeMaxPrice]);
    });
    return () => cancelAnimationFrame(frame);
  }, [activeMinPrice, activeMaxPrice]);

  const displayPrice = draftPrice;

  console.log("🖥️ displayPrice:", displayPrice);

  const hasFilters =
    activeSubCategories.length > 0 ||
    activeMinPrice !== minPrice ||
    activeMaxPrice !== maxPrice;

  const buildQueryString = useCallback(
    (updater: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString());
      updater(params);
      const qs = params.toString();
      return qs ? `${pathname}?${qs}` : pathname;
    },
    [pathname, searchParams]
  );

  const toggleMultiValueParam = useCallback(
    (key: string, value: string) => {
      const url = buildQueryString((params) => {
        const currentValues = params.getAll(key);
        const alreadySelected = currentValues.includes(value);

        params.delete(key);

        if (alreadySelected) {
          currentValues
            .filter((item) => item !== value)
            .forEach((item) => params.append(key, item));
        } else {
          [...currentValues, value].forEach((item) => params.append(key, item));
        }
      });

      router.replace(url, { scroll: false });
    },
    [buildQueryString, router]
  );

  const clearAll = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(PARAMS.subCategory);
    params.delete(PARAMS.minPrice);
    params.delete(PARAMS.maxPrice);

    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  const sortedSubCategories = useMemo(() => {
    return [...availableSubCategories].sort((a, b) =>
      a.label.localeCompare(b.label)
    );
  }, [availableSubCategories]);

  return (
    <aside className="w-full shrink-0 self-start border-b border-gray-200 pb-2 lg:sticky lg:top-24 lg:w-56 lg:border-b-0 lg:pb-0">
      {hasFilters && (
        <button
          type="button"
          onClick={clearAll}
          className="mb-3 block text-left text-xs text-gray-400 underline underline-offset-2 transition-colors hover:text-black"
        >
          Clear all filters
        </button>
      )}

      <FilterSection title="Sub Category">
        {sortedSubCategories.length > 0 ? (
          sortedSubCategories.map((subCategory) => (
            <CheckboxOption
              key={subCategory.id}
              label={subCategory.label}
              checked={activeSubCategories.includes(subCategory.value)}
              onChange={() =>
                toggleMultiValueParam(PARAMS.subCategory, subCategory.value)
              }
            />
          ))
        ) : (
          <p className="text-xs text-gray-400">No sub categories available</p>
        )}
      </FilterSection>

      <FilterSection title="Price Range">
        <div className="mb-3 flex items-center justify-between text-xs text-gray-500">
          <span>USD {displayPrice[0].toLocaleString()}</span>
          <span>USD {displayPrice[1].toLocaleString()}</span>
        </div>

        <Slider
          min={minPrice}
          max={maxPrice}
          step={1}
          value={displayPrice}
          className="mb-2"
          onValueChange={(val) => {
            console.log("🎚️ onValueChange - raw value:", val);
            console.log("🎚️ onValueChange - displayPrice before:", displayPrice);
            setDraftPrice([val[0], val[1]]);
            console.log("🎚️ onValueChange - displayPrice after:", [val[0], val[1]]);
          }}
          onValueCommit={(val) => {
            console.log("✅ onValueCommit - received values:", val);
            console.log("📊 Price range: min=", minPrice, "max=", maxPrice);
            
            const newMin = Math.min(val[0], val[1]);
            const newMax = Math.max(val[0], val[1]);

            console.log("🔄 Sorted - newMin:", newMin, "newMax:", newMax);
            setDraftPrice([newMin, newMax]);

            const url = buildQueryString((params) => {
              console.log("🔗 Before URL construction - params:", params.toString());
              params.delete(PARAMS.minPrice);
              params.delete(PARAMS.maxPrice);

              if (newMin > minPrice) {
                params.set(PARAMS.minPrice, String(newMin));
                console.log("✏️ Set min_price param:", newMin);
              }

              if (newMax < maxPrice) {
                params.set(PARAMS.maxPrice, String(newMax));
                console.log("✏️ Set max_price param:", newMax);
              }
              
              console.log("🔗 Final URL params:", params.toString());
            });

            console.log("📍 Navigating to URL:", url);
            router.replace(url, { scroll: false });
          }}
        />
      </FilterSection>

      <FilterSection title="Featured Products" defaultOpen={false}>
        <p className="text-xs text-gray-400">No featured products</p>
      </FilterSection>
    </aside>
  );
}
