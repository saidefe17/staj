import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { FirebaseAuthGuard } from "../common/guards/firebase-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { AuthenticatedUser } from "../common/types/authenticated-request";
import { AuthService } from "./auth.service";
import { SyncProfileDto } from "./dto/sync-profile.dto";

@Controller("auth")
@UseGuards(FirebaseAuthGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get("me")
  me(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.getOrCreateProfile(user);
  }

  @Post("profile")
  syncProfile(@CurrentUser() user: AuthenticatedUser, @Body() dto: SyncProfileDto) {
    return this.authService.syncProfile(user, dto.fullName);
  }
}
