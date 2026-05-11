import type { Metadata } from "next";
import { Suspense } from "react";
import SearchResults from "./SearchResults";

export const metadata: Metadata = {
  title: "Search | KOFORA",
  description: "Search KOFORA products.",
};

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-white px-4 py-10 text-sm text-gray-500">
          Loading search...
        </main>
      }
    >
      <SearchResults />
    </Suspense>
  );
}
