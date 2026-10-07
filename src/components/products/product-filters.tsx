"use client";

import { useRouter, usePathname } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function ProductFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentSearch = searchParams.get("szukaj") || "";
  const currentSort = searchParams.get("sortuj") || "newest";
  const [search, setSearch] = useState(currentSearch);

  const applyFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilter("szukaj", search.trim() || null);
  };

  const handleClearSearch = () => {
    setSearch("");
    applyFilter("szukaj", null);
  };

  return (
    <div className="bg-white p-4 sm:p-5 rounded-xl border border-warm-gray mb-8 shadow-xs space-y-4">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Wyszukiwarka po słowach kluczowych w tytule i opisie */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-md flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal/40" />
            <Input
              type="text"
              placeholder="Szukaj po słowach kluczowych..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-8 bg-cream/50 border-warm-gray text-sm"
            />
            {search && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-charcoal/40 hover:text-charcoal cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button
            type="submit"
            size="sm"
            disabled={isPending}
            className="bg-forest hover:bg-forest/90 text-white shrink-0"
          >
            Szukaj
          </Button>
        </form>

        {/* Sortowanie */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <div className="flex items-center gap-1.5 text-xs text-charcoal/60 font-medium">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Sortuj:</span>
          </div>

          <select
            value={currentSort}
            onChange={(e) => applyFilter("sortuj", e.target.value)}
            className="h-9 rounded-md border border-warm-gray bg-cream/50 px-3 py-1 text-xs text-charcoal focus:outline-none focus:ring-1 focus:ring-forest cursor-pointer"
          >
            <option value="newest">Najnowsze</option>
            <option value="popular">Najpopularniejsze</option>
            <option value="price-asc">Cena: rosnąco</option>
            <option value="price-desc">Cena: malejąco</option>
          </select>
        </div>
      </div>
    </div>
  );
}
