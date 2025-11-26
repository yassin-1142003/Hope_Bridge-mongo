import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcrypt";
import { UsersService } from "../users/users.service";
import { Role } from "../../common/enums/role.enum";
import {
  RegisterDto,
  LoginDto,
  UpdateProfileDto,
  ChangePasswordDto,
  ChangeEmailDto,
} from "./auth.zod";
import { JwtPayload } from "./jwt-payload.interface";
import { EmailService } from "../email/email.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly emailService: EmailService,
  ) {}

  private toAuthUser(user: any) {
    return {
      id: user._id?.toString?.() ?? user.id,
      name: user.name,
      email: user.email,
      role: user.role as Role,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
    };
  }

  private async signTokens(user: any) {
    const payload: JwtPayload = {
      sub: user._id?.toString?.() ?? user.id,
      email: user.email,
      role: user.role as Role,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.config.get<string>("JWT_REFRESH_SECRET"),
      expiresIn: this.config.get<string>("JWT_REFRESH_EXPIRES_IN") ?? "7d",
    });

    return { accessToken, refreshToken };
  }

  private async signEmailVerificationToken(user: any): Promise<string> {
    const payload = {
      sub: user._id?.toString?.() ?? user.id,
      email: user.email,
      type: "verify-email" as const,
    };

    return this.jwtService.signAsync(payload, {
      secret: this.config.get<string>("JWT_ACCESS_SECRET"),
      expiresIn:
        this.config.get<string>("JWT_EMAIL_VERIFICATION_EXPIRES_IN") ?? "1d",
    });
  }

  async register(data: RegisterDto) {
    const email = data.email.toLowerCase();

    const user = await this.usersService.createUser({
      name: data.name,
      email,
      passwordHash: await bcrypt.hash(data.password, 12),
      role: Role.USER,
    });

    const verifyToken = await this.signEmailVerificationToken(user);
    const baseUrl =
      this.config.get<string>("EMAIL_VERIFICATION_BASE_URL") ??
      "http://localhost:4000/api";
    const verifyLink = `${baseUrl}/auth/verify-email?token=${verifyToken}`;
    await this.emailService.sendVerificationEmail(user.email, verifyLink);

    const tokens = await this.signTokens(user);

    return {
      user: this.toAuthUser(user),
      tokens,
    };
  }

  async login(data: LoginDto) {
    const email = data.email.toLowerCase();
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const ok = await bcrypt.compare(data.password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException("Invalid credentials");
    }

    if (!user.isActive) {
      throw new UnauthorizedException("User is inactive");
    }

    const tokens = await this.signTokens(user);

    return {
      user: this.toAuthUser(user),
      tokens,
    };
  }

  async updateProfile(userId: string, data: UpdateProfileDto) {
    const update: any = {};
    if (data.name) {
      update.name = data.name;
    }
    if (Object.keys(update).length === 0) {
      return this.usersService.ensureExists(userId);
    }
    return this.usersService.updateUser(userId, update);
  }

  async changePassword(userId: string, data: ChangePasswordDto) {
    const user = await this.usersService.ensureExists(userId);
    const ok = await bcrypt.compare(data.currentPassword, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException("Current password is incorrect");
    }
    const newHash = await bcrypt.hash(data.newPassword, 12);
    await this.usersService.updatePassword(userId, newHash);
    return { id: userId };
  }

  async changeEmail(userId: string, data: ChangeEmailDto) {
    const user = await this.usersService.ensureExists(userId);
    const ok = await bcrypt.compare(data.password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException("Password is incorrect");
    }

    const newEmail = data.newEmail.toLowerCase();
    const existing = await this.usersService.findByEmail(newEmail);
    if (existing && String(existing._id) !== String(user._id)) {
      throw new ConflictException("Email already in use");
    }

    await this.usersService.updateUser(userId, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(user.name ? { name: user.name } : {}),
    } as any);
    await this.usersService.setEmailVerified(userId, false);

    const verifyToken = await this.signEmailVerificationToken({
      ...user,
      email: newEmail,
    });
    const baseUrl =
      this.config.get<string>("EMAIL_VERIFICATION_BASE_URL") ??
      "http://localhost:4000/api";
    const verifyLink = `${baseUrl}/auth/verify-email?token=${verifyToken}`;
    await this.emailService.sendVerificationEmail(newEmail, verifyLink);

    return { id: userId, email: newEmail };
  }

  async verifyEmailToken(token: string) {
    const payload = (await this.jwtService.verifyAsync(token, {
      secret: this.config.get<string>("JWT_ACCESS_SECRET"),
    })) as { sub: string; email?: string; type?: string };

    if (payload.type && payload.type !== "verify-email") {
      throw new UnauthorizedException("Invalid verification token");
    }

    await this.usersService.setEmailVerified(payload.sub, true);
    return { id: payload.sub, emailVerified: true };
  }
}
