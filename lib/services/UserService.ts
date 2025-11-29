import { getCollection } from "@/lib/mongodb";
import bcrypt from "bcrypt";
import { ObjectId } from "mongodb";
import { UserRole, ROLE_PERMISSIONS, canAssignRole } from "@/lib/roles";

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
  async createUser(data: NewUserData): Promise<User> {
    const usersCollection = await getCollection('users');
    
    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email: data.email });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = {
      name: data.name,
      email: data.email,
      passwordHash,
      role: data.role || 'USER',
      isActive: data.isActive ?? true,
      emailVerified: data.emailVerified ?? false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await usersCollection.insertOne(user);
    
    return {
      _id: result.insertedId.toString(),
      ...user
    };
  }

  async getAll(): Promise<User[]> {
    const usersCollection = await getCollection('users');
    const users = await usersCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    
    return users.map(user => ({
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
    const usersCollection = await getCollection('users');
    const user = await usersCollection.findOne({ _id: new ObjectId(id) });
    
    if (!user) return null;
    
    return {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      passwordHash: user.passwordHash,
      role: user.role,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }

  async getByEmail(email: string): Promise<User | null> {
    const usersCollection = await getCollection('users');
    const user = await usersCollection.findOne({ email });
    
    if (!user) return null;
    
    return {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      passwordHash: user.passwordHash,
      role: user.role,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }

  async update(id: string, updateData: Partial<Omit<User, '_id' | 'createdAt' | 'updatedAt'>>): Promise<User | null> {
    const usersCollection = await getCollection('users');
    
    const updateDoc = {
      ...updateData,
      updatedAt: new Date()
    };
    
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateDoc }
    );
    
    if (result.matchedCount === 0) return null;
    
    return this.getById(id);
  }

  async delete(id: string): Promise<boolean> {
    const usersCollection = await getCollection('users');
    const result = await usersCollection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }

  async verifyPassword(email: string, password: string): Promise<User | null> {
    const user = await this.getByEmail(email);
    if (!user || !user.isActive) return null;

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) return null;

    return user;
  }

  async getUsersByRole(role: UserRole): Promise<User[]> {
    const usersCollection = await getCollection('users');
    const users = await usersCollection
      .find({ role, isActive: true })
      .sort({ createdAt: -1 })
      .toArray();
    
    return users.map(user => ({
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

  async getUsersWithPermissions(permission: keyof typeof ROLE_PERMISSIONS): Promise<User[]> {
    const usersCollection = await getCollection('users');
    const users = await usersCollection
      .find({ isActive: true })
      .sort({ createdAt: -1 })
      .toArray();
    
    return users
      .filter(user => ROLE_PERMISSIONS[user.role as UserRole]?.[permission])
      .map(user => ({
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
    const usersCollection = await getCollection('users');
    const users = await usersCollection
      .find({ isActive: true })
      .sort({ createdAt: -1 })
      .toArray();
    
    return users
      .filter(user => {
        // Users can be assigned tasks if they have canReceiveMessages permission
        return ROLE_PERMISSIONS[user.role as UserRole]?.canReceiveMessages;
      })
      .map(user => ({
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
