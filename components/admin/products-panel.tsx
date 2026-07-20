"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { fetchProducts, type Product } from "@/lib/products";
import {
  createProduct,
  deleteProduct,
  fetchCategories,
  updateProduct,
  type Category,
  type ProductInput,
} from "@/lib/admin";

const EMPTY_DRAFT: ProductInput = { name: "", category: "", price: 0, description: "" };

export function ProductsPanel({ filter = "" }: { filter?: string }) {
  const { getToken } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showNewForm, setShowNewForm] = useState(false);
  const [newDraft, setNewDraft] = useState<ProductInput>(EMPTY_DRAFT);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<ProductInput>(EMPTY_DRAFT);

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      setError(null);
      try {
        setProducts(await fetchProducts());
      } catch {
        setError("Ürünler yüklenirken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    }

    async function loadCategories() {
      try {
        setCategories(await fetchCategories());
      } catch {
        // Category list only powers the dropdown; product management still works without it.
      }
    }

    loadProducts();
    loadCategories();
  }, []);

  async function handleCreate() {
    if (!newDraft.name || !newDraft.category || !newDraft.description || newDraft.price <= 0) {
      setError("Lütfen tüm alanları geçerli değerlerle doldurun.");
      return;
    }

    try {
      const token = await getToken();
      if (!token) return;
      const created = await createProduct(token, newDraft);
      setProducts((current) => [...current, created]);
      setNewDraft(EMPTY_DRAFT);
      setShowNewForm(false);
      setError(null);
    } catch {
      setError("Ürün oluşturulamadı.");
    }
  }

  function startEdit(product: Product) {
    setEditingId(product.id);
    setEditDraft({
      name: product.name,
      category: product.category,
      price: product.price,
      description: product.description,
    });
  }

  async function handleUpdate(id: string) {
    try {
      const token = await getToken();
      if (!token) return;
      const updated = await updateProduct(token, id, editDraft);
      setProducts((current) => current.map((p) => (p.id === id ? updated : p)));
      setEditingId(null);
    } catch {
      setError("Ürün güncellenemedi.");
    }
  }

  const filteredProducts = useMemo(() => {
    const query = filter.trim().toLocaleLowerCase("tr");
    if (!query) return products;
    return products.filter(
      (product) =>
        product.name.toLocaleLowerCase("tr").includes(query) ||
        product.category.toLocaleLowerCase("tr").includes(query),
    );
  }, [products, filter]);

  async function handleDelete(id: string) {
    if (!window.confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;

    try {
      const token = await getToken();
      if (!token) return;
      await deleteProduct(token, id);
      setProducts((current) => current.filter((p) => p.id !== id));
    } catch {
      setError("Ürün silinemedi.");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">
          Ürünler ({filteredProducts.length}{filter ? ` / ${products.length}` : ""})
        </h3>
        <button
          type="button"
          onClick={() => setShowNewForm((current) => !current)}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          {showNewForm ? "İptal" : "Yeni Ürün Ekle"}
        </button>
      </div>

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      {showNewForm ? (
        <ProductForm
          draft={newDraft}
          onChange={setNewDraft}
          onSubmit={handleCreate}
          submitLabel="Ürünü Kaydet"
          categories={categories}
        />
      ) : null}

      {loading ? (
        <p className="text-sm text-muted">Yükleniyor...</p>
      ) : filteredProducts.length === 0 ? (
        <p className="text-sm text-muted">Aramanızla eşleşen ürün bulunamadı.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredProducts.map((product) =>
            editingId === product.id ? (
              <div key={product.id} className="rounded-2xl border border-border bg-surface p-4">
                <ProductForm
                  draft={editDraft}
                  onChange={setEditDraft}
                  onSubmit={() => handleUpdate(product.id)}
                  submitLabel="Kaydet"
                  onCancel={() => setEditingId(null)}
                  categories={categories}
                />
              </div>
            ) : (
              <div
                key={product.id}
                className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-4 transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10"
              >
                <div>
                  <p className="text-xs text-muted">{product.category}</p>
                  <p className="font-semibold">{product.name}</p>
                  <p className="text-sm text-muted">
                    {product.price.toLocaleString("tr-TR")} ₺
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(product)}
                    className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-surface-hover"
                  >
                    Düzenle
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(product.id)}
                    className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-danger transition-colors hover:bg-surface-hover"
                  >
                    Sil
                  </button>
                </div>
              </div>
            ),
          )}
        </div>
      )}
    </div>
  );
}

function ProductForm({
  draft,
  onChange,
  onSubmit,
  submitLabel,
  onCancel,
  categories,
}: {
  draft: ProductInput;
  onChange: (draft: ProductInput) => void;
  onSubmit: () => void;
  submitLabel: string;
  onCancel?: () => void;
  categories: Category[];
}) {
  const categoryOptions = useMemo(() => {
    const names = categories.map((category) => category.name);
    if (draft.category && !names.includes(draft.category)) {
      return [draft.category, ...names];
    }
    return names;
  }, [categories, draft.category]);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4">
      <input
        value={draft.name}
        onChange={(event) => onChange({ ...draft, name: event.target.value })}
        placeholder="Ürün adı"
        className="rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary"
      />
      <select
        value={draft.category}
        onChange={(event) => onChange({ ...draft, category: event.target.value })}
        className="rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary"
      >
        <option value="" disabled>
          Kategori seçin
        </option>
        {categoryOptions.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
      {categoryOptions.length === 0 ? (
        <p className="text-xs text-muted">
          Henüz kategori yok. Önce &quot;Kategoriler&quot; sekmesinden bir kategori oluşturun.
        </p>
      ) : null}
      <input
        type="number"
        min={0}
        value={draft.price}
        onChange={(event) => onChange({ ...draft, price: Number(event.target.value) })}
        placeholder="Fiyat"
        className="rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary"
      />
      <textarea
        value={draft.description}
        onChange={(event) => onChange({ ...draft, description: event.target.value })}
        placeholder="Açıklama"
        rows={3}
        className="rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary"
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onSubmit}
          className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          {submitLabel}
        </button>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-surface-hover"
          >
            İptal
          </button>
        ) : null}
      </div>
    </div>
  );
}
