"use client";

import { Plus, RefreshCw, Trash2 } from "lucide-react";
import { ColorMixItem } from "@/interface/Product";
import { colorMixSummary, colorToCss, needsSwatchBorder, swatchBackground, variantSwatchColors } from "@/lib/colorMix";

export interface ColorMixFormItem {
  name: string;
  hex: string;
  quantity: string;
}

export function emptyColorMixItem(name = ""): ColorMixFormItem {
  return {
    name,
    hex: colorToCss(name),
    quantity: "1",
  };
}

export function formItemsFromColorMix(items?: ColorMixItem[] | null): ColorMixFormItem[] {
  if (!Array.isArray(items)) return [];
  return items.map((item) => ({
    name: item.name,
    hex: item.hex || colorToCss(item.name),
    quantity: String(Math.max(1, Number(item.quantity) || 1)),
  }));
}

export function formItemsFromColorLabel(label: string): ColorMixFormItem[] {
  return label
    .split(/[\/,+&]+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((name) => emptyColorMixItem(name));
}

export function colorMixFromFormItems(items: ColorMixFormItem[]): ColorMixItem[] {
  return items
    .map((item) => ({
      name: item.name.trim(),
      hex: item.hex.trim(),
      quantity: Math.max(1, Number(item.quantity) || 1),
    }))
    .filter((item) => item.name);
}

export default function ColorMixEditor({
  value,
  fallbackColorLabel,
  onChange,
}: {
  value: ColorMixFormItem[];
  fallbackColorLabel: string;
  onChange: (value: ColorMixFormItem[]) => void;
}) {
  const savedColors = colorMixFromFormItems(value);
  const previewColors =
    savedColors.length > 0
      ? savedColors
      : variantSwatchColors({ color: fallbackColorLabel || "Default", color_mix: [] });

  const updateItem = (index: number, patch: Partial<ColorMixFormItem>) => {
    onChange(value.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)));
  };

  const removeItem = (index: number) => {
    onChange(value.filter((_, itemIndex) => itemIndex !== index));
  };

  return (
    <div className="border-t border-gray-200 pt-4 sm:col-span-2 lg:col-span-3">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-gray-600">Colors inside this pack</p>
          <p className="mt-1 text-xs text-gray-400">Add each color and how many pieces of that color are inside.</p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="h-7 w-7 rounded-full"
            style={{
              background: swatchBackground(previewColors),
              border: needsSwatchBorder(previewColors) ? "1px solid #c7c7c7" : "1px solid transparent",
            }}
            title={colorMixSummary(previewColors)}
          />
          <button
            type="button"
            onClick={() => onChange(formItemsFromColorLabel(fallbackColorLabel))}
            disabled={!fallbackColorLabel.trim()}
            className="inline-flex items-center gap-1 border border-gray-300 px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw size={13} />
            Auto from option
          </button>
          <button
            type="button"
            onClick={() => onChange([...value, emptyColorMixItem()])}
            className="inline-flex items-center gap-1 border border-gray-300 px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-white"
          >
            <Plus size={13} />
            Add color
          </button>
        </div>
      </div>

      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((item, index) => (
            <div key={index} className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_120px_90px_36px]">
              <input
                value={item.name}
                placeholder="Black"
                onChange={(event) => updateItem(index, { name: event.target.value })}
                onKeyDown={(event) => {
                  if (event.key === "Enter") event.preventDefault();
                }}
                className="border border-gray-300 px-2.5 py-2 text-sm text-black outline-none focus:border-black"
              />
              <input
                type="color"
                value={item.hex || "#000000"}
                onChange={(event) => updateItem(index, { hex: event.target.value })}
                className="h-10 w-full border border-gray-300 bg-white px-1 py-1"
              />
              <input
                value={item.quantity}
                inputMode="numeric"
                placeholder="Qty"
                onChange={(event) => updateItem(index, { quantity: event.target.value })}
                onKeyDown={(event) => {
                  if (event.key === "Enter") event.preventDefault();
                }}
                className="border border-gray-300 px-2.5 py-2 text-sm text-black outline-none focus:border-black"
              />
              <button
                type="button"
                onClick={() => removeItem(index)}
                title="Remove color"
                className="inline-flex h-10 items-center justify-center border border-red-200 text-red-700 hover:bg-red-50"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
