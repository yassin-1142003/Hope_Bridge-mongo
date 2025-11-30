// lib/auth-enhanced.ts - Enhanced authentication with better session management
import { getClientSession, parseJWT } from './auth-client';
import type { User, UserRole } from './roles';

export interface SessionInfo {
  user: User;
  expires: string;
  isActive: boolean;
  lastActivity: string;
  permissions: string[];
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  session: SessionInfo | null;
  error: string | null;
}

export class EnhancedAuthManager {
  private state: AuthState;
  private subscribers: Set<(state: AuthState) => void> = new Set();
  private sessionTimeout: NodeJS.Timeout | null = null;
  private refreshInterval: NodeJS.Timeout | null = null;
  private readonly WARNING_TIMEOUT = 15 * 60 * 1000; // 15 minutes
  private readonly REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

  // 🔒 SSR-safe localStorage access
  private isClientSide(): boolean {
    return typeof window !== 'undefined' && 
           typeof localStorage !== 'undefined' && 
           typeof sessionStorage !== 'undefined';
  }

  private safeLocalStorageGet(key: string): string | null {
    if (!this.isClientSide()) return null;
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  private safeLocalStorageSet(key: string, value: string): void {
    if (!this.isClientSide()) return;
    try {
      localStorage.setItem(key, value);
    } catch {
      // Silently fail
    }
  }

  private safeLocalStorageRemove(key: string): void {
    if (!this.isClientSide()) return;
    try {
      localStorage.removeItem(key);
    } catch {
      // Silently fail
    }
  }

  private safeSessionStorageGet(key: string): string | null {
    if (!this.isClientSide()) return null;
    try {
      return sessionStorage.getItem(key);
    } catch {
      return null;
    }
  }

  private safeSessionStorageSet(key: string, value: string): void {
    if (!this.isClientSide()) return;
    try {
      sessionStorage.setItem(key, value);
    } catch {
      // Silently fail
    }
  }

  private safeSessionStorageRemove(key: string): void {
    if (!this.isClientSide()) return;
    try {
      sessionStorage.removeItem(key);
    } catch {
      // Silently fail
    }
  }
  
  private static instance: EnhancedAuthManager | null = null;

  private constructor() {
    this.state = {
      isAuthenticated: false,
      isLoading: false,
      user: null,
      session: null,
      error: null
    };
    this.initializeSessionMonitoring();
  }

  static getInstance(): EnhancedAuthManager {
    if (!EnhancedAuthManager.instance) {
      EnhancedAuthManager.instance = new EnhancedAuthManager();
    }
    return EnhancedAuthManager.instance;
  }

  // Session management
  async getCurrentSession(): Promise<SessionInfo | null> {
    try {
      const session = getClientSession();
      if (!session) return null;

      const user = session.user;
      const permissions = this.getUserPermissions(user.role as UserRole);
      
      return {
        user: user as any, // Type assertion to handle role compatibility
        expires: session.expires,
        isActive: true,
        lastActivity: new Date().toISOString(),
        permissions
      };
    } catch (error) {
      console.error('Error getting current session:', error);
      return null;
    }
  }

  async refreshSession(): Promise<boolean> {
    try {
      this.setState({ isLoading: true });
      
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (response.ok) {
        const { session } = await response.json();
        this.updateSession(session);
        return true;
      } else {
        await this.signOut();
        return false;
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
      await this.signOut();
      return false;
    } finally {
      this.setState({ isLoading: false });
    }
  }

  async signIn(email: string, password: string, rememberMe: boolean = false): Promise<boolean> {
    try {
      this.setState({ isLoading: true, error: null });

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe })
      });

