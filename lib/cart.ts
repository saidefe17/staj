import { apiFetch } from "./api";
import type { Product } from "./products";

export type CartLine = {
  product: Product;
  quantity: number;
  subtotal: number;
};

export type CartSummary = {
  items: CartLine[];
  total: number;
};

export function fetchCart(token: string): Promise<CartSummary> {
  return apiFetch<CartSummary>("/cart", { token });
}

export function updateCartItemQuantity(
  token: string,
  productId: string,
  quantity: number,
): Promise<CartSummary> {
  return apiFetch<CartSummary>("/cart/items", {
    method: "POST",
    body: { productId, quantity },
    token,
  });
}

export function removeCartItem(token: string, productId: string): Promise<CartSummary> {
  return apiFetch<CartSummary>(`/cart/items/${productId}`, { method: "DELETE", token });
}
