import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { Role } from "../../common/enums/role.enum";

@ApiTags("users")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(Role.ADMIN)
  async findAll() {
    const users = await this.usersService.findAll();
    return { message: "Users fetched", details: users };
  }

  @Get(":id")
  @Roles(Role.ADMIN)
  async findOne(@Param("id") id: string) {
    const user = await this.usersService.ensureExists(id);
    return { message: "User fetched", details: user };
  }

  @Patch(":id")
  @Roles(Role.ADMIN)
  async update(
    @Param("id") id: string,
    @Body()
    body: Partial<{ name: string; role: Role }>,
  ) {
    const updated = await this.usersService.updateUser(id, body);
    return { message: "User updated", details: updated };
  }

  @Delete(":id")
  @Roles(Role.ADMIN)
  async remove(@Param("id") id: string) {
    const result = await this.usersService.removeUser(id);
    return { message: "User removed", details: result };
  }

  @Patch(":id/block")
  @Roles(Role.ADMIN)
  async block(@Param("id") id: string) {
    const updated = await this.usersService.setUserActive(id, false);
    return { message: "User blocked", details: updated };
  }

  @Patch(":id/unblock")
  @Roles(Role.ADMIN)
  async unblock(@Param("id") id: string) {
    const updated = await this.usersService.setUserActive(id, true);
    return { message: "User unblocked", details: updated };
  }
}
