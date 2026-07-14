import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { FirebaseService } from "../../firebase/firebase.service";
import { AuthenticatedRequest } from "../types/authenticated-request";

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(private readonly firebase: FirebaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      throw new UnauthorizedException("Oturum bilgisi bulunamadı.");
    }

    const idToken = authHeader.slice("Bearer ".length);

    try {
      const decoded = await this.firebase.auth.verifyIdToken(idToken);
      request.user = {
        uid: decoded.uid,
        email: decoded.email ?? null,
        admin: decoded.admin === true,
      };
      return true;
    } catch {
      throw new UnauthorizedException("Oturum bilgisi geçersiz veya süresi dolmuş.");
    }
  }
}
