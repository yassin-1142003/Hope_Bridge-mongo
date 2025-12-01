// lib/auth.ts - JWT-based authentication utilities
import jwt from 'jsonwebtoken';
import { getCollection } from './mongodb';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  isActive: boolean;
  emailVerified: boolean;
}

// NextAuth configuration for compatibility
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
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const usersCollection = await getCollection('users');
    const user = await usersCollection.findOne({ 
      email: decoded.email,
      isActive: true 
    });
    
    if (!user) return null;
    
    return {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      emailVerified: user.emailVerified
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
  return jwt.sign(
    { 
      email: user.email, 
      role: user.role 
    },
    process.env.JWT_SECRET!,
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
