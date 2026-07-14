"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { fetchCart, removeCartItem, updateCartItemQuantity, type CartSummary } from "@/lib/cart";
import { CartItemRow } from "./cart-item-row";
import { PaymentForm } from "./payment-form";
import { PaymentSuccess } from "./payment-success";

type Step = "cart" | "payment" | "success";

export function CartView() {
  const { user, loading: authLoading, getToken } = useAuth();
  const [cart, setCart] = useState<CartSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("cart");

  useEffect(() => {
    if (authLoading || !user) return;

    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const token = await getToken();
        if (!token) return;
        const summary = await fetchCart(token);
        if (!cancelled) setCart(summary);
      } catch {
        if (!cancelled) setError("Sepet yüklenirken bir hata oluştu.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading, getToken]);

  async function updateQuantity(productId: string, quantity: number) {
    const token = await getToken();
    if (!token) return;

    try {
      const summary =
        quantity <= 0
          ? await removeCartItem(token, productId)
          : await updateCartItemQuantity(token, productId, quantity);
      setCart(summary);
    } catch {
      setError("Sepet güncellenirken bir hata oluştu.");
    }
  }

  async function removeItem(productId: string) {
    const token = await getToken();
    if (!token) return;

    try {
      const summary = await removeCartItem(token, productId);
      setCart(summary);
    } catch {
      setError("Ürün kaldırılırken bir hata oluştu.");
    }
  }

  if (!authLoading && !user) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
        <p className="text-sm text-muted">Sepetini görebilmek için giriş yapmalısın.</p>
        <Link
          href="/login"
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          Giriş Yap
        </Link>
      </div>
    );
  }

  if (authLoading || isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-1 items-center justify-center px-4 py-16">
        <p className="text-sm text-muted">Yükleniyor...</p>
      </div>
    );
  }

  if (step === "success") {
    return <PaymentSuccess />;
  }

  if (step === "payment" && cart) {
    return (
      <PaymentForm
        total={cart.total}
        onBack={() => setStep("cart")}
        onSuccess={() => setStep("success")}
        getToken={getToken}
      />
    );
  }

  const lines = cart?.items ?? [];
  const total = cart?.total ?? 0;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-12 sm:px-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Sepetim</h1>
        <p className="text-sm text-muted">
          Sepetindeki ürünleri gözden geçir ve ödemeye geç.
        </p>
      </div>

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      {lines.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-surface p-10 text-center">
          <p className="text-sm text-muted">Sepetin şu anda boş.</p>
          <Link
            href="/products"
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            Ürünlere Dön
          </Link>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {lines.map((line) => (
              <CartItemRow
                key={line.product.id}
                product={line.product}
                quantity={line.quantity}
                onQuantityChange={(quantity) => updateQuantity(line.product.id, quantity)}
                onRemove={() => removeItem(line.product.id)}
              />
            ))}
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5">
            <div className="flex items-center justify-between text-sm text-muted">
              <span>Ara Toplam</span>
              <span>{total.toLocaleString("tr-TR")} ₺</span>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-3 text-base font-semibold">
              <span>Toplam</span>
              <span>{total.toLocaleString("tr-TR")} ₺</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/products"
              className="flex-1 rounded-lg border border-border px-4 py-2.5 text-center text-sm font-medium transition-colors hover:bg-surface-hover"
            >
              Ürünlere Dön
            </Link>
            <button
              type="button"
              onClick={() => setStep("payment")}
              className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
            >
              Sepeti Tamamla
            </button>
          </div>
        </>
      )}
    </div>
  );
}
