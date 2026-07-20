"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";
import {
  createCategory,
  deleteCategory,
  fetchCategories,
  renameCategory,
  type Category,
} from "@/lib/admin";

export function CategoriesPanel({ filter = "" }: { filter?: string }) {
  const { getToken } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newName, setNewName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        setCategories(await fetchCategories());
      } catch {
        setError("Kategoriler yüklenirken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const filteredCategories = useMemo(() => {
    const query = filter.trim().toLocaleLowerCase("tr");
    if (!query) return categories;
    return categories.filter((category) => category.name.toLocaleLowerCase("tr").includes(query));
  }, [categories, filter]);

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) return;

    setIsCreating(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) return;
      const created = await createCategory(token, trimmed);
      setCategories((current) =>
        [...current, created].sort((a, b) => a.name.localeCompare(b.name, "tr")),
      );
      setNewName("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Kategori oluşturulamadı.");
    } finally {
      setIsCreating(false);
    }
  }

  function startEdit(category: Category) {
    setEditingId(category.id);
    setEditName(category.name);
    setError(null);
  }

  async function handleRename(id: string) {
    const trimmed = editName.trim();
    if (!trimmed) return;

    setError(null);
    try {
      const token = await getToken();
      if (!token) return;
      const updated = await renameCategory(token, id, trimmed);
      setCategories((current) =>
        current
          .map((category) => (category.id === id ? { ...category, ...updated } : category))
          .sort((a, b) => a.name.localeCompare(b.name, "tr")),
      );
      setEditingId(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Kategori güncellenemedi.");
    }
  }

  async function handleDelete(category: Category) {
    if (!window.confirm(`"${category.name}" kategorisini silmek istediğinize emin misiniz?`)) return;

    setError(null);
    try {
      const token = await getToken();
      if (!token) return;
      await deleteCategory(token, category.id);
      setCategories((current) => current.filter((c) => c.id !== category.id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Kategori silinemedi.");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-sm font-semibold">
        Kategoriler ({filteredCategories.length}
        {filter ? ` / ${categories.length}` : ""})
      </h3>

      <form onSubmit={handleCreate} className="flex gap-2">
        <input
          value={newName}
          onChange={(event) => setNewName(event.target.value)}
          placeholder="Yeni kategori adı"
          className="flex-1 rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-primary"
        />
        <button
          type="submit"
          disabled={isCreating}
          className="shrink-0 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isCreating ? "Ekleniyor..." : "Kategori Ekle"}
        </button>
      </form>

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      {loading ? (
        <p className="text-sm text-muted">Yükleniyor...</p>
      ) : categories.length === 0 ? (
        <p className="text-sm text-muted">Henüz kategori bulunmuyor.</p>
      ) : filteredCategories.length === 0 ? (
        <p className="text-sm text-muted">Aramanızla eşleşen kategori bulunamadı.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredCategories.map((category) =>
            editingId === category.id ? (
              <form
                key={category.id}
                onSubmit={(event) => {
                  event.preventDefault();
                  handleRename(category.id);
                }}
                className="flex items-center gap-2 rounded-2xl border border-border bg-surface p-4"
              >
                <input
                  autoFocus
                  value={editName}
                  onChange={(event) => setEditName(event.target.value)}
                  className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-primary"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
                >
                  Kaydet
                </button>
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-surface-hover"
                >
                  İptal
                </button>
              </form>
            ) : (
              <div
                key={category.id}
                className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-4 transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10"
              >
                <div>
                  <p className="font-semibold">{category.name}</p>
                  <p className="text-sm text-muted">{category.productCount} ürün</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(category)}
                    className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-surface-hover"
                  >
                    Yeniden Adlandır
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(category)}
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
