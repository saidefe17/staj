import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { FirebaseService } from "../firebase/firebase.service";
import { Category } from "./category.entity";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";

export type CategoryWithCount = Category & { productCount: number };

@Injectable()
export class CategoriesService {
  constructor(private readonly firebase: FirebaseService) {}

  private get collection() {
    return this.firebase.firestore.collection("categories");
  }

  private get productsCollection() {
    return this.firebase.firestore.collection("products");
  }

  private async ensureSeeded(): Promise<void> {
    const existing = await this.collection.limit(1).get();
    if (!existing.empty) return;

    const productsSnapshot = await this.productsCollection.get();
    const names = new Set<string>();
    for (const doc of productsSnapshot.docs) {
      const category = (doc.data() as { category?: string }).category;
      if (category) names.add(category);
    }

    if (names.size === 0) return;

    const now = new Date().toISOString();
    const batch = this.firebase.firestore.batch();
    for (const name of names) {
      const ref = this.collection.doc();
      batch.set(ref, { id: ref.id, name, createdAt: now, updatedAt: now });
    }
    await batch.commit();
  }

  async findAll(): Promise<CategoryWithCount[]> {
    await this.ensureSeeded();

    const snapshot = await this.collection.orderBy("name", "asc").get();
    const categories = snapshot.docs.map((doc) => doc.data() as Category);

    return Promise.all(
      categories.map(async (category) => {
        const countSnapshot = await this.productsCollection
          .where("category", "==", category.name)
          .count()
          .get();
        return { ...category, productCount: countSnapshot.data().count };
      }),
    );
  }

  async create(dto: CreateCategoryDto): Promise<CategoryWithCount> {
    const duplicate = await this.collection.where("name", "==", dto.name).limit(1).get();
    if (!duplicate.empty) {
      throw new ConflictException("Bu isimde bir kategori zaten mevcut.");
    }

    const ref = this.collection.doc();
    const now = new Date().toISOString();
    const category: Category = { id: ref.id, name: dto.name, createdAt: now, updatedAt: now };
    await ref.set(category);
    return { ...category, productCount: 0 };
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<CategoryWithCount> {
    const ref = this.collection.doc(id);
    const doc = await ref.get();
    if (!doc.exists) {
      throw new NotFoundException("Kategori bulunamadı.");
    }

    const current = doc.data() as Category;

    if (dto.name && dto.name !== current.name) {
      const duplicate = await this.collection.where("name", "==", dto.name).limit(1).get();
      if (!duplicate.empty) {
        throw new ConflictException("Bu isimde bir kategori zaten mevcut.");
      }

      const productsSnapshot = await this.productsCollection
        .where("category", "==", current.name)
        .get();

      if (!productsSnapshot.empty) {
        const batch = this.firebase.firestore.batch();
        const now = new Date().toISOString();
        for (const productDoc of productsSnapshot.docs) {
          batch.update(productDoc.ref, { category: dto.name, updatedAt: now });
        }
        await batch.commit();
      }
    }

    const updated = { ...dto, updatedAt: new Date().toISOString() };
    await ref.set(updated, { merge: true });
    const merged = { ...current, ...updated };

    const countSnapshot = await this.productsCollection
      .where("category", "==", merged.name)
      .count()
      .get();

    return { ...merged, productCount: countSnapshot.data().count };
  }

  async remove(id: string): Promise<void> {
    const ref = this.collection.doc(id);
    const doc = await ref.get();
    if (!doc.exists) {
      throw new NotFoundException("Kategori bulunamadı.");
    }

    const category = doc.data() as Category;
    const productsSnapshot = await this.productsCollection
      .where("category", "==", category.name)
      .limit(1)
      .get();

    if (!productsSnapshot.empty) {
      throw new ConflictException(
        "Bu kategoriye bağlı ürünler var. Önce ürünleri başka bir kategoriye taşıyın veya silin.",
      );
    }

    await ref.delete();
  }
}
