import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { PasswordResetController } from "./password-reset.controller";
import { AuthService } from "./auth.service";

@Module({
  controllers: [AuthController, PasswordResetController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
