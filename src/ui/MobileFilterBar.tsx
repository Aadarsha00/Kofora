"use client";

import { useCallback, useEffect, useState } from "react";
import { X } from "@phosphor-icons/react";
import type { CategoryFilterOption } from "@/lib/categoryFilters";
import { useCollectionFilters, type FilterGroup } from "@/hooks/useCollectionFilters";
import { CheckboxOption, FilterAccordion, PriceRangeControl } from "./filters/FilterControls";

interface SortOption {
  label: string;
  value: string;
}

interface MobileFilterBarProps {
  availableFamilies: CategoryFilterOption[];
  availableHeights: CategoryFilterOption[];
  availablePurposes: CategoryFilterOption[];
  availableStyles?: CategoryFilterOption[];
  minPrice: number;
  maxPrice: number;
  resultCount: number;
  sortOptions: SortOption[];
  currentSort: string;
}

const PRICE_KEY = "__price";

/** Which sheet is open: everything, or a single group opened from its chip. */
type SheetState = { type: "all" } | { type: "group"; key: string } | null;

function SlidersIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M1.5 4.5h9M13 4.5h1.5M1.5 11.5h3M7 11.5h7.5" />
      <circle cx="11.5" cy="4.5" r="1.75" />
      <circle cx="5.5" cy="11.5" r="1.75" />
    </svg>
  );
}

