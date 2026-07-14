"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export function AccountMenu() {
  const router = useRouter();
  const { user, isAdmin, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
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
        <div className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-lg border border-border bg-surface shadow-lg">
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
