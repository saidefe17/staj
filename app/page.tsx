import Link from "next/link";
import { fetchProducts } from "@/lib/products";
import { ProductCard } from "@/components/products/product-card";
import { HomeHero } from "@/components/home-hero";
import { HomeFeatures } from "@/components/home-features";

export default async function Home() {
  let products: Awaited<ReturnType<typeof fetchProducts>> = [];
  let loadError = false;
  try {
    products = await fetchProducts();
  } catch {
    loadError = true;
  }
  const featuredProducts = products.slice(0, 3);

  return (
    <div className="flex flex-1 flex-col gap-16 pb-20">
      <HomeHero />

      <HomeFeatures />

      {loadError ? (
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <p className="rounded-2xl border border-border bg-surface p-4 text-sm text-muted">
            Ürünler şu anda yüklenemiyor. Lütfen daha sonra tekrar deneyin.
          </p>
        </div>
      ) : null}

      {featuredProducts.length > 0 ? (
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 sm:px-6">
          <div className="flex items-end justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-semibold tracking-tight">Öne Çıkan Ürünler</h2>
              <p className="text-sm text-muted">Kataloğumuzdan bazı örnekler.</p>
            </div>
            <Link
              href="/products"
              className="shrink-0 text-sm font-medium text-primary transition-colors hover:text-primary-hover"
            >
              Tümünü Gör →
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
