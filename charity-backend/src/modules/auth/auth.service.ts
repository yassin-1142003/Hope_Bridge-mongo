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
import { RegisterDto, LoginDto } from "./auth.zod";
import { JwtPayload } from "./jwt-payload.interface";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
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

  async register(data: RegisterDto) {
    const email = data.email.toLowerCase();

    const user = await this.usersService.createUser({
      name: data.name,
      email,
      passwordHash: await bcrypt.hash(data.password, 10),
      role: Role.USER,
    });

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
}
