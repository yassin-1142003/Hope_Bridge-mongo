import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { RegisterSchema, LoginSchema } from "./auth.zod";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/user.decorator";
import { JwtPayload } from "./jwt-payload.interface";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  async register(@Body() body: any) {
    const dto = RegisterSchema.parse(body);
    const result = await this.authService.register(dto);
    return {
      message: "User registered successfully",
      details: result,
    };
  }

  @Post("login")
  async login(@Body() body: any) {
    const dto = LoginSchema.parse(body);
    const result = await this.authService.login(dto);
    return {
      message: "Login successful",
      details: result,
    };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get("me")
  async me(@CurrentUser() user: JwtPayload) {
    return {
      message: "Current user",
      details: user,
    };
  }
}
