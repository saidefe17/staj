import type { Metadata } from "next";
import { AccountSettingsPanel } from "@/components/account/account-settings-panel";

export const metadata: Metadata = {
  title: "Hesabımı Yönet | VolantX Shopping",
};

export default function AccountPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-4 py-12 sm:px-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Hesabımı Yönet</h1>
        <p className="text-sm text-muted">
          Kullanıcı adını, e-postanı ve şifreni buradan yönetebilirsin.
        </p>
      </div>

      <AccountSettingsPanel />
    </div>
  );
}
