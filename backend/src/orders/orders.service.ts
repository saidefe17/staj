import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { FirebaseService } from "../firebase/firebase.service";
import { CartService } from "../cart/cart.service";
import { AuthenticatedUser } from "../common/types/authenticated-request";
import { Order, OrderStatus, PaymentMethod } from "./order.entity";

@Injectable()
export class OrdersService {
  constructor(
    private readonly firebase: FirebaseService,
    private readonly cartService: CartService,
  ) {}

  private get collection() {
    return this.firebase.firestore.collection("orders");
  }

  async create(user: AuthenticatedUser, paymentMethod: PaymentMethod): Promise<Order> {
    const cart = await this.cartService.getCart(user.uid);

    if (cart.items.length === 0) {
      throw new BadRequestException("Sepetiniz boş, sipariş oluşturulamaz.");
    }

    const ref = this.collection.doc();
    const now = new Date().toISOString();
    const order: Order = {
      id: ref.id,
      userId: user.uid,
      userEmail: user.email,
      items: cart.items.map((line) => ({
        productId: line.product.id,
        name: line.product.name,
        price: line.product.price,
        quantity: line.quantity,
      })),
      total: cart.total,
      paymentMethod,
      paymentStatus: paymentMethod === "card" ? "paid" : "pending",
      status: "processing",
      createdAt: now,
      updatedAt: now,
    };

    await ref.set(order);
    await this.cartService.clear(user.uid);
    return order;
  }

  async findForUser(user: AuthenticatedUser): Promise<Order[]> {
    // Sorting is done in-memory (rather than orderBy in the query) so that
    // listing a single user's orders doesn't require a Firestore composite index.
    const query = user.admin
      ? this.collection
      : this.collection.where("userId", "==", user.uid);

    const snapshot = await query.get();
    const orders = snapshot.docs.map((doc) => doc.data() as Order);
    return orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async findOne(id: string, user: AuthenticatedUser): Promise<Order> {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) {
      throw new NotFoundException("Sipariş bulunamadı.");
    }

    const order = doc.data() as Order;
    if (!user.admin && order.userId !== user.uid) {
      throw new ForbiddenException("Bu siparişe erişim yetkiniz yok.");
    }

    return order;
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    const ref = this.collection.doc(id);
    const doc = await ref.get();
    if (!doc.exists) {
      throw new NotFoundException("Sipariş bulunamadı.");
    }

    const updatedAt = new Date().toISOString();
    await ref.set({ status, updatedAt }, { merge: true });
    return { ...(doc.data() as Order), status, updatedAt };
  }
}
