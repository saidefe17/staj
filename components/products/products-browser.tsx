"use client";

import { useMemo, useState } from "react";
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
    () => Array.from(new Set(products.map((product) => product.category))).sort((a, b) => a.localeCompare(b, "tr")),
    [products],
  );

  const [category, setCategory] = useState<string>("all");
  const [sort, setSort] = useState<SortOption>("default");

  const filteredProducts = useMemo(() => {
    const base = category === "all" ? products : products.filter((product) => product.category === category);

    if (sort === "default") return base;

    const sorted = [...base];
    if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
    else if (sort === "name") sorted.sort((a, b) => a.name.localeCompare(b.name, "tr"));
    return sorted;
  }, [products, category, sort]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setCategory("all")}
            className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              category === "all"
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-surface hover:bg-surface-hover"
            }`}
          >
            Tümü ({products.length})
          </button>
          {categories.map((cat) => {
            const count = products.filter((product) => product.category === cat).length;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                  category === cat
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-surface hover:bg-surface-hover"
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
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
