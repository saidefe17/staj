import { API_URL } from "./api";

export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
};

export async function fetchProducts(): Promise<Product[]> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/products`, { cache: "no-store" });
  } catch {
    throw new Error("Sunucuya bağlanılamadı. Lütfen daha sonra tekrar deneyin.");
  }
  if (!res.ok) {
    throw new Error("Ürünler yüklenirken bir hata oluştu.");
  }
  return res.json();
}

export async function fetchProductById(id: string): Promise<Product | null> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/products/${id}`, { cache: "no-store" });
  } catch {
    throw new Error("Sunucuya bağlanılamadı. Lütfen daha sonra tekrar deneyin.");
  }
  if (res.status === 404) {
    return null;
  }
  if (!res.ok) {
    throw new Error("Ürün yüklenirken bir hata oluştu.");
  }
  return res.json();
}
