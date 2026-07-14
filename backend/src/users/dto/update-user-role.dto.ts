import { IsIn } from "class-validator";
import { UserRole } from "../user-profile";

const ROLES: UserRole[] = ["admin", "customer"];

export class UpdateUserRoleDto {
  @IsIn(ROLES)
  role!: UserRole;
}
