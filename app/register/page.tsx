import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";
import { Logo } from "@/components/logo";

export const metadata: Metadata = {
  title: "Kayıt Ol | VolantX Shopping",
  description: "VolantX Shopping için yeni bir hesap oluştur.",
};

export default function RegisterPage() {
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
            <h1 className="text-2xl font-semibold">Hesap oluştur</h1>
            <p className="mt-1 text-sm text-muted">
              Alışverişe başlamak için bilgilerini gir.
            </p>
          </div>
        </div>

        <RegisterForm />
      </div>
    </div>
  );
}
