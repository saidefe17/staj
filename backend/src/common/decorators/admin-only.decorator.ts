import { applyDecorators, UseGuards } from "@nestjs/common";
import { FirebaseAuthGuard } from "../guards/firebase-auth.guard";
import { AdminGuard } from "../guards/admin.guard";

export function AdminOnly() {
  return applyDecorators(UseGuards(FirebaseAuthGuard, AdminGuard));
}
