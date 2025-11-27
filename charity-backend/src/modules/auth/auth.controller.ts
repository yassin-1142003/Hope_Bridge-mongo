import { Body, Controller, Get, Patch, Post, Query, UseGuards, HttpStatus, HttpCode } from "@nestjs/common";
import { ApiBearerAuth, ApiTags, ApiResponse } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import {
	RegisterSchema,
	LoginSchema,
	UpdateProfileSchema,
	ChangePasswordSchema,
	ChangeEmailSchema,
} from "./auth.zod";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/user.decorator";
import { JwtPayload } from "./jwt-payload.interface";
import { Throttle } from "../../common/decorators/throttle.decorator";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  @Throttle(5, 60000) // 5 requests per minute
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async register(@Body() body: any) {
    const dto = RegisterSchema.parse(body);
    const result = await this.authService.register(dto);
    return {
      message: "User registered successfully",
      details: result,
    };
  }

  @Post("login")
  @Throttle(10, 60000) // 10 requests per minute
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
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

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch("me")
  async updateProfile(
    @CurrentUser() user: JwtPayload,
    @Body() body: any,
  ) {
    const dto = UpdateProfileSchema.parse(body);
    const updated = await this.authService.updateProfile(user.sub, dto);
    return { message: "Profile updated", details: updated };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch("change-password")
  @Throttle(3, 300000) // 3 requests per 5 minutes
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid current password' })
  async changePassword(
    @CurrentUser() user: JwtPayload,
    @Body() body: any,
  ) {
    const dto = ChangePasswordSchema.parse(body);
    await this.authService.changePassword(user.sub, dto);
    return { message: "Password changed", details: { id: user.sub } };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch("change-email")
  async changeEmail(
    @CurrentUser() user: JwtPayload,
    @Body() body: any,
  ) {
    const dto = ChangeEmailSchema.parse(body);
    const result = await this.authService.changeEmail(user.sub, dto);
    return { message: "Email change requested", details: result };
  }

  @Get("verify-email")
  async verifyEmail(@Query("token") token: string) {
    const result = await this.authService.verifyEmailToken(token);
    return { message: "Email verified", details: result };
  }
}
