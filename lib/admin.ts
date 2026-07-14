import { apiFetch } from "./api";
import type { Product } from "./products";

export type OrderStatus = "processing" | "shipped" | "delivered" | "cancelled";
export type PaymentMethod = "card" | "transfer";
export type PaymentStatus = "paid" | "pending";

export type OrderItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
};

export type Order = {
  id: string;
  userId: string;
  userEmail: string | null;
  items: OrderItem[];
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
};

export type UserRole = "admin" | "customer";

export type UserProfile = {
  uid: string;
  email: string | null;
  fullName: string;
  role: UserRole;
  disabled: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AdminStats = {
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  totalProducts: number;
  ordersByStatus: Record<OrderStatus, number>;
  topProducts: { productId: string; name: string; quantitySold: number }[];
};

export type ProductInput = {
  name: string;
  category: string;
  price: number;
  description: string;
};

export function fetchAdminStats(token: string): Promise<AdminStats> {
  return apiFetch<AdminStats>("/admin/stats", { token });
}

export function fetchAllOrders(token: string): Promise<Order[]> {
  return apiFetch<Order[]>("/orders", { token });
}

export function updateOrderStatus(token: string, id: string, status: OrderStatus): Promise<Order> {
  return apiFetch<Order>(`/orders/${id}/status`, { method: "PATCH", body: { status }, token });
}

export function fetchAllUsers(token: string): Promise<UserProfile[]> {
  return apiFetch<UserProfile[]>("/users", { token });
}

export function setUserRole(token: string, uid: string, role: UserRole): Promise<UserProfile> {
  return apiFetch<UserProfile>(`/users/${uid}/role`, { method: "PATCH", body: { role }, token });
}

export function setUserDisabled(
  token: string,
  uid: string,
  disabled: boolean,
): Promise<UserProfile> {
  return apiFetch<UserProfile>(`/users/${uid}/status`, {
    method: "PATCH",
    body: { disabled },
    token,
  });
}

export function createProduct(token: string, input: ProductInput): Promise<Product> {
  return apiFetch<Product>("/products", { method: "POST", body: input, token });
}

export function updateProduct(
  token: string,
  id: string,
  input: Partial<ProductInput>,
): Promise<Product> {
  return apiFetch<Product>(`/products/${id}`, { method: "PATCH", body: input, token });
}

export function deleteProduct(token: string, id: string): Promise<void> {
  return apiFetch<void>(`/products/${id}`, { method: "DELETE", token });
}
