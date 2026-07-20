"use client";

import { useState, type FormEvent } from "react";
import { apiFetch } from "@/lib/api";

export type PaymentMethod = "card" | "transfer";

const paymentOptions: { value: PaymentMethod; label: string }[] = [
  { value: "card", label: "Kredi / Banka Kartı" },
  { value: "transfer", label: "Havale / EFT" },
];

function formatCardNumber(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  return (digits.match(/.{1,4}/g) ?? []).join(" ");
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function formatCvv(value: string) {
  return value.replace(/\D/g, "").slice(0, 3);
}

export function PaymentForm({
  total,
  onBack,
  onSuccess,
  getToken,
}: {
  total: number;
  onBack: () => void;
  onSuccess: () => void;
  getToken: () => Promise<string | null>;
}) {
  const [method, setMethod] = useState<PaymentMethod>("card");
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (method === "card") {
      const digitsOnly = cardNumber.replace(/\s/g, "");

      if (!cardName || !digitsOnly || !expiry || !cvv) {
        setError("Lütfen tüm kart bilgilerini doldurun.");
        return;
      }

      if (!/^\d{16}$/.test(digitsOnly)) {
        setError("Kart numarası 16 haneli olmalıdır.");
        return;
      }

      const expiryMatch = /^(\d{2})\/(\d{2})$/.exec(expiry);
      if (!expiryMatch) {
        setError("Son kullanma tarihini AA/YY formatında girin.");
        return;
      }

      const month = Number(expiryMatch[1]);
      const year = Number(expiryMatch[2]);
      const now = new Date();
      const currentYear = now.getFullYear() % 100;
      const currentMonth = now.getMonth() + 1;

      if (month < 1 || month > 12) {
        setError("Geçerli bir ay girin (01-12).");
        return;
      }

      if (year < currentYear || (year === currentYear && month < currentMonth)) {
        setError("Kartınızın son kullanma tarihi geçmiş.");
        return;
      }

      if (!/^\d{3}$/.test(cvv)) {
        setError("CVV 3 haneli olmalıdır.");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const token = await getToken();
      await apiFetch("/orders", { method: "POST", body: { paymentMethod: method }, token });
      onSuccess();
    } catch {
      setError("Ödeme işlemi tamamlanamadı. Lütfen tekrar deneyin.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-12 sm:px-6">
      <button
        type="button"
        onClick={onBack}
        className="self-start text-sm text-muted transition-colors hover:text-foreground"
      >
        ← Sepete dön
      </button>

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Ödeme Yöntemi</h1>
        <p className="text-sm text-muted">
          Ödenecek tutar:{" "}
          <span className="font-semibold text-foreground">
            {total.toLocaleString("tr-TR")} ₺
          </span>
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-5 rounded-2xl border border-border bg-surface p-6"
        noValidate
      >
        <div className="flex flex-col gap-2">
          {paymentOptions.map((option) => (
            <label
              key={option.value}
              className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
                method === option.value
                  ? "border-primary bg-background"
                  : "border-border bg-background hover:bg-surface-hover"
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={option.value}
                checked={method === option.value}
                onChange={() => setMethod(option.value)}
                className="h-4 w-4 accent-primary"
              />
              {option.label}
            </label>
          ))}
        </div>

        {method === "card" ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="cardName" className="text-sm font-medium">
                Kart Üzerindeki İsim
              </label>
              <input
                id="cardName"
                value={cardName}
                onChange={(event) => setCardName(event.target.value)}
                placeholder="Ad Soyad"
                className="rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-primary"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="cardNumber" className="text-sm font-medium">
                Kart Numarası
              </label>
              <input
                id="cardNumber"
                value={cardNumber}
                onChange={(event) => setCardNumber(formatCardNumber(event.target.value))}
                placeholder="0000 0000 0000 0000"
                inputMode="numeric"
                maxLength={19}
                className="rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="expiry" className="text-sm font-medium">
                  Son Kullanma (AA/YY)
                </label>
                <input
                  id="expiry"
                  value={expiry}
                  onChange={(event) => setExpiry(formatExpiry(event.target.value))}
                  placeholder="AA/YY"
                  inputMode="numeric"
                  maxLength={5}
                  className="rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-primary"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="cvv" className="text-sm font-medium">
                  CVV
                </label>
                <input
                  id="cvv"
                  value={cvv}
                  onChange={(event) => setCvv(formatCvv(event.target.value))}
                  placeholder="000"
                  inputMode="numeric"
                  maxLength={3}
                  className="rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-primary"
                />
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted">
            Sipariş onayı sonrası havale/EFT bilgileri e-posta adresine
            gönderilecektir.
          </p>
        )}

        {error ? (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Ödeme yapılıyor..." : "Ödemeyi Tamamla"}
        </button>
      </form>
    </div>
  );
}
