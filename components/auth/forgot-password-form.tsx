"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useAuth, getFirebaseErrorMessage } from "@/lib/auth-context";

export function ForgotPasswordForm() {
  const { sendPasswordResetToEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Lütfen geçerli bir e-posta adresi girin.");
      return;
    }

    setIsSending(true);
    try {
      await sendPasswordResetToEmail(email);
      setSuccess(true);
    } catch (err) {
      setError(getFirebaseErrorMessage(err));
    } finally {
      setIsSending(false);
    }
  }

  if (success) {
    return (
      <div className="flex flex-col gap-5">
        <p className="text-sm text-primary">
          <span className="font-medium text-foreground">{email}</span> adresine bir şifre
          sıfırlama bağlantısı gönderdik. Gelen kutunu (ve spam klasörünü) kontrol et.
        </p>

        <Link
          href="/login"
          className="rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          Girişe dön
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="forgot-email" className="text-sm font-medium">
          E-posta
        </label>
        <input
          id="forgot-email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Mail adresinizi giriniz..."
          className="rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-primary"
        />
      </div>

      {error ? (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSending}
        className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSending ? "Gönderiliyor..." : "Şifre Sıfırlama Bağlantısı Gönder"}
      </button>

      <p className="text-center text-sm text-muted">
        <Link href="/login" className="font-medium text-primary transition-colors hover:text-primary-hover">
          Girişe dön
        </Link>
      </p>
    </form>
  );
}
