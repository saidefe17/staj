import { Injectable, NotFoundException } from "@nestjs/common";
import { FirebaseService } from "../firebase/firebase.service";
import { Product } from "./product.entity";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";

@Injectable()
export class ProductsService {
  constructor(private readonly firebase: FirebaseService) {}

  private get collection() {
    return this.firebase.firestore.collection("products");
  }

  async findAll(): Promise<Product[]> {
    const snapshot = await this.collection.orderBy("createdAt", "asc").get();
    return snapshot.docs.map((doc) => doc.data() as Product);
  }

  async findOne(id: string): Promise<Product> {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) {
      throw new NotFoundException("Ürün bulunamadı.");
    }
    return doc.data() as Product;
  }

  async create(dto: CreateProductDto): Promise<Product> {
    const ref = this.collection.doc();
    const now = new Date().toISOString();
    const product: Product = {
      id: ref.id,
      ...dto,
      createdAt: now,
      updatedAt: now,
    };
    await ref.set(product);
    return product;
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    const ref = this.collection.doc(id);
    const doc = await ref.get();
    if (!doc.exists) {
      throw new NotFoundException("Ürün bulunamadı.");
    }
    const updated = { ...dto, updatedAt: new Date().toISOString() };
    await ref.set(updated, { merge: true });
    return { ...(doc.data() as Product), ...updated };
  }

  async remove(id: string): Promise<void> {
    const ref = this.collection.doc(id);
    const doc = await ref.get();
    if (!doc.exists) {
      throw new NotFoundException("Ürün bulunamadı.");
    }
    await ref.delete();
  }
}
