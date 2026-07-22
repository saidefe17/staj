import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
import { createHash, randomInt } from "crypto";
import { FirebaseService } from "../firebase/firebase.service";
import { MailService } from "../mail/mail.service";
import { AuthenticatedUser } from "../common/types/authenticated-request";
import { UserProfile } from "../users/user-profile";

const RESET_CODE_TTL_MS = 10 * 60 * 1000;
const MAX_RESET_ATTEMPTS = 5;
const FIREBASE_CALL_TIMEOUT_MS = 8000;

type PasswordResetRecord = {
  email: string;
  codeHash: string;
  expiresAt: number;
  attempts: number;
  createdAt: number;
};

function describeError(error: unknown): string {
  if (error instanceof Error) {
    const code = (error as { code?: string }).code;
    return code ? `${code}: ${error.message}` : error.message;
  }
  return String(error);
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Zaman aşımı: ${label} (${ms}ms içinde yanıt gelmedi).`));
    }, ms);

    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

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
      userRecord = await withTimeout(
        this.firebase.auth.getUserByEmail(email),
        FIREBASE_CALL_TIMEOUT_MS,
        "Firebase kullanıcı sorgusu",
      );
    } catch (error) {
      const err = error as { code?: string };
      if (err?.code === "auth/user-not-found") {
        // Hesap yoksa sessizce çık; e-posta numaralandırmayı önlemek için hata vermiyoruz.
        return;
      }
      const detail = describeError(error);
      console.error(`[AuthService] Kullanıcı sorgulanamadı (${email}): ${detail}`);
      this.logger.error(`Kullanıcı sorgulanamadı (${email}): ${detail}`);
      throw new InternalServerErrorException(
        "Şu anda işleminiz gerçekleştirilemiyor. Lütfen daha sonra tekrar deneyin.",
      );
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

    try {
      await withTimeout(
        this.mail.sendVerificationCode(email, code),
        FIREBASE_CALL_TIMEOUT_MS,
        "Doğrulama kodu e-postası",
      );
    } catch (error) {
      await this.passwordResetsCollection.doc(userRecord.uid).delete();
      const detail = describeError(error);
      console.error(`[AuthService] Doğrulama kodu e-postası gönderilemedi (${email}): ${detail}`);
      this.logger.error(`Doğrulama kodu e-postası gönderilemedi (${email}): ${detail}`);
      throw new InternalServerErrorException(
        "Doğrulama kodu e-postası gönderilemedi. Lütfen daha sonra tekrar deneyin.",
      );
    }
  }

  async resetPassword(email: string, code: string, newPassword: string): Promise<void> {
    let userRecord;
    try {
      userRecord = await withTimeout(
        this.firebase.auth.getUserByEmail(email),
        FIREBASE_CALL_TIMEOUT_MS,
        "Firebase kullanıcı sorgusu",
      );
    } catch (error) {
      const err = error as { code?: string };
      if (err?.code === "auth/user-not-found") {
        throw new BadRequestException("Kod geçersiz veya süresi dolmuş.");
      }
      const detail = describeError(error);
      console.error(`[AuthService] Kullanıcı sorgulanamadı (${email}): ${detail}`);
      this.logger.error(`Kullanıcı sorgulanamadı (${email}): ${detail}`);
      throw new InternalServerErrorException(
        "Şu anda işleminiz gerçekleştirilemiyor. Lütfen daha sonra tekrar deneyin.",
      );
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

    try {
      await withTimeout(
        this.firebase.auth.updateUser(userRecord.uid, { password: newPassword }),
        FIREBASE_CALL_TIMEOUT_MS,
        "Firebase şifre güncelleme",
      );
    } catch (error) {
      const detail = describeError(error);
      console.error(`[AuthService] Şifre güncellenemedi (${email}): ${detail}`);
      this.logger.error(`Şifre güncellenemedi (${email}): ${detail}`);
      throw new InternalServerErrorException(
        "Şifre güncellenemedi. Lütfen daha sonra tekrar deneyin.",
      );
    }

    await ref.delete();
  }
}