      if (response.ok) {
        const { session, token } = await response.json();
        
        // Store token
        if (rememberMe) {
          this.safeLocalStorageSet('auth-token', token);
        } else {
          this.safeSessionStorageSet('auth-token', token);
        }

        this.updateSession(session);
        return true;
      } else {
        const error = await response.json();
        this.setState({ error: error.message || 'Sign in failed' });
        return false;
      }
    } catch (error) {
      console.error('Error signing in:', error);
      this.setState({ error: 'Network error occurred' });
      return false;
    } finally {
      this.setState({ isLoading: false });
    }
  }

  async signOut(): Promise<void> {
    // Prevent signOut execution during SSR
    if (!this.isClientSide()) {
      console.warn('signOut called during SSR - skipping');
      return;
    }
    
    try {
      // Call signout API
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });
    } catch (error) {
      console.error('Error calling signout API:', error);
    } finally {
      // Clear local storage regardless of API call success
      this.safeLocalStorageRemove('auth-token');
      this.safeSessionStorageRemove('auth-token');
      
      // Clear session monitoring
      this.clearSessionMonitoring();
      
      // Reset state
      this.setState({
        isAuthenticated: false,
        user: null,
        session: null,
        error: null
      });
    }
  }

  // Permission management
  private getUserPermissions(role: User['role']): string[] {
    const rolePermissions: Record<User['role'], string[]> = {
      'SUPER_ADMIN': [
        'manage_users', 'assign_roles', 'create_tasks', 'assign_tasks',
        'view_all_tasks', 'manage_projects', 'manage_content', 'view_analytics',
        'manage_finance', 'delete_tasks', 'bulk_operations', 'export_import'
      ],
      'ADMIN': [
        'create_tasks', 'assign_tasks', 'view_all_tasks', 'manage_projects',
        'manage_content', 'view_analytics', 'delete_tasks', 'bulk_operations'
      ],
      'GENERAL_MANAGER': [
        'create_tasks', 'assign_tasks', 'view_all_tasks', 'manage_projects',
        'view_analytics', 'delete_tasks', 'bulk_operations'
      ],
      'PROGRAM_MANAGER': [
        'create_tasks', 'assign_tasks', 'view_team_tasks', 'manage_projects',
        'view_analytics', 'delete_own_tasks'
      ],
      'PROJECT_COORDINATOR': [
        'create_tasks', 'assign_tasks', 'view_team_tasks', 'manage_projects',
        'delete_own_tasks'
      ],
      'HR': [
        'create_tasks', 'assign_tasks', 'view_team_tasks', 'manage_content',
        'view_analytics'
      ],
      'FINANCE': [
        'create_tasks', 'view_assigned_tasks', 'view_analytics'
      ],
      'PROCUREMENT': [
        'create_tasks', 'view_assigned_tasks'
      ],
      'STOREKEEPER': [
        'create_tasks', 'view_assigned_tasks'
      ],
      'ME': [
        'create_tasks', 'view_all_tasks', 'view_analytics'
      ],
      'FIELD_OFFICER': [
        'create_tasks', 'view_assigned_tasks'
      ],
      'ACCOUNTANT': [
        'create_tasks', 'view_assigned_tasks', 'view_analytics'
      ],
      'USER': [
        'create_tasks', 'view_assigned_tasks'
      ]
    };

    return rolePermissions[role] || [];
  }

  hasPermission(permission: string): boolean {
    return this.state.session?.permissions.includes(permission) || false;
  }

  hasAnyPermission(permissions: string[]): boolean {
    if (!this.state.session) return false;
    return permissions.some(permission => this.state.session!.permissions.includes(permission));
  }

  // State management
  private setState(updates: Partial<AuthState>): void {
    this.state = { ...this.state, ...updates };
    this.notifySubscribers();
  }

  subscribe(callback: (state: AuthState) => void): () => void {
    this.subscribers.add(callback);
    callback(this.state);
    
    return () => {
      this.subscribers.delete(callback);
    };
  }

  private notifySubscribers(): void {
    this.subscribers.forEach(callback => {
      try {
        callback(this.state);
      } catch (error) {
        console.error('Error in auth subscriber callback:', error);
      }
    });
  }

  // Session monitoring
  private initializeSessionMonitoring(): void {
    // Only initialize session monitoring on client side after DOM is ready
    if (!this.isClientSide()) return;
    
    // Additional safety check - wait for next tick to ensure we're fully on client
    setTimeout(() => {
      if (!this.isClientSide()) return;
      
      // Check session on initialization
      this.checkSession();

      // Set up refresh interval
      this.refreshInterval = setInterval(() => {
        if (this.isClientSide()) {
          this.checkSession();
        }
      }, this.REFRESH_INTERVAL);

      // Set up session timeout warning
      this.sessionTimeout = setTimeout(() => {
        if (this.isClientSide()) {
          this.warnSessionExpiry();
        }
      }, this.WARNING_TIMEOUT);
    }, 0);
  }

  private clearSessionMonitoring(): void {
    if (this.sessionTimeout) {
      clearTimeout(this.sessionTimeout);
      this.sessionTimeout = null;
    }
    
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  private async checkSession(): Promise<void> {
    // Don't check session during SSR
    if (!this.isClientSide()) return;
    
    try {
      const session = await this.getCurrentSession();
      
      if (!session) {
        await this.signOut();
        return;
      }

      // Check if session is expired
      const expiryTime = new Date(session.expires).getTime();
      const currentTime = Date.now();
      
      if (currentTime >= expiryTime) {
        await this.signOut();
        return;
      }

      // Update last activity
      session.lastActivity = new Date().toISOString();
      this.setState({ session, isAuthenticated: true, user: session.user });
    } catch (error) {
      console.error('Error checking session:', error);
      await this.signOut();
    }
  }

  private warnSessionExpiry(): void {
    // Show warning to user
    if (typeof window !== 'undefined') {
      const warning = window.confirm('Your session will expire in 5 minutes. Would you like to extend it?');
      if (warning) {
        this.refreshSession();
      }
    }
  }

  private updateSession(session: any): void {
    const sessionInfo: SessionInfo = {
      user: session.user,
      expires: session.expires,
      isActive: true,
      lastActivity: new Date().toISOString(),
      permissions: this.getUserPermissions(session.user.role)
    };

    this.setState({
      isAuthenticated: true,
      user: session.user,
      session: sessionInfo,
      error: null
    });

    // Restart session monitoring
    this.clearSessionMonitoring();
    this.initializeSessionMonitoring();
  }

  private getAuthToken(): string {
    return this.safeLocalStorageGet('auth-token') || 
           this.safeSessionStorageGet('auth-token') || '';
  }

  // Utility methods
  getCurrentUser(): User | null {
    return this.state.user;
  }

  isAuthenticated(): boolean {
    return this.state.isAuthenticated;
  }

  isLoading(): boolean {
    return this.state.isLoading;
  }

  getError(): string | null {
    return this.state.error;
  }

  clearError(): void {
    this.setState({ error: null });
  }

  // Password management
  async changePassword(currentPassword: string, newPassword: string): Promise<boolean> {
    try {
      this.setState({ isLoading: true, error: null });

      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      if (response.ok) {
        return true;
      } else {
        const error = await response.json();
        this.setState({ error: error.message || 'Password change failed' });
        return false;
      }
    } catch (error) {
      console.error('Error changing password:', error);
      this.setState({ error: 'Network error occurred' });
      return false;
    } finally {
      this.setState({ isLoading: false });
    }
  }

  async requestPasswordReset(email: string): Promise<boolean> {
    try {
      this.setState({ isLoading: true, error: null });

      const response = await fetch('/api/auth/request-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (response.ok) {
        return true;
      } else {
        const error = await response.json();
        this.setState({ error: error.message || 'Password reset request failed' });
        return false;
      }
    } catch (error) {
      console.error('Error requesting password reset:', error);
      this.setState({ error: 'Network error occurred' });
      return false;
    } finally {
      this.setState({ isLoading: false });
    }
  }
}

// Export singleton instance
export const authManager = EnhancedAuthManager.getInstance();
