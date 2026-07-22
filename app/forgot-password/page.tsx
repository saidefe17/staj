import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { Logo } from "@/components/logo";

export const metadata: Metadata = {
  title: "Şifremi Unuttum | VolantX Shopping",
  description: "VolantX Shopping hesabının şifresini sıfırla.",
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-8 shadow-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <Logo
            alt="VolantX Shopping"
            width={3242}
            height={544}
            sizes="240px"
            className="h-12 w-auto"
          />
          <div>
            <h1 className="text-2xl font-semibold">Şifremi unuttum</h1>
            <p className="mt-1 text-sm text-muted">
              E-posta adresini gir, sana bir şifre sıfırlama bağlantısı gönderelim.
            </p>
          </div>
        </div>

        <ForgotPasswordForm />
      </div>
    </div>
  );
}
