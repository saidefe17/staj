"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { apiFetch, ApiError } from "@/lib/api";

type Step = "email" | "code";

export function ForgotPasswordForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");

  const [email, setEmail] = useState("");
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);

  async function handleSendCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSendError(null);

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setSendError("Lütfen geçerli bir e-posta adresi girin.");
      return;
    }

    setIsSendingCode(true);
    try {
      await apiFetch("/auth/forgot-password", { method: "POST", body: { email } });
      setStep("code");
    } catch (err) {
      setSendError(err instanceof ApiError ? err.message : "Kod gönderilemedi. Lütfen tekrar deneyin.");
    } finally {
      setIsSendingCode(false);
    }
  }

  async function handleResetPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResetError(null);

    if (!/^\d{6}$/.test(code)) {
      setResetError("Lütfen e-postana gelen 6 haneli kodu girin.");
      return;
    }

    if (newPassword.length < 6) {
      setResetError("Şifre en az 6 karakter olmalıdır.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setResetError("Şifreler eşleşmiyor.");
      return;
    }

    setIsResetting(true);
    try {
      await apiFetch("/auth/reset-password", {
        method: "POST",
        body: { email, code, newPassword },
      });
      setResetSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      setResetError(err instanceof ApiError ? err.message : "Şifre sıfırlanamadı. Lütfen tekrar deneyin.");
    } finally {
      setIsResetting(false);
    }
  }

  if (step === "email") {
    return (
      <form onSubmit={handleSendCode} className="flex flex-col gap-5" noValidate>
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

        {sendError ? (
          <p role="alert" className="text-sm text-danger">
            {sendError}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSendingCode}
          className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSendingCode ? "Gönderiliyor..." : "Doğrulama Kodu Gönder"}
        </button>

        <p className="text-center text-sm text-muted">
          <Link href="/login" className="font-medium text-primary transition-colors hover:text-primary-hover">
            Girişe dön
          </Link>
        </p>
      </form>
    );
  }

  return (
    <form onSubmit={handleResetPassword} className="flex flex-col gap-5" noValidate>
      <p className="text-sm text-muted">
        <span className="font-medium text-foreground">{email}</span> adresine bir doğrulama kodu
        gönderdik. Kodu ve yeni şifreni aşağıya gir.
      </p>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="reset-code" className="text-sm font-medium">
          Doğrulama Kodu
        </label>
        <input
          id="reset-code"
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          value={code}
          onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
          placeholder="123456"
          className="rounded-lg border border-border bg-background px-3.5 py-2.5 text-center text-lg tracking-[0.5em] outline-none transition-colors focus:border-primary"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="reset-new-password" className="text-sm font-medium">
          Yeni Şifre
        </label>
        <input
          id="reset-new-password"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          placeholder="Yeni şifreni gir"
          className="rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-primary"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="reset-confirm-password" className="text-sm font-medium">
          Yeni Şifre (Tekrar)
        </label>
        <input
          id="reset-confirm-password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          placeholder="Yeni şifreni tekrar gir"
          className="rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-primary"
        />
      </div>

      {resetError ? (
        <p role="alert" className="text-sm text-danger">
          {resetError}
        </p>
      ) : null}
      {resetSuccess ? (
        <p className="text-sm text-primary">Şifren güncellendi. Girişe yönlendiriliyorsun...</p>
      ) : null}

      <button
        type="submit"
        disabled={isResetting || resetSuccess}
        className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isResetting ? "Güncelleniyor..." : "Şifreyi Sıfırla"}
      </button>

      <button
        type="button"
        onClick={() => {
          setStep("email");
          setCode("");
          setResetError(null);
        }}
        className="text-center text-sm text-muted transition-colors hover:text-foreground"
      >
        Farklı bir e-posta dene veya kodu tekrar gönder
      </button>
    </form>
  );
}
