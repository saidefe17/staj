import { Injectable } from "@nestjs/common";
import { FirebaseService } from "../firebase/firebase.service";
import { Order, OrderStatus } from "../orders/order.entity";

export type AdminStats = {
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  totalProducts: number;
  ordersByStatus: Record<OrderStatus, number>;
  topProducts: { productId: string; name: string; quantitySold: number }[];
};

@Injectable()
export class AdminService {
  constructor(private readonly firebase: FirebaseService) {}

  async getStats(): Promise<AdminStats> {
    const [ordersSnapshot, usersSnapshot, productsSnapshot] = await Promise.all([
      this.firebase.firestore.collection("orders").get(),
      this.firebase.firestore.collection("users").get(),
      this.firebase.firestore.collection("products").get(),
    ]);

    const orders = ordersSnapshot.docs.map((doc) => doc.data() as Order);

    const ordersByStatus: Record<OrderStatus, number> = {
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };

    let totalRevenue = 0;
    const quantityByProduct = new Map<string, { name: string; quantitySold: number }>();

    for (const order of orders) {
      ordersByStatus[order.status] += 1;

      if (order.paymentStatus === "paid") {
        totalRevenue += order.total;
      }

      for (const item of order.items) {
        const existing = quantityByProduct.get(item.productId);
        quantityByProduct.set(item.productId, {
          name: item.name,
          quantitySold: (existing?.quantitySold ?? 0) + item.quantity,
        });
      }
    }

    const topProducts = [...quantityByProduct.entries()]
      .map(([productId, value]) => ({ productId, ...value }))
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, 5);

    return {
      totalOrders: orders.length,
      totalRevenue,
      totalUsers: usersSnapshot.size,
      totalProducts: productsSnapshot.size,
      ordersByStatus,
      topProducts,
    };
  }
}
