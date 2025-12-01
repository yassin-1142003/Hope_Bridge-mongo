'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface User {
  _id: string;
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'GENERAL_MANAGER' | 'PROGRAM_MANAGER' | 'PROJECT_COORDINATOR' | 'HR' | 'FINANCE' | 'PROCUREMENT' | 'STOREKEEPER' | 'ME' | 'FIELD_OFFICER' | 'ACCOUNTANT' | 'USER';
  isActive: boolean;
  emailVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing auth on mount
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setToken(storedToken);

        // Verify token is still valid
        verifyToken(storedToken);
      } catch (error) {
        // Clear invalid stored data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } else {
      // For development/testing - provide a mock user with one of the allowed roles
      const mockUser: User = {
        _id: 'test-user-id',
        id: 'test-user-id', // Add the required id field
        name: 'Test Admin',
        email: 'admin@hopebridge.com',
        role: 'ADMIN', // This role has chat permissions
        isActive: true,
        emailVerified: true
      };
      setUser(mockUser);
      setToken('mock-token');
    }
    setLoading(false);
  }, []);

  const verifyToken = async (token: string) => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        cache: 'no-store' // Prevent caching to ensure fresh data
      });

      if (!response.ok) {
        console.log('Token verification failed, status:', response.status);
        
        // Only logout on 401 (invalid token), not on server errors
        if (response.status === 401) {
          console.log('Token is invalid, logging out...');
          logout();
          return;
        } else {
          // For other errors (500, 404, etc.), don't logout automatically
          console.log('Server error during token verification, keeping user logged in');
          return;
        }
      }

      const data = await response.json();
      if (data.success && data.user) {
        setUser(data.user);
        console.log('Token verified successfully for user:', data.user.email);
      } else {
        console.log('Invalid response format from auth/me endpoint');
        // Don't logout automatically, let the user decide
      }
    } catch (error) {
      console.error('Token verification failed due to network error:', error);
      // Don't logout on network errors, keep user logged in
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      const { user: userData, accessToken } = data.details;

      setUser(userData);
      setToken(accessToken);
      
      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      console.log('Login successful for user:', userData.email);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    console.log('Manual logout initiated');
    
    // Clear client-side state immediately
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Call logout API asynchronously (don't wait for it)
    fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    }).catch(error => {
      console.warn('Logout API call failed:', error);
    });
  };

  return (
    <AuthContext.Provider value={{ user, token, setUser, setToken, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
