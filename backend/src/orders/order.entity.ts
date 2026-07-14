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
