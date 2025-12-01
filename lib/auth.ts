// lib/auth.ts - JWT-based authentication utilities
/* eslint-disable @typescript-eslint/no-explicit-any */
import jwt from 'jsonwebtoken';
import { getCollection } from './mongodb';
import { cookies } from 'next/headers';
import { AuthOptions } from 'next-auth';

interface User {
  _id: string;
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'PROJECT_COORDINATOR' | 'FIELD_OFFICER' | 'HR' | 'VOLUNTEER' | 'USER';
  isActive: boolean;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  phone?: string;
  department?: string;
  emailVerified?: boolean;
}

// NextAuth configuration for compatibility
<<<<<<< HEAD
export const authOptions = {
  providers: [], // Empty providers array since we're using JWT directly
  session: {
    strategy: 'jwt' as const,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
  },
  callbacks: {
    async jwt({ token, user }: any) {
      return token;
    },
    async session({ session, token }: any) {
      return session;
    },
=======
export const authOptions: AuthOptions = {
  // Empty config since we're using JWT directly
  // This is just for compatibility with existing code
  providers: [], // Empty providers array since we're not using NextAuth providers
  session: {
    strategy: 'jwt',
>>>>>>> 2efbb4e38f6799641e973bb9be8bca702baa4001
  },
};

// Custom session function to replace getServerSession
export async function getServerSession() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) return null;
    
    const user = await verifyToken(token);
    if (!user) return null;
    
    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: null
      },
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
    };
  } catch (error) {
    console.error('Session verification failed:', error);
    return null;
  }
}

// Verify JWT token and return user
export async function verifyToken(token: string): Promise<User | null> {
  try {
    if (!token) return null;
    
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET environment variable is not set');
      return null;
    }
    
    const decoded = jwt.verify(token, jwtSecret) as any;
    const usersCollection = await getCollection('users');
    const user = await usersCollection.findOne({ 
      email: decoded.email,
      isActive: true 
    });
    
    if (!user) return null;
    
    return {
      _id: user._id.toString(),
      id: user.id || user._id.toString(), // Use user.id if available, otherwise use _id
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLogin: user.lastLogin,
      phone: user.phone,
      department: user.department
    };
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

// Verify admin token specifically
export async function verifyAdminToken(token: string): Promise<User | null> {
  try {
    const user = await verifyToken(token);
    if (!user || user.role !== 'ADMIN') {
      return null;
    }
    return user;
  } catch (error) {
    console.error('Admin token verification failed:', error);
    return null;
  }
}

// Generate JWT token
export function generateToken(user: User): string {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  
  return jwt.sign(
    { 
      email: user.email, 
      role: user.role 
    },
    jwtSecret,
    { expiresIn: '7d' }
  );
}

// Middleware to verify admin access
export function requireAdmin(handler: (req: any, ...args: any[]) => Promise<Response>) {
  return async (req: Request, ...args: any[]) => {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return Response.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    const adminUser = await verifyAdminToken(token);
    if (!adminUser) {
      return Response.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Add user to request for use in handler
    (req as any).user = adminUser;
    
    return handler(req, ...args);
  };
}
