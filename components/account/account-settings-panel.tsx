"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, getFirebaseErrorMessage } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";

export function AccountSettingsPanel() {
  const router = useRouter();
  const { user, loading, updateDisplayName, sendPasswordReset, changeEmail, refreshUser, getToken } =
    useAuth();

  const [emailVerifiedNotice, setEmailVerifiedNotice] = useState(false);
  const hasHandledEmailVerification = useRef(false);

  useEffect(() => {
    if (loading || !user || hasHandledEmailVerification.current) return;
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    if (params.get("emailVerified") !== "1") return;

    hasHandledEmailVerification.current = true;

    (async () => {
      try {
        await refreshUser();
        const token = await getToken();
        if (token) {
          await apiFetch("/auth/me", { token });
        }
        setEmailVerifiedNotice(true);
      } catch {
        // Yeni e-posta bir sonraki girişte de görünür olacak; sessizce geç.
      } finally {
        router.replace("/account");
      }
    })();
  }, [loading, user, refreshUser, getToken, router]);

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [nameSuccess, setNameSuccess] = useState(false);

  const [isSendingReset, setIsSendingReset] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);

  const [newEmail, setNewEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState(false);

  if (loading) {
    return <p className="text-sm text-muted">Yükleniyor...</p>;
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-surface p-10 text-center">
        <p className="text-sm text-muted">Hesabını yönetmek için giriş yapmalısın.</p>
        <Link
          href="/login"
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          Giriş Yap
        </Link>
      </div>
    );
  }

  function startEditName() {
    setNameDraft(user?.displayName ?? "");
    setNameError(null);
    setNameSuccess(false);
    setIsEditingName(true);
  }

  async function handleSaveName(event: FormEvent) {
    event.preventDefault();
    const trimmed = nameDraft.trim();
    if (!trimmed) {
      setNameError("Kullanıcı adı boş olamaz.");
      return;
    }

    setIsSavingName(true);
    setNameError(null);
    try {
      await updateDisplayName(trimmed);
      setIsEditingName(false);
      setNameSuccess(true);
    } catch {
      setNameError("Kullanıcı adı güncellenemedi. Lütfen tekrar deneyin.");
    } finally {
      setIsSavingName(false);
    }
  }

  async function handleSendReset() {
    setIsSendingReset(true);
    setResetError(null);
    setResetSuccess(false);
    try {
      await sendPasswordReset();
      setResetSuccess(true);
    } catch (err) {
      setResetError(getFirebaseErrorMessage(err));
    } finally {
      setIsSendingReset(false);
    }
  }

  async function handleChangeEmail(event: FormEvent) {
    event.preventDefault();
    setEmailError(null);
    setEmailSuccess(false);

    if (!newEmail || !emailPassword) {
      setEmailError("Lütfen yeni e-posta adresini ve mevcut şifreni gir.");
      return;
    }

    setIsChangingEmail(true);
    try {
      await changeEmail(newEmail, emailPassword);
      setEmailSuccess(true);
      setNewEmail("");
      setEmailPassword("");
    } catch (err) {
      setEmailError(getFirebaseErrorMessage(err));
    } finally {
      setIsChangingEmail(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6">
        <div>
          <h2 className="text-lg font-semibold">Kullanıcı Adı</h2>
          <p className="text-sm text-muted">Görünen adını güncelle.</p>
        </div>

        {isEditingName ? (
          <form onSubmit={handleSaveName} className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex flex-1 flex-col gap-1.5">
              <label htmlFor="account-fullname" className="text-sm font-medium">
                Kullanıcı Adı
              </label>
              <input
                id="account-fullname"
                autoFocus
                value={nameDraft}
                onChange={(event) => setNameDraft(event.target.value)}
                className="rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isSavingName}
                className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSavingName ? "Kaydediliyor..." : "Kaydet"}
              </button>
              <button
                type="button"
                onClick={() => setIsEditingName(false)}
                className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-surface-hover"
              >
                İptal
              </button>
            </div>
          </form>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm">{user.displayName ?? "İsimsiz Kullanıcı"}</p>
            <button
              type="button"
              onClick={startEditName}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-surface-hover"
            >
              Değiştir
            </button>
          </div>
        )}

        {nameError ? <p className="text-sm text-danger">{nameError}</p> : null}
        {nameSuccess && !isEditingName ? (
          <p className="text-sm text-primary">Kullanıcı adın güncellendi.</p>
        ) : null}
      </section>

      <section className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6">
        <div>
          <h2 className="text-lg font-semibold">E-posta Adresi</h2>
          <p className="text-sm text-muted">
            Mevcut adresin: <span className="font-medium text-foreground">{user.email}</span>
          </p>
        </div>

        {emailVerifiedNotice ? (
          <p className="text-sm text-primary">E-posta adresin doğrulandı ve güncellendi.</p>
        ) : null}

        <form onSubmit={handleChangeEmail} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="new-email" className="text-sm font-medium">
              Yeni E-posta
            </label>
            <input
              id="new-email"
              type="email"
              value={newEmail}
              onChange={(event) => setNewEmail(event.target.value)}
              placeholder="yeni@eposta.com"
              className="rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email-current-password" className="text-sm font-medium">
              Mevcut Şifre
            </label>
            <input
              id="email-current-password"
              type="password"
              value={emailPassword}
              onChange={(event) => setEmailPassword(event.target.value)}
              placeholder="Doğrulamak için şifreni gir"
              className="rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary"
            />
          </div>

          {emailError ? <p className="text-sm text-danger">{emailError}</p> : null}
          {emailSuccess ? (
            <p className="text-sm text-primary">
              Yeni e-posta adresine bir doğrulama bağlantısı gönderildi. Onayladıktan sonra
              e-postan güncellenecek.
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isChangingEmail}
            className="self-start rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isChangingEmail ? "Gönderiliyor..." : "E-postayı Güncelle"}
          </button>
        </form>
      </section>

      <section className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6">
        <div>
          <h2 className="text-lg font-semibold">Şifre</h2>
          <p className="text-sm text-muted">
            Şifreni sıfırlamak için e-posta adresine bir bağlantı gönderebiliriz.
          </p>
        </div>

        {resetError ? <p className="text-sm text-danger">{resetError}</p> : null}
        {resetSuccess ? (
          <p className="text-sm text-primary">
            {user.email} adresine bir şifre sıfırlama bağlantısı gönderildi.
          </p>
        ) : null}

        <button
          type="button"
          onClick={handleSendReset}
          disabled={isSendingReset}
          className="self-start rounded-lg border border-border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSendingReset ? "Gönderiliyor..." : "Şifre Sıfırlama Bağlantısı Gönder"}
        </button>
      </section>
    </div>
  );
}
