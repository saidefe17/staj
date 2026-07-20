"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useAuth } from "./auth-context";
import { fetchCart } from "./cart";

type CartContextValue = {
  itemCount: number;
  refreshCart: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

async function loadItemCount(getToken: () => Promise<string | null>): Promise<number> {
  const token = await getToken();
  if (!token) return 0;
  const summary = await fetchCart(token);
  return summary.items.reduce((sum, line) => sum + line.quantity, 0);
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, getToken } = useAuth();
  const [itemCount, setItemCount] = useState(0);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setItemCount(0);
      return;
    }

    try {
      setItemCount(await loadItemCount(getToken));
    } catch {
      // Keep the last known count if the cart can't be reached right now.
    }
  }, [user, getToken]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!user) {
        if (!cancelled) setItemCount(0);
        return;
      }
      try {
        const count = await loadItemCount(getToken);
        if (!cancelled) setItemCount(count);
      } catch {
        // Keep the last known count if the cart can't be reached right now.
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [user, getToken]);

  return (
    <CartContext.Provider value={{ itemCount, refreshCart }}>{children}</CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
