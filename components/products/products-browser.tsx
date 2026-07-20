"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Product } from "@/lib/products";
import { ProductCard } from "./product-card";

type SortOption = "default" | "price-asc" | "price-desc" | "name";

const SORT_LABELS: Record<SortOption, string> = {
  default: "Varsayılan Sıralama",
  "price-asc": "Fiyat: Düşükten Yükseğe",
  "price-desc": "Fiyat: Yüksekten Düşüğe",
  name: "İsme Göre (A-Z)",
};

export function ProductsBrowser({ products }: { products: Product[] }) {
  const categories = useMemo(
    () =>
      Array.from(new Set(products.map((product) => product.category))).sort((a, b) =>
        a.localeCompare(b, "tr"),
      ),
    [products],
  );

  const [category, setCategory] = useState<string>("all");
  const [sort, setSort] = useState<SortOption>("default");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredProducts = useMemo(() => {
    const base =
      category === "all" ? products : products.filter((product) => product.category === category);

    if (sort === "default") return base;

    const sorted = [...base];
    if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
    else if (sort === "name") sorted.sort((a, b) => a.name.localeCompare(b.name, "tr"));
    return sorted;
  }, [products, category, sort]);

  function selectCategory(next: string) {
    setCategory(next);
    setIsFilterOpen(false);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div ref={filterRef} className="relative">
            <button
              type="button"
              onClick={() => setIsFilterOpen((current) => !current)}
              className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                category !== "all"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-surface hover:bg-surface-hover"
              }`}
            >
              <FilterIcon className="h-4 w-4" />
              Filtrele
              <ChevronDownIcon
                className={`h-4 w-4 transition-transform ${isFilterOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isFilterOpen ? (
              <div className="absolute left-0 top-full z-10 mt-1.5 w-64 overflow-hidden rounded-lg border border-border bg-surface shadow-lg">
                <div className="max-h-80 overflow-y-auto py-1">
                  <button
                    type="button"
                    onClick={() => selectCategory("all")}
                    className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-surface-hover ${
                      category === "all" ? "text-primary" : ""
                    }`}
                  >
                    <span>Tümü</span>
                    <span className="text-xs text-muted">{products.length}</span>
                  </button>
                  {categories.map((cat) => {
                    const count = products.filter((product) => product.category === cat).length;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => selectCategory(cat)}
                        className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-surface-hover ${
                          category === cat ? "text-primary" : ""
                        }`}
                      >
                        <span>{cat}</span>
                        <span className="text-xs text-muted">{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>

          {category !== "all" ? (
            <span className="flex items-center gap-2 rounded-full border border-border bg-surface py-1.5 pl-4 pr-2 text-sm">
              {category}
              <button
                type="button"
                onClick={() => setCategory("all")}
                aria-label="Kategori filtresini kaldır"
                className="flex h-5 w-5 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
              >
                <CloseIcon className="h-3.5 w-3.5" />
              </button>
            </span>
          ) : null}
        </div>

        <label className="flex shrink-0 items-center gap-2 text-sm text-muted">
          <span className="hidden sm:inline">Sırala:</span>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as SortOption)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          >
            {Object.entries(SORT_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {filteredProducts.length === 0 ? (
        <p className="text-sm text-muted">Bu kategoride ürün bulunmuyor.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M7 12h10M10 18h4" />
    </svg>
  );
}

function ChevronDownIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
    </svg>
  );
}

function CloseIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}
