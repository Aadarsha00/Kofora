"use client";

import type { CategoryFilterOption } from "@/lib/categoryFilters";
import { useCollectionFilters } from "@/hooks/useCollectionFilters";
import { CheckboxOption, FilterAccordion, PriceRangeControl } from "./filters/FilterControls";

interface FilterSidebarProps {
  availableFamilies: CategoryFilterOption[];
  availableHeights: CategoryFilterOption[];
  availablePurposes: CategoryFilterOption[];
  availableStyles?: CategoryFilterOption[];
  minPrice: number;
  maxPrice: number;
}

export default function FilterSidebar({
  availableFamilies,
  availableHeights,
  availablePurposes,
  availableStyles = [],
  minPrice,
  maxPrice,
}: FilterSidebarProps) {
  const {
    groups,
    hasFilters,
    activeMinPrice,
    activeMaxPrice,
    toggleValue,
    optionHref,
    commitPrice,
    clearAll,
  } = useCollectionFilters({
    availableFamilies,
    availableHeights,
    availablePurposes,
    availableStyles,
    minPrice,
    maxPrice,
  });

  return (
    <aside className="hidden shrink-0 self-start lg:sticky lg:top-24 lg:block lg:w-60 lg:pt-2 lg:pr-4">
      {hasFilters && (
        <button
          type="button"
          onClick={clearAll}
          className="mb-2 block px-2 text-left text-xs text-gray-400 underline underline-offset-2 transition-colors hover:text-black"
        >
          Clear all filters
        </button>
      )}

      {groups.map((group) => (
        <FilterAccordion key={group.key} title={group.title}>
          {group.options.map((option) => (
            <CheckboxOption
              key={option.id}
              label={option.label}
              checked={group.activeValues.includes(option.value)}
              disabled={option.disabled}
              href={optionHref(group.key, option.value)}
              onChange={() => toggleValue(group.key, option.value)}
            />
          ))}
        </FilterAccordion>
      ))}

      <FilterAccordion title="Price Range">
        <PriceRangeControl
          minPrice={minPrice}
          maxPrice={maxPrice}
          activeMinPrice={activeMinPrice}
          activeMaxPrice={activeMaxPrice}
          onCommit={commitPrice}
        />
      </FilterAccordion>
    </aside>
  );
}
