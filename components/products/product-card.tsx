import Link from "next/link";
import type { Product } from "@/lib/products";
import { AddToCartButton } from "./add-to-cart-button";

export function ProductCard({ product }: { product: Product }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10">
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-muted">
            {product.category}
          </span>
          <h3 className="font-semibold">{product.name}</h3>
          <p className="text-sm text-muted line-clamp-2">
            {product.description}
          </p>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
          <span className="text-lg font-semibold">
            {product.price.toLocaleString("tr-TR")} ₺
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/products/${product.id}`}
            className="flex-1 rounded-lg border border-border px-4 py-2 text-center text-sm font-medium transition-colors hover:bg-surface-hover"
          >
            Ürünü İncele
          </Link>
          <AddToCartButton productId={product.id} className="flex-1" />
        </div>
      </div>
    </div>
  );
}
