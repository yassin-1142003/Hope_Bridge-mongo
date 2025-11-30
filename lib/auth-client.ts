// lib/auth-client.ts - Client-side authentication utilities
import jwt from 'jsonwebtoken';

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

interface Session {
  user: User;
  expires: string;
}

export function parseJWT(token: string): User | null {
  try {
    if (!token || token === 'undefined') return null;
    
    const decoded = jwt.decode(token) as any;
    if (!decoded || !decoded.id) return null;
    
    return {
      _id: decoded.id,
      id: decoded.id,
      name: decoded.name || 'Unknown User',
      email: decoded.email || '',
      role: decoded.role || 'USER',
      isActive: decoded.isActive ?? true,
      avatar: decoded.avatar,
      createdAt: new Date(decoded.createdAt || Date.now()),
      updatedAt: new Date(decoded.updatedAt || Date.now()),
      lastLogin: decoded.lastLogin ? new Date(decoded.lastLogin) : undefined,
      phone: decoded.phone,
      department: decoded.department,
      emailVerified: decoded.emailVerified
    };
  } catch (error) {
    console.error('JWT parsing error:', error);
    return null;
  }
}

export function getClientSession(): Session | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const token = localStorage.getItem('auth-token');
    if (!token) return null;
    
    const user = parseJWT(token);
    if (!user) return null;
    
    return {
      user,
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };
  } catch (error) {
    console.error('Client session error:', error);
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwt.decode(token) as any;
    if (!decoded || !decoded.exp) return true;
    
    return Date.now() >= decoded.exp * 1000;
  } catch (error) {
    return true;
  }
}
