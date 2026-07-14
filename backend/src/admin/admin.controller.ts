import { Controller, Get } from "@nestjs/common";
import { AdminOnly } from "../common/decorators/admin-only.decorator";
import { AdminService } from "./admin.service";

@Controller("admin")
@AdminOnly()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get("stats")
  getStats() {
    return this.adminService.getStats();
  }
}
