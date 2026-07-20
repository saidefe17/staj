"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { fetchAllOrders, updateOrderStatus, type Order, type OrderStatus } from "@/lib/admin";

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "processing", label: "Hazırlanıyor" },
  { value: "shipped", label: "Kargoda" },
  { value: "delivered", label: "Teslim Edildi" },
  { value: "cancelled", label: "İptal Edildi" },
];

const PAYMENT_LABELS: Record<Order["paymentMethod"], string> = {
  card: "Kredi/Banka Kartı",
  transfer: "Havale/EFT",
};

export function OrdersPanel({ filter = "" }: { filter?: string }) {
  const { getToken } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const token = await getToken();
        if (!token) return;
        setOrders(await fetchAllOrders(token));
      } catch {
        setError("Siparişler yüklenirken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    }

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleStatusChange(id: string, status: OrderStatus) {
    try {
      const token = await getToken();
      if (!token) return;
      const updated = await updateOrderStatus(token, id, status);
      setOrders((current) => current.map((order) => (order.id === id ? updated : order)));
    } catch {
      setError("Sipariş durumu güncellenemedi.");
    }
  }

  const filteredOrders = useMemo(() => {
    const query = filter.trim().toLocaleLowerCase("tr");
    if (!query) return orders;
    return orders.filter(
      (order) =>
        (order.userEmail ?? order.userId).toLocaleLowerCase("tr").includes(query) ||
        order.id.toLocaleLowerCase("tr").includes(query) ||
        order.status.toLocaleLowerCase("tr").includes(query),
    );
  }, [orders, filter]);

  if (loading) return <p className="text-sm text-muted">Yükleniyor...</p>;
  if (error) return <p className="text-sm text-danger">{error}</p>;
  if (orders.length === 0) return <p className="text-sm text-muted">Henüz sipariş bulunmuyor.</p>;
  if (filteredOrders.length === 0)
    return <p className="text-sm text-muted">Aramanızla eşleşen sipariş bulunamadı.</p>;

  return (
    <div className="flex flex-col gap-3">
      {filteredOrders.map((order) => (
        <div
          key={order.id}
          className="rounded-2xl border border-border bg-surface p-4 transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold">{order.userEmail ?? order.userId}</p>
              <p className="text-xs text-muted">
                {new Date(order.createdAt).toLocaleString("tr-TR")} ·{" "}
                {PAYMENT_LABELS[order.paymentMethod]} ·{" "}
                {order.paymentStatus === "paid" ? "Ödendi" : "Ödeme Bekliyor"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold">
                {order.total.toLocaleString("tr-TR")} ₺
              </span>
              <select
                value={order.status}
                onChange={(event) =>
                  handleStatusChange(order.id, event.target.value as OrderStatus)
                }
                className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm outline-none focus:border-primary"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <ul className="mt-3 flex flex-col gap-1 border-t border-border pt-3 text-sm text-muted">
            {order.items.map((item) => (
              <li key={item.productId} className="flex items-center justify-between">
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span>{(item.price * item.quantity).toLocaleString("tr-TR")} ₺</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
