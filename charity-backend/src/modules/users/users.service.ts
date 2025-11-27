import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { UsersRepository } from "./users.repository";
import { Role } from "../../common/enums/role.enum";

@Injectable()
export class UsersService {
  constructor(private readonly usersRepo: UsersRepository) {}

  findByEmail(email: string) {
    return this.usersRepo.findByEmail(email);
  }

  findById(id: string) {
    return this.usersRepo.findById(id);
  }

  async createUser(params: {
    name: string;
    email: string;
    passwordHash: string;
    role?: Role;
  }) {
    const existing = await this.usersRepo.findByEmail(params.email);
    if (existing) {
      throw new ConflictException("Email already in use");
    }

    const user = await this.usersRepo.create({
      name: params.name,
      email: params.email,
      passwordHash: params.passwordHash,
      role: params.role ?? Role.USER,
      isActive: true,
    } as any);

    return user;
  }

  async findAll() {
    return this.usersRepo.findAll();
  }

  async ensureExists(id: string) {
    const user = await this.usersRepo.findById(id);
    if (!user) {
      throw new NotFoundException("User not found");
    }
    return user;
  }

  async updateUser(id: string, update: Partial<{ name: string; role: Role }>) {
    await this.ensureExists(id);
    return this.usersRepo.updateById(id, update as any);
  }

  async removeUser(id: string) {
    await this.ensureExists(id);
    await this.usersRepo.deleteById(id);
    return { id };
  }

  async setUserActive(id: string, isActive: boolean) {
    await this.ensureExists(id);
    return this.usersRepo.updateById(id, { isActive } as any);
  }

  async setEmailVerified(id: string, emailVerified: boolean) {
    await this.ensureExists(id);
    return this.usersRepo.updateById(id, { emailVerified } as any);
  }

  async updatePassword(id: string, passwordHash: string) {
    await this.ensureExists(id);
    return this.usersRepo.updateById(id, { passwordHash } as any);
  }
}
