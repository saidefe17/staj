import { Body, ConflictException, Controller, Get, Param, Patch } from "@nestjs/common";
import { AdminOnly } from "../common/decorators/admin-only.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { AuthenticatedUser } from "../common/types/authenticated-request";
import { UsersService } from "./users.service";
import { UpdateUserRoleDto } from "./dto/update-user-role.dto";
import { UpdateUserStatusDto } from "./dto/update-user-status.dto";

@Controller("users")
@AdminOnly()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Patch(":uid/role")
  setRole(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("uid") uid: string,
    @Body() dto: UpdateUserRoleDto,
  ) {
    if (uid === currentUser.uid && dto.role !== "admin") {
      throw new ConflictException("Kendi admin yetkinizi kaldıramazsınız.");
    }
    return this.usersService.setRole(uid, dto.role);
  }

  @Patch(":uid/status")
  setStatus(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Param("uid") uid: string,
    @Body() dto: UpdateUserStatusDto,
  ) {
    if (uid === currentUser.uid && dto.disabled) {
      throw new ConflictException("Kendi hesabınızı askıya alamazsınız.");
    }
    return this.usersService.setDisabled(uid, dto.disabled);
  }
}
