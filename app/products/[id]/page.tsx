import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchProductById } from "@/lib/products";
import { AddToCartButton } from "@/components/products/add-to-cart-button";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await fetchProductById(id);

  return {
    title: product
      ? `${product.name} | VolantX Shopping`
      : "Ürün Bulunamadı | VolantX Shopping",
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await fetchProductById(id);

  if (!product) {
    notFound();
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-12 sm:px-6">
      <Link
        href="/products"
        className="text-sm text-muted transition-colors hover:text-foreground"
      >
        ← Ürünlere dön
      </Link>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-muted">
            {product.category}
          </span>
          <h1 className="text-2xl font-semibold tracking-tight">
            {product.name}
          </h1>
        </div>

        <span className="text-2xl font-semibold">
          {product.price.toLocaleString("tr-TR")} ₺
        </span>

        <p className="text-sm leading-relaxed text-muted">
          {product.description}
        </p>

        <div className="mt-2">
          <AddToCartButton productId={product.id} />
        </div>
      </div>
    </div>
  );
}
