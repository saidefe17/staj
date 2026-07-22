import { BadRequestException, Injectable } from "@nestjs/common";
import { createHash, randomInt } from "crypto";
import { FirebaseService } from "../firebase/firebase.service";
import { MailService } from "../mail/mail.service";
import { AuthenticatedUser } from "../common/types/authenticated-request";
import { UserProfile } from "../users/user-profile";

const RESET_CODE_TTL_MS = 10 * 60 * 1000;
const MAX_RESET_ATTEMPTS = 5;

type PasswordResetRecord = {
  email: string;
  codeHash: string;
  expiresAt: number;
  attempts: number;
  createdAt: number;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly firebase: FirebaseService,
    private readonly mail: MailService,
  ) {}

  private get usersCollection() {
    return this.firebase.firestore.collection("users");
  }

  private get passwordResetsCollection() {
    return this.firebase.firestore.collection("passwordResets");
  }

  private hashCode(code: string): string {
    return createHash("sha256").update(code).digest("hex");
  }

  async getOrCreateProfile(user: AuthenticatedUser): Promise<UserProfile> {
    const ref = this.usersCollection.doc(user.uid);
    const snapshot = await ref.get();

    if (snapshot.exists) {
      const existing = snapshot.data() as UserProfile;
      if (user.email && existing.email !== user.email) {
        const updated = { email: user.email, updatedAt: new Date().toISOString() };
        await ref.set(updated, { merge: true });
        return { ...existing, ...updated };
      }
      return existing;
    }

    const now = new Date().toISOString();
    const profile: UserProfile = {
      uid: user.uid,
      email: user.email,
      fullName: user.email?.split("@")[0] ?? "Kullanıcı",
      role: user.admin ? "admin" : "customer",
      disabled: false,
      createdAt: now,
      updatedAt: now,
    };

    await ref.set(profile);
    return profile;
  }

  async syncProfile(user: AuthenticatedUser, fullName: string): Promise<UserProfile> {
    const ref = this.usersCollection.doc(user.uid);
    const snapshot = await ref.get();
    const now = new Date().toISOString();

    if (snapshot.exists) {
      const updated: Partial<UserProfile> = { fullName, updatedAt: now };
      await ref.set(updated, { merge: true });
      return { ...(snapshot.data() as UserProfile), ...updated };
    }

    const profile: UserProfile = {
      uid: user.uid,
      email: user.email,
      fullName,
      role: user.admin ? "admin" : "customer",
      disabled: false,
      createdAt: now,
      updatedAt: now,
    };

    await ref.set(profile);
    return profile;
  }

  async requestPasswordReset(email: string): Promise<void> {
    let userRecord;
    try {
      userRecord = await this.firebase.auth.getUserByEmail(email);
    } catch {
      // Hesap yoksa sessizce çık; e-posta numaralandırmayı önlemek için hata vermiyoruz.
      return;
    }

    const code = randomInt(0, 1_000_000).toString().padStart(6, "0");
    const record: PasswordResetRecord = {
      email,
      codeHash: this.hashCode(code),
      expiresAt: Date.now() + RESET_CODE_TTL_MS,
      attempts: 0,
      createdAt: Date.now(),
    };

    await this.passwordResetsCollection.doc(userRecord.uid).set(record);
    await this.mail.sendVerificationCode(email, code);
  }

  async resetPassword(email: string, code: string, newPassword: string): Promise<void> {
    let userRecord;
    try {
      userRecord = await this.firebase.auth.getUserByEmail(email);
    } catch {
      throw new BadRequestException("Kod geçersiz veya süresi dolmuş.");
    }

    const ref = this.passwordResetsCollection.doc(userRecord.uid);
    const snapshot = await ref.get();

    if (!snapshot.exists) {
      throw new BadRequestException("Kod geçersiz veya süresi dolmuş.");
    }

    const record = snapshot.data() as PasswordResetRecord;

    if (Date.now() > record.expiresAt) {
      await ref.delete();
      throw new BadRequestException("Kod geçersiz veya süresi dolmuş.");
    }

    if (record.attempts >= MAX_RESET_ATTEMPTS) {
      await ref.delete();
      throw new BadRequestException("Çok fazla hatalı deneme yapıldı. Yeni bir kod isteyin.");
    }

    if (record.codeHash !== this.hashCode(code)) {
      await ref.set({ attempts: record.attempts + 1 }, { merge: true });
      throw new BadRequestException("Kod geçersiz veya süresi dolmuş.");
    }

    await this.firebase.auth.updateUser(userRecord.uid, { password: newPassword });
    await ref.delete();
  }
}
