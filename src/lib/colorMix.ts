import { ColorMixItem } from "@/interface/Product";

const DEFAULT_COLOR = "#888888";

const COLOR_NAME_TO_CSS: Record<string, string> = {
  black: "#000000",
  white: "#ffffff",
  red: "#dc2626",
  blue: "#2563eb",
  navy: "#1f2a44",
  green: "#16a34a",
  yellow: "#facc15",
  pink: "#f9a8d4",
  purple: "#9333ea",
  brown: "#92400e",
  orange: "#f97316",
  gray: "#808080",
  grey: "#808080",
  tan: "#d2b48c",
  khaki: "#c3b091",
  cream: "#f5f0dc",
  beige: "#d6c6a8",
};

const HEX_RE = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
const HEX_WITHOUT_HASH_RE = /^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/;

export function colorToCss(color?: string | null): string {
  if (!color) return DEFAULT_COLOR;
  const value = color.trim();
  const lowerValue = value.toLowerCase();
  if (COLOR_NAME_TO_CSS[lowerValue]) return COLOR_NAME_TO_CSS[lowerValue];
  if (HEX_RE.test(value)) return value;
  if (HEX_WITHOUT_HASH_RE.test(value)) return `#${value}`;
  return DEFAULT_COLOR;
}

export function variantSwatchColors(variant: {
  color: string;
  color_mix?: ColorMixItem[] | null;
}): ColorMixItem[] {
  const mix = Array.isArray(variant.color_mix)
    ? variant.color_mix
        .map((item) => ({
          name: item.name?.trim() || "",
          hex: item.hex?.trim() || "",
          quantity: Math.max(1, Number(item.quantity) || 1),
        }))
        .filter((item) => item.name)
    : [];

  if (mix.length > 0) return mix;

  return [
    {
      name: variant.color?.trim() || "Default",
      hex: colorToCss(variant.color),
      quantity: 1,
    },
  ];
}

export function swatchBackground(colors: ColorMixItem[]): string {
  const activeColors = colors.length > 0 ? colors : [{ name: "Default", hex: DEFAULT_COLOR, quantity: 1 }];
  if (activeColors.length === 1) return activeColors[0].hex || colorToCss(activeColors[0].name);

  const total = activeColors.reduce((sum, item) => sum + Math.max(1, Number(item.quantity) || 1), 0);
  let cursor = 0;
  const segments = activeColors.map((item) => {
    const size = Math.max(1, Number(item.quantity) || 1);
    const start = (cursor / total) * 360;
    cursor += size;
    const end = (cursor / total) * 360;
    const color = item.hex || colorToCss(item.name);
    return `${color} ${start.toFixed(2)}deg ${end.toFixed(2)}deg`;
  });

  return `conic-gradient(${segments.join(", ")})`;
}

export function needsSwatchBorder(colors: ColorMixItem[]): boolean {
  return colors.some((item) => {
    const color = (item.hex || colorToCss(item.name)).toLowerCase();
    return color === "#fff" || color === "#ffffff" || color === "#f5f0dc" || color === "#d6c6a8";
  });
}

export function colorMixSummary(colors: ColorMixItem[]): string {
  return colors
    .map((item) => `${item.name}${item.quantity > 1 ? ` x${item.quantity}` : ""}`)
    .join(", ");
}
