import { Injectable, NotFoundException } from "@nestjs/common";
import { FirebaseService } from "../firebase/firebase.service";
import { UserProfile, UserRole } from "./user-profile";

@Injectable()
export class UsersService {
  constructor(private readonly firebase: FirebaseService) {}

  private get collection() {
    return this.firebase.firestore.collection("users");
  }

  async findAll(): Promise<UserProfile[]> {
    const snapshot = await this.collection.get();
    const profiles = snapshot.docs.map((doc) => doc.data() as UserProfile);
    return profiles.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  async setRole(uid: string, role: UserRole): Promise<UserProfile> {
    const ref = this.collection.doc(uid);
    const doc = await ref.get();
    if (!doc.exists) {
      throw new NotFoundException("Kullanıcı bulunamadı.");
    }

    await this.firebase.auth.setCustomUserClaims(uid, { admin: role === "admin" });
    const updatedAt = new Date().toISOString();
    await ref.set({ role, updatedAt }, { merge: true });
    return { ...(doc.data() as UserProfile), role, updatedAt };
  }

  async setDisabled(uid: string, disabled: boolean): Promise<UserProfile> {
    const ref = this.collection.doc(uid);
    const doc = await ref.get();
    if (!doc.exists) {
      throw new NotFoundException("Kullanıcı bulunamadı.");
    }

    await this.firebase.auth.updateUser(uid, { disabled });
    const updatedAt = new Date().toISOString();
    await ref.set({ disabled, updatedAt }, { merge: true });
    return { ...(doc.data() as UserProfile), disabled, updatedAt };
  }
}
