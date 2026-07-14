import { Injectable } from "@nestjs/common";
import { FirebaseService } from "../firebase/firebase.service";
import { AuthenticatedUser } from "../common/types/authenticated-request";
import { UserProfile } from "../users/user-profile";

@Injectable()
export class AuthService {
  constructor(private readonly firebase: FirebaseService) {}

  private get usersCollection() {
    return this.firebase.firestore.collection("users");
  }

  async getOrCreateProfile(user: AuthenticatedUser): Promise<UserProfile> {
    const ref = this.usersCollection.doc(user.uid);
    const snapshot = await ref.get();

    if (snapshot.exists) {
      return snapshot.data() as UserProfile;
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
}
