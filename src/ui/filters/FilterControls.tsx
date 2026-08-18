"use client";

import { memo, useEffect, useState } from "react";
import { Slider } from "../slider";

export function FilterAccordion({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="w-full border-t border-gray-200">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="flex w-full items-start justify-between px-2 pt-3.5 pb-1 text-left"
      >
        <span className="pt-1 text-base font-bold leading-[1.15] text-[#030302]">{title}</span>
        <span
          className={`mt-2 inline-block h-2 w-2 shrink-0 border-r-2 border-b-2 border-[#030302] transition-transform duration-200 ${
            open ? "-rotate-135" : "rotate-45"
          }`}
        />
      </button>

      <div
        className={`grid transition-all duration-300 ease-in-out ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-1 px-2 pt-2 pb-4">{children}</div>
        </div>
      </div>
    </section>
  );
}

export const CheckboxOption = memo(function CheckboxOption({
  label,
  checked,
  disabled,
  href,
  onChange,
}: {
  label: string;
  checked: boolean;
  disabled?: boolean;
  href: string;
  onChange: () => void;
}) {
  return (
    <label
      className={`flex min-h-8 w-full items-center gap-2 ${
        disabled ? "cursor-not-allowed" : "group cursor-pointer"
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        className={`h-4 w-4 shrink-0 border-gray-300 accent-black ${
          disabled ? "cursor-not-allowed" : "cursor-pointer"
        }`}
      />
      <span
        className={`text-sm font-normal leading-[1.33] transition-colors ${
          disabled
            ? "text-gray-300"
            : checked
              ? "font-medium text-black"
              : "text-gray-500 group-hover:text-black"
        }`}
      >
        {label}
      </span>
      {/* Crawlable target for the filtered view; hidden from the visual/AT tree. */}
      <a hidden href={href}>
        {label}
      </a>
    </label>
  );
});

export function PriceRangeControl({
  minPrice,
  maxPrice,
  activeMinPrice,
  activeMaxPrice,
  onCommit,
}: {
  minPrice: number;
  maxPrice: number;
  activeMinPrice: number;
  activeMaxPrice: number;
  onCommit: (min: number, max: number) => void;
}) {
  const [draftPrice, setDraftPrice] = useState<[number, number]>([activeMinPrice, activeMaxPrice]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setDraftPrice([activeMinPrice, activeMaxPrice]);
    });
    return () => cancelAnimationFrame(frame);
  }, [activeMinPrice, activeMaxPrice]);

  return (
    <>
      <div className="mb-3 flex items-center justify-between text-xs text-gray-500">
        <span>USD {draftPrice[0].toLocaleString()}</span>
        <span>USD {draftPrice[1].toLocaleString()}</span>
      </div>

      <Slider
        min={minPrice}
        max={maxPrice}
        step={1}
        value={draftPrice}
        className="mb-2"
        onValueChange={(val) => setDraftPrice([val[0], val[1]])}
        onValueCommit={(val) => {
          const nextMin = Math.min(val[0], val[1]);
          const nextMax = Math.max(val[0], val[1]);
          setDraftPrice([nextMin, nextMax]);
          onCommit(nextMin, nextMax);
        }}
      />
    </>
  );
}