export default function MobileFilterBar({
  availableFamilies,
  availableHeights,
  availablePurposes,
  availableStyles = [],
  minPrice,
  maxPrice,
  resultCount,
  sortOptions,
  currentSort,
}: MobileFilterBarProps) {
  const {
    groups,
    activeCount,
    hasFilters,
    activeMinPrice,
    activeMaxPrice,
    priceChanged,
    toggleValue,
    optionHref,
    commitPrice,
    setSort,
    clearAll,
  } = useCollectionFilters({
    availableFamilies,
    availableHeights,
    availablePurposes,
    availableStyles,
    minPrice,
    maxPrice,
  });

  const [sheet, setSheet] = useState<SheetState>(null);
  const [visible, setVisible] = useState(false);

  const closeSheet = useCallback(() => {
    setVisible(false);
    setTimeout(() => setSheet(null), 300);
  }, []);

  const openSheet = useCallback((next: NonNullable<SheetState>) => {
    setSheet(next);
    requestAnimationFrame(() => setVisible(true));
  }, []);

  useEffect(() => {
    if (!sheet) return;

    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeSheet();
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [closeSheet, sheet]);

  const openGroup =
    sheet?.type === "group"
      ? sheet.key === PRICE_KEY
        ? null
        : groups.find((group) => group.key === sheet.key)
      : null;
  const isPriceSheet = sheet?.type === "group" && sheet.key === PRICE_KEY;

  const sheetTitle =
    sheet?.type === "all" ? "Filter & Sort" : isPriceSheet ? "Price Range" : (openGroup?.title ?? "");

  const renderOptions = (group: FilterGroup) =>
    group.options.map((option) => (
      <CheckboxOption
        key={option.id}
        label={option.label}
        checked={group.activeValues.includes(option.value)}
        disabled={option.disabled}
        href={optionHref(group.key, option.value)}
        onChange={() => toggleValue(group.key, option.value)}
      />
    ));

  return (
    <div className="lg:hidden">
      {/* Sticky chip row — the mobile entry point to filtering. */}
      <div className="sticky top-16 z-20 -mx-4 bg-white md:-mx-6">
        <div className="flex gap-2 overflow-x-auto overscroll-x-contain px-4 pt-1 pb-4 [scrollbar-width:none] md:px-6 [&::-webkit-scrollbar]:hidden">
          <button
            type="button"
            onClick={() => openSheet({ type: "all" })}
            className="inline-flex min-h-8 shrink-0 items-center gap-1.5 rounded-lg border border-gray-800 px-4 text-sm font-bold whitespace-nowrap text-black transition-all duration-300 hover:rounded-xl hover:bg-gray-50"
          >
            <SlidersIcon />
            Filter &amp; Sort
            {activeCount > 0 && <span className="tabular-nums">({activeCount})</span>}
          </button>

          {groups.map((group) => {
            const count = group.activeValues.length;

            return (
              <button
                key={group.key}
                type="button"
                onClick={() => openSheet({ type: "group", key: group.key })}
                className={`inline-flex min-h-8 shrink-0 items-center gap-1 rounded-lg border px-4 text-sm font-bold whitespace-nowrap transition-all duration-300 hover:rounded-xl ${
                  count > 0
                    ? "border-black bg-black text-white"
                    : "border-gray-300 text-black/90 hover:border-gray-500 hover:bg-gray-50"
                }`}
              >
                {group.title}
                {count > 0 && <span className="tabular-nums">({count})</span>}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => openSheet({ type: "group", key: PRICE_KEY })}
            className={`inline-flex min-h-8 shrink-0 items-center rounded-lg border px-4 text-sm font-bold whitespace-nowrap transition-all duration-300 hover:rounded-xl ${
              priceChanged
                ? "border-black bg-black text-white"
                : "border-gray-300 text-black/90 hover:border-gray-500 hover:bg-gray-50"
            }`}
          >
            Price
          </button>
        </div>
      </div>

      {sheet && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end" role="dialog" aria-modal="true" aria-label={sheetTitle}>
          <button
            type="button"
            aria-label="Close filters"
            onClick={closeSheet}
            className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
              visible ? "opacity-100" : "opacity-0"
            }`}
          />

          <div
            className="relative flex max-h-[85vh] flex-col rounded-t-2xl bg-white shadow-2xl transition-transform duration-300 ease-out"
            style={{ transform: visible ? "translateY(0)" : "translateY(100%)" }}
          >
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <h2 className="text-base font-bold text-[#030302]">{sheetTitle}</h2>
              <button type="button" onClick={closeSheet} aria-label="Close" className="text-black transition hover:opacity-50">
                <X size={20} weight="bold" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-3 py-1">
              {sheet.type === "all" ? (
                <>
                  <FilterAccordion title="Sort">
                    {sortOptions.map((option) => (
                      <label key={option.value} className="flex min-h-8 w-full cursor-pointer items-center gap-2">
                        <input
                          type="radio"
                          name="mobile-sort"
                          value={option.value}
                          checked={currentSort === option.value}
                          onChange={() => setSort(option.value)}
                          className="h-4 w-4 shrink-0 cursor-pointer accent-black"
                        />
                        <span
                          className={`text-sm leading-[1.33] ${
                            currentSort === option.value ? "font-medium text-black" : "text-gray-500"
                          }`}
                        >
                          {option.label}
                        </span>
                      </label>
                    ))}
                  </FilterAccordion>

                  {groups.map((group) => (
                    <FilterAccordion key={group.key} title={group.title}>
                      {renderOptions(group)}
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
                </>
              ) : (
                <div className="flex flex-col gap-1 px-2 py-3">
                  {isPriceSheet ? (
                    <PriceRangeControl
                      minPrice={minPrice}
                      maxPrice={maxPrice}
                      activeMinPrice={activeMinPrice}
                      activeMaxPrice={activeMaxPrice}
                      onCommit={commitPrice}
                    />
                  ) : (
                    openGroup && renderOptions(openGroup)
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 border-t border-gray-200 px-5 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
              <button
                type="button"
                onClick={clearAll}
                disabled={!hasFilters}
                className="text-sm text-gray-500 underline underline-offset-2 transition-colors hover:text-black disabled:cursor-not-allowed disabled:text-gray-300 disabled:no-underline"
              >
                Clear all
              </button>

              <button
                type="button"
                onClick={closeSheet}
                className="ml-auto min-h-11 rounded-lg bg-black px-6 text-sm font-bold text-white transition-all duration-300 hover:rounded-xl"
              >
                Show {resultCount} Item{resultCount !== 1 ? "s" : ""}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
