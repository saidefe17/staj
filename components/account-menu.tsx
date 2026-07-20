"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export function AccountMenu() {
  const router = useRouter();
  const { user, isAdmin, logout, updateDisplayName } = useAuth();
  const [open, setOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
        setIsEditingName(false);
        setNameError(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  async function handleLogout() {
    setOpen(false);
    await logout();
    router.push("/");
  }

  function handleManageAccount() {
    setOpen(false);
    router.push("/admin");
  }

  function startEditName() {
    setNameDraft(user?.displayName ?? "");
    setNameError(null);
    setIsEditingName(true);
  }

  function cancelEditName() {
    setIsEditingName(false);
    setNameError(null);
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
      setOpen(false);
    } catch {
      setNameError("Kullanıcı adı güncellenemedi. Lütfen tekrar deneyin.");
    } finally {
      setIsSavingName(false);
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex items-center gap-1.5 rounded-full border border-border px-4 py-1.5 text-sm font-medium transition-colors hover:bg-surface"
      >
        <span className="hidden sm:inline">{user.displayName ?? user.email}</span>
        <ChevronDownIcon className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open ? (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-lg border border-border bg-surface shadow-lg">
          {isEditingName ? (
            <form onSubmit={handleSaveName} className="flex flex-col gap-2 p-3">
              <label htmlFor="account-fullname" className="text-xs font-medium text-muted">
                Kullanıcı Adı
              </label>
              <input
                id="account-fullname"
                autoFocus
                value={nameDraft}
                onChange={(event) => setNameDraft(event.target.value)}
                className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-primary"
              />
              {nameError ? <p className="text-xs text-danger">{nameError}</p> : null}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isSavingName}
                  className="flex-1 rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSavingName ? "Kaydediliyor..." : "Kaydet"}
                </button>
                <button
                  type="button"
                  onClick={cancelEditName}
                  className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-surface-hover"
                >
                  İptal
                </button>
              </div>
            </form>
          ) : (
            <>
              <button
                type="button"
                onClick={startEditName}
                className="block w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-surface-hover"
              >
                Kullanıcı Adını Değiştir
              </button>
              {isAdmin ? (
                <button
                  type="button"
                  onClick={handleManageAccount}
                  className="block w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-surface-hover"
                >
                  Hesabı Yönet
                </button>
              ) : null}
              <button
                type="button"
                onClick={handleLogout}
                className="block w-full px-4 py-2.5 text-left text-sm text-danger transition-colors hover:bg-surface-hover"
              >
                Çıkış Yap
              </button>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}

function ChevronDownIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
    </svg>
  );
}
