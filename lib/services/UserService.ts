import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";
import { getProfessionalDatabase } from "../professionalDatabase";
import { UserRole, ROLE_PERMISSIONS, canAssignRole, RolePermissions } from "@/lib/roles";

export interface User {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewUserData {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  isActive?: boolean;
  emailVerified?: boolean;
}

export class UserService {
  private db = getProfessionalDatabase();

  private async ensureConnected(): Promise<void> {
    await this.db.connect();
  }

  async createUser(data: NewUserData): Promise<User> {
    // Ensure database is connected
    await this.ensureConnected();
    
    // Check if user already exists
    const existingUser = await this.db.findOne('users', { email: data.email });
    if (existingUser.data) {
      throw new Error("This email is already registered");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 12);

    // Create user object
    const user = {
      name: data.name,
      email: data.email,
      passwordHash: hashedPassword,
      role: data.role || 'USER',
      isActive: data.isActive ?? true,
      emailVerified: data.emailVerified ?? false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Insert user
    const result = await this.db.create('users', user);
    
    return {
      _id: result.data._id.toString(),
      ...user
    };
  }

  async getAll(): Promise<User[]> {
    const result = await this.db.findMany('users', {}, { sort: { createdAt: -1 } });
    
    return result.data.map((user: any) => ({
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      passwordHash: user.passwordHash,
      role: user.role,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }));
  }

  async getById(id: string): Promise<User | null> {
    const result = await this.db.findOne('users', { _id: new ObjectId(id) });
    
    if (!result.data) return null;
    
    return {
      _id: result.data._id.toString(),
      name: result.data.name,
      email: result.data.email,
      passwordHash: result.data.passwordHash,
      role: result.data.role,
      isActive: result.data.isActive,
      emailVerified: result.data.emailVerified,
      createdAt: result.data.createdAt,
      updatedAt: result.data.updatedAt
    };
  }

  async getByEmail(email: string): Promise<User | null> {
    // Ensure database is connected
    await this.ensureConnected();
    
    const result = await this.db.findOne('users', { email });
    
    if (!result.data) return null;
    
    return {
      _id: result.data._id.toString(),
      name: result.data.name,
      email: result.data.email,
      passwordHash: result.data.passwordHash,
      role: result.data.role,
      isActive: result.data.isActive,
      emailVerified: result.data.emailVerified,
      createdAt: result.data.createdAt,
      updatedAt: result.data.updatedAt
    };
  }

  async update(id: string, updateData: Partial<Omit<User, '_id' | 'createdAt' | 'updatedAt' | 'passwordHash'>>): Promise<User | null> {
    const result = await this.db.updateOne('users', { _id: new ObjectId(id) }, { $set: updateData });
    
    if (!result.success) return null;
    
    return this.getById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db.deleteOne('users', { _id: new ObjectId(id) });
    return result.success;
  }

  async verifyPassword(email: string, password: string): Promise<User | null> {
    const user = await this.getByEmail(email);
    if (!user || !user.isActive) return null;

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) return null;

    return user;
  }

  async getUsersByRole(role: UserRole): Promise<User[]> {
    const result = await this.db.findMany('users', { role, isActive: true }, { sort: { createdAt: -1 } });
    
    return result.data.map((user: any) => ({
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      passwordHash: user.passwordHash,
      role: user.role,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }));
  }

  async updateUserRole(userId: string, newRole: UserRole, updatedByRole: UserRole): Promise<User | null> {
    // Check if the updater can assign this role
    if (!canAssignRole(updatedByRole, newRole)) {
      throw new Error(`Role '${updatedByRole}' cannot assign role '${newRole}'`);
    }

    return this.update(userId, { role: newRole });
  }

  async getUsersWithPermissions(permission: keyof RolePermissions): Promise<User[]> {
    const result = await this.db.findMany('users', { isActive: true }, { sort: { createdAt: -1 } });
    
    return result.data
      .filter((user: any) => {
        const userRole = user.role as UserRole;
        const rolePermissions = ROLE_PERMISSIONS[userRole];
        return rolePermissions ? rolePermissions[permission] : false;
      })
      .map((user: any) => ({
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        passwordHash: user.passwordHash,
        role: user.role,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }));
  }

  async getAllUsersForTaskAssignment(assignerRole: UserRole): Promise<User[]> {
    const result = await this.db.findMany('users', { isActive: true }, { sort: { createdAt: -1 } });
    
    return result.data
      .filter((user: any) => {
        // Users can be assigned tasks if they have canReceiveMessages permission
        const userRole = user.role as UserRole;
        return ROLE_PERMISSIONS[userRole]?.canReceiveMessages;
      })
      .map((user: any) => ({
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        passwordHash: user.passwordHash,
        role: user.role,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }));
  }
}
