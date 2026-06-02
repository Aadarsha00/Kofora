const COLOR_CODES: Record<string, string> = {
  black: "BLK",
  white: "WHT",
  red: "RED",
  blue: "BLU",
  navy: "NVY",
  green: "GRN",
  yellow: "YLW",
  pink: "PNK",
  purple: "PRP",
  brown: "BRN",
  orange: "ORG",
  gray: "GRY",
  grey: "GRY",
  tan: "TAN",
  khaki: "KHK",
  cream: "CRM",
  beige: "BGE",
};

function cleanPart(value: string, fallback: string, maxLength: number): string {
  const cleaned = value.toUpperCase().replace(/[^A-Z0-9]+/g, "");
  return (cleaned || fallback).slice(0, maxLength);
}

function colorCode(color: string): string {
  const normalized = color.trim().toLowerCase();
  const parts = normalized
    .split(/[\/,+&]+/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length > 1) {
    return parts.map((part) => COLOR_CODES[part] ?? cleanPart(part, "CLR", 3)).join("-");
  }

  return COLOR_CODES[normalized] ?? cleanPart(color, "CLR", 3);
}

export function generateVariantSku({
  color,
  size,
  existingSkus,
  prefix = "KOF",
}: {
  color: string;
  size: string;
  existingSkus: string[];
  prefix?: string;
}): string {
  const used = new Set(existingSkus.map((sku) => sku.trim().toUpperCase()).filter(Boolean));
  const base = `${cleanPart(prefix, "KOF", 8)}-${colorCode(color)}-${cleanPart(size, "SIZE", 8)}`;

  let index = 1;
  let candidate = `${base}-${String(index).padStart(3, "0")}`;
  while (used.has(candidate)) {
    index += 1;
    candidate = `${base}-${String(index).padStart(3, "0")}`;
  }
  return candidate;
}
