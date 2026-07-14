import type { Metadata } from "next";
import { fetchProducts } from "@/lib/products";
import { ProductCard } from "@/components/products/product-card";

export const metadata: Metadata = {
  title: "Ürünler | VolantX Shopping",
};

export default async function ProductsPage() {
  const products = await fetchProducts();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-12 sm:px-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Ürünler</h1>
        <p className="text-sm text-muted">
          Aradığın ürünü keşfet, detaylarını incele ve sepetine ekle.
        </p>
      </div>

      {products.length === 0 ? (
        <p className="text-sm text-muted">Şu anda listelenecek ürün bulunmuyor.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
