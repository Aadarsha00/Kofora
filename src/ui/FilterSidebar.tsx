"use client";
import { SockHeight } from "@/data/ProductsData";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { memo, useCallback, useMemo, useState } from "react";
import { Slider } from "./slider";

interface FilterSidebarProps {
  availableHeights: SockHeight[];
  minPrice: number;
  maxPrice: number;
}

const PARAMS = {
  height: "filter.p.m.custom.sub_category",
  gender: "filter.p.m.custom.gender1",
  availability: "filter.p.m.custom.availability",
  minPrice: "filter.v.price.gte",
  maxPrice: "filter.v.price.lte",
} as const;

const GENDER_OPTIONS = ["Men", "Women"] as const;
const AVAILABILITY_OPTIONS = ["In stock", "Out of stock"] as const;

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
          open ? "grid-rows-[1fr] opacity-100 pt-3" : "grid-rows-[0fr] opacity-0 pt-0"
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

export default function FilterSidebar({
  availableHeights,
  minPrice,
  maxPrice,
}: FilterSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeHeights = searchParams.getAll(PARAMS.height);
  const activeGenders = searchParams.getAll(PARAMS.gender);
  const activeAvailability = searchParams.getAll(PARAMS.availability);

  const activeMinPrice = Number(searchParams.get(PARAMS.minPrice) ?? minPrice);
  const activeMaxPrice = Number(searchParams.get(PARAMS.maxPrice) ?? maxPrice);

  const [isDragging, setIsDragging] = useState(false);
  const [dragPrice, setDragPrice] = useState([activeMinPrice, activeMaxPrice]);

  const displayPrice = isDragging ? dragPrice : [activeMinPrice, activeMaxPrice];

  const hasFilters =
    activeHeights.length > 0 ||
    activeGenders.length > 0 ||
    activeAvailability.length > 0 ||
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
    router.replace(pathname, { scroll: false });
  }, [pathname, router]);

  const sortedHeights = useMemo(() => {
    const order: SockHeight[] = [
      "No-Show",
      "Ankle",
      "Quarter",
      "Crew",
      "Half-Calf",
      "Knee-High",
    ];

    return [...availableHeights].sort(
      (a, b) => order.indexOf(a) - order.indexOf(b)
    );
  }, [availableHeights]);

  return (
    <aside className="sticky top-6 w-56 shrink-0 self-start">
      {hasFilters && (
        <button
          type="button"
          onClick={clearAll}
          className="mb-3 block text-left text-xs text-gray-400 underline underline-offset-2 transition-colors hover:text-black"
        >
          Clear all filters
        </button>
      )}

      <FilterSection title="Gender">
        {GENDER_OPTIONS.map((gender) => (
          <CheckboxOption
            key={gender}
            label={gender}
            checked={activeGenders.includes(gender)}
            onChange={() => toggleMultiValueParam(PARAMS.gender, gender)}
          />
        ))}
      </FilterSection>

      <FilterSection title="Sock Height">
        {sortedHeights.map((height) => (
          <CheckboxOption
            key={height}
            label={height}
            checked={activeHeights.includes(height)}
            onChange={() => toggleMultiValueParam(PARAMS.height, height)}
          />
        ))}
      </FilterSection>

      <FilterSection title="Availability">
        {AVAILABILITY_OPTIONS.map((status) => (
          <CheckboxOption
            key={status}
            label={status}
            checked={activeAvailability.includes(status)}
            onChange={() => toggleMultiValueParam(PARAMS.availability, status)}
          />
        ))}
      </FilterSection>

      <FilterSection title="Price Range">
        <div className="mb-3 flex items-center justify-between text-xs text-gray-500">
          <span>NPR {displayPrice[0].toLocaleString()}</span>
          <span>NPR {displayPrice[1].toLocaleString()}</span>
        </div>

        <Slider
          min={minPrice}
          max={maxPrice}
          step={100}
          value={displayPrice}
          className="py-1"
          onValueChange={(val) => {
            setIsDragging(true);
            setDragPrice(val);
          }}
          onValueCommit={([newMin, newMax]) => {
            setIsDragging(false);
            const url = buildQueryString((params) => {
              params.delete(PARAMS.minPrice);
              params.delete(PARAMS.maxPrice);
              if (newMin !== minPrice) params.set(PARAMS.minPrice, String(newMin));
              if (newMax !== maxPrice) params.set(PARAMS.maxPrice, String(newMax));
            });
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