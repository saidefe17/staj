import { Injectable } from "@nestjs/common";
import { FirebaseService } from "../firebase/firebase.service";
import { ProductsService } from "../products/products.service";

export type CartItem = {
  productId: string;
  quantity: number;
};

export type CartLine = {
  product: Awaited<ReturnType<ProductsService["findOne"]>>;
  quantity: number;
  subtotal: number;
};

export type CartSummary = {
  items: CartLine[];
  total: number;
};

@Injectable()
export class CartService {
  constructor(
    private readonly firebase: FirebaseService,
    private readonly productsService: ProductsService,
  ) {}

  private cartRef(uid: string) {
    return this.firebase.firestore.collection("carts").doc(uid);
  }

  private async getRawItems(uid: string): Promise<CartItem[]> {
    const doc = await this.cartRef(uid).get();
    if (!doc.exists) {
      return [];
    }
    return (doc.data()?.items as CartItem[] | undefined) ?? [];
  }

  async getCart(uid: string): Promise<CartSummary> {
    const items = await this.getRawItems(uid);
    const allProducts = await this.productsService.findAll();
    const productMap = new Map(allProducts.map((product) => [product.id, product]));

    const lines: CartLine[] = [];
    let hasStaleItems = false;

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) {
        hasStaleItems = true;
        continue;
      }
      lines.push({ product, quantity: item.quantity, subtotal: product.price * item.quantity });
    }

    if (hasStaleItems) {
      await this.cartRef(uid).set(
        { items: lines.map((line) => ({ productId: line.product.id, quantity: line.quantity })) },
        { merge: true },
      );
    }

    const total = lines.reduce((sum, line) => sum + line.subtotal, 0);
    return { items: lines, total };
  }

  async upsertItem(uid: string, productId: string, quantity: number): Promise<CartSummary> {
    await this.productsService.findOne(productId);

    const items = await this.getRawItems(uid);
    const existing = items.find((item) => item.productId === productId);

    const nextItems = existing
      ? items.map((item) => (item.productId === productId ? { ...item, quantity } : item))
      : [...items, { productId, quantity }];

    await this.cartRef(uid).set({ items: nextItems }, { merge: true });
    return this.getCart(uid);
  }

  async removeItem(uid: string, productId: string): Promise<CartSummary> {
    const items = await this.getRawItems(uid);
    const nextItems = items.filter((item) => item.productId !== productId);
    await this.cartRef(uid).set({ items: nextItems }, { merge: true });
    return this.getCart(uid);
  }

  async clear(uid: string): Promise<void> {
    await this.cartRef(uid).set({ items: [] }, { merge: true });
  }
}
