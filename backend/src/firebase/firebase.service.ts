import { Injectable, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as admin from "firebase-admin";

@Injectable()
export class FirebaseService implements OnModuleInit {
  private app!: admin.app.App;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const projectId = this.config.getOrThrow<string>("FIREBASE_PROJECT_ID");
    const clientEmail = this.config.getOrThrow<string>("FIREBASE_CLIENT_EMAIL");
    const privateKey = this.config
      .getOrThrow<string>("FIREBASE_PRIVATE_KEY")
      .replace(/\\n/g, "\n");

    this.app =
      admin.apps.length > 0
        ? (admin.apps[0] as admin.app.App)
        : admin.initializeApp({
            credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
          });
  }

  get auth(): admin.auth.Auth {
    return this.app.auth();
  }

  get firestore(): admin.firestore.Firestore {
    return this.app.firestore();
  }
}
