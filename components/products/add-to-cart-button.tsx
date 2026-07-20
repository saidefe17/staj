"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { apiFetch } from "@/lib/api";

export function AddToCartButton({
  productId,
  className = "",
}: {
  productId: string;
  className?: string;
}) {
  const router = useRouter();
  const { user, getToken } = useAuth();
  const { refreshCart } = useCart();
  const [status, setStatus] = useState<"idle" | "loading" | "added">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    if (!user) {
      router.push("/login");
      return;
    }

    setStatus("loading");
    setError(null);

    try {
      const token = await getToken();
      await apiFetch("/cart/items", {
        method: "POST",
        body: { productId, quantity: 1 },
        token,
      });
      setStatus("added");
      await refreshCart();
    } catch {
      setError("Sepete eklenemedi. Lütfen tekrar deneyin.");
      setStatus("idle");
    }
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleClick}
        disabled={status === "loading" || status === "added"}
        className={`w-full rounded-lg px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
          status === "added"
            ? "bg-surface text-foreground"
            : "bg-primary text-primary-foreground hover:bg-primary-hover"
        }`}
      >
        {status === "loading"
          ? "Ekleniyor..."
          : status === "added"
            ? "Sepete Eklendi"
            : "Sepete Ekle"}
      </button>
      {error ? <p className="mt-1 text-xs text-danger">{error}</p> : null}
    </div>
  );
}
