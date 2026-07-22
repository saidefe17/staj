import type { Metadata } from "next";
import { fetchProducts } from "@/lib/products";
import { ProductsBrowser } from "@/components/products/products-browser";
import { ProductsLoadError } from "@/components/products/products-load-error";

export const metadata: Metadata = {
  title: "Ürünler | VolantX Shopping",
};

export default async function ProductsPage() {
  let products: Awaited<ReturnType<typeof fetchProducts>> = [];
  let loadError = false;
  try {
    products = await fetchProducts();
  } catch {
    loadError = true;
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-12 sm:px-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Ürünler</h1>
        <p className="text-sm text-muted">
          Aradığın ürünü keşfet, detaylarını incele ve sepetine ekle.
        </p>
      </div>

      {loadError ? (
        <ProductsLoadError />
      ) : products.length === 0 ? (
        <p className="text-sm text-muted">Şu anda listelenecek ürün bulunmuyor.</p>
      ) : (
        <ProductsBrowser products={products} />
      )}
    </div>
  );
}
