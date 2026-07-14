"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  fetchAllUsers,
  setUserDisabled,
  setUserRole,
  type UserProfile,
  type UserRole,
} from "@/lib/admin";

export function UsersPanel() {
  const { user: currentUser, getToken } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const token = await getToken();
        if (!token) return;
        setUsers(await fetchAllUsers(token));
      } catch {
        setError("Kullanıcılar yüklenirken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    }

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleRoleChange(uid: string, role: UserRole) {
    setError(null);
    try {
      const token = await getToken();
      if (!token) return;
      const updated = await setUserRole(token, uid, role);
      setUsers((current) => current.map((u) => (u.uid === uid ? updated : u)));
    } catch {
      setError("Kullanıcı rolü güncellenemedi.");
    }
  }

  async function handleDisabledToggle(uid: string, disabled: boolean) {
    setError(null);
    try {
      const token = await getToken();
      if (!token) return;
      const updated = await setUserDisabled(token, uid, disabled);
      setUsers((current) => current.map((u) => (u.uid === uid ? updated : u)));
    } catch {
      setError("Kullanıcı durumu güncellenemedi.");
    }
  }

  if (loading) return <p className="text-sm text-muted">Yükleniyor...</p>;
  if (users.length === 0) return <p className="text-sm text-muted">Henüz kullanıcı bulunmuyor.</p>;

  return (
    <div className="flex flex-col gap-3">
      {error ? <p className="text-sm text-danger">{error}</p> : null}

      {users.map((user) => {
        const isSelf = user.uid === currentUser?.uid;
        return (
          <div
            key={user.uid}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4 transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10"
          >
            <div>
              <p className="font-semibold">{user.fullName}</p>
              <p className="text-sm text-muted">{user.email}</p>
              {user.disabled ? (
                <span className="text-xs text-danger">Hesap askıya alındı</span>
              ) : null}
            </div>

            <div className="flex items-center gap-2">
              <select
                value={user.role}
                disabled={isSelf}
                onChange={(event) => handleRoleChange(user.uid, event.target.value as UserRole)}
                className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm outline-none focus:border-primary disabled:opacity-50"
              >
                <option value="customer">Müşteri</option>
                <option value="admin">Admin</option>
              </select>

              <button
                type="button"
                disabled={isSelf}
                onClick={() => handleDisabledToggle(user.uid, !user.disabled)}
                className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                {user.disabled ? "Aktive Et" : "Askıya Al"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
