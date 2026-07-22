"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  onIdTokenChanged,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  verifyBeforeUpdateEmail,
  type User,
} from "firebase/auth";
import { auth } from "./firebase";
import { apiFetch } from "./api";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  getToken: () => Promise<string | null>;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateDisplayName: (fullName: string) => Promise<void>;
  sendPasswordReset: () => Promise<void>;
  changeEmail: (newEmail: string, currentPassword: string) => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onIdTokenChanged(auth, async (nextUser) => {
      setUser(nextUser);
      if (nextUser) {
        const tokenResult = await nextUser.getIdTokenResult();
        setIsAdmin(tokenResult.claims.admin === true);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });
  }, []);

  const getToken = useCallback(async () => {
    if (!auth.currentUser) return null;
    return auth.currentUser.getIdToken();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  }, []);

  const register = useCallback(async (fullName: string, email: string, password: string) => {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(credential.user, { displayName: fullName });
    const token = await credential.user.getIdToken();
    await apiFetch("/auth/profile", { method: "POST", body: { fullName }, token });
    await credential.user.reload();
    setUser(auth.currentUser ? ({ ...auth.currentUser } as User) : null);
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
  }, []);

  const updateDisplayName = useCallback(async (fullName: string) => {
    if (!auth.currentUser) {
      throw new Error("Oturum bulunamadı.");
    }

    await updateProfile(auth.currentUser, { displayName: fullName });
    const token = await auth.currentUser.getIdToken();
    await apiFetch("/auth/profile", { method: "POST", body: { fullName }, token });
    await auth.currentUser.reload();
    setUser(auth.currentUser ? ({ ...auth.currentUser } as User) : null);
  }, []);

  const sendPasswordReset = useCallback(async () => {
    if (!auth.currentUser?.email) {
      throw new Error("Oturum bulunamadı.");
    }
    await sendPasswordResetEmail(auth, auth.currentUser.email);
  }, []);

  const changeEmail = useCallback(async (newEmail: string, currentPassword: string) => {
    if (!auth.currentUser?.email) {
      throw new Error("Oturum bulunamadı.");
    }
    const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
    await reauthenticateWithCredential(auth.currentUser, credential);
    await verifyBeforeUpdateEmail(auth.currentUser, newEmail, {
      url: `${window.location.origin}/account?emailVerified=1`,
    });
  }, []);

  const refreshUser = useCallback(async () => {
    if (!auth.currentUser) return;
    await auth.currentUser.reload();
    await auth.currentUser.getIdToken(true);
    setUser(auth.currentUser ? ({ ...auth.currentUser } as User) : null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        getToken,
        login,
        register,
        logout,
        updateDisplayName,
        sendPasswordReset,
        changeEmail,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

const FIREBASE_ERROR_MESSAGES: Record<string, string> = {
  "auth/invalid-email": "Lütfen geçerli bir e-posta adresi girin.",
  "auth/user-disabled": "Bu hesap askıya alınmış.",
  "auth/user-not-found": "Bu e-posta ile kayıtlı bir hesap bulunamadı.",
  "auth/wrong-password": "E-posta veya şifre hatalı.",
  "auth/invalid-credential": "E-posta veya şifre hatalı.",
  "auth/email-already-in-use": "Bu e-posta adresi zaten kullanılıyor.",
  "auth/weak-password": "Şifre en az 6 karakter olmalıdır.",
  "auth/too-many-requests": "Çok fazla deneme yapıldı. Lütfen daha sonra tekrar deneyin.",
  "auth/requires-recent-login":
    "Bu işlem için tekrar giriş yapmanız gerekiyor. Lütfen çıkış yapıp tekrar giriş yapın.",
};

export function getFirebaseErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = String((error as { code: unknown }).code);
    return FIREBASE_ERROR_MESSAGES[code] ?? "Bir hata oluştu. Lütfen tekrar deneyin.";
  }
  return "Bir hata oluştu. Lütfen tekrar deneyin.";
}
