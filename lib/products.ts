import { API_URL } from "./api";

export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
};

export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch(`${API_URL}/products`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error("Ürünler yüklenirken bir hata oluştu.");
  }
  return res.json();
}

export async function fetchProductById(id: string): Promise<Product | null> {
  const res = await fetch(`${API_URL}/products/${id}`, { cache: "no-store" });
  if (res.status === 404) {
    return null;
  }
  if (!res.ok) {
    throw new Error("Ürün yüklenirken bir hata oluştu.");
  }
  return res.json();
}
