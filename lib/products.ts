import { API_URL } from "./api";

export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
};

const REQUEST_TIMEOUT_MS = 15000;
const RETRY_DELAY_MS = 1500;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { cache: "no-store", signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

// Render'daki backend uzun süre boşta kalınca uykuya geçebiliyor; ilk istek bu yüzden
// zaman aşımına uğrayabiliyor veya geçici bir hata dönebiliyor. Bir kez daha deneyerek
// bu tür tekil aksaklıkların kullanıcıya hata olarak yansımasını engelliyoruz.
async function fetchWithRetry(url: string): Promise<Response> {
  try {
    const res = await fetchWithTimeout(url, REQUEST_TIMEOUT_MS);
    if (!res.ok && res.status >= 500) {
      throw new Error(`İstek başarısız oldu (${res.status}).`);
    }
    return res;
  } catch {
    await delay(RETRY_DELAY_MS);
    return fetchWithTimeout(url, REQUEST_TIMEOUT_MS);
  }
}

export async function fetchProducts(): Promise<Product[]> {
  let res: Response;
  try {
    res = await fetchWithRetry(`${API_URL}/products`);
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
    res = await fetchWithRetry(`${API_URL}/products/${id}`);
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
