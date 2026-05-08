"use client";

interface SortOption {
  label: string;
  value: string;
}

export default function SortSelect({
  sortOptions,
  currentSort,
}: {
  sortOptions: SortOption[];
  currentSort: string;
}) {
  return (
    <select
      defaultValue={currentSort}
      className="border-none bg-transparent text-sm font-medium text-black focus:outline-none cursor-pointer"
      onChange={(e) => {
        const url = new URL(window.location.href);
        url.searchParams.set("sort_by", e.target.value);
        window.location.href = url.toString();
      }}
    >
      {sortOptions.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}