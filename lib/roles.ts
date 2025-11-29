/**
 * Comprehensive Role System for Hope Bridge
 * 
 * This file defines all user roles and their permissions
 * to support the organizational structure requested.
 */

export type UserRole = 
  | 'SUPER_ADMIN'      // Can manage everything including user roles
  | 'ADMIN'            // Standard admin with most permissions
  | 'GENERAL_MANAGER'  // Can manage most operations and assign roles
  | 'PROGRAM_MANAGER'  // Manages programs and projects
  | 'PROJECT_COORDINATOR' // Coordinates specific projects
  | 'HR'               // Human Resources management
  | 'FINANCE'          // Financial management
  | 'PROCUREMENT'      // Procurement and purchasing
  | 'STOREKEEPER'      // Inventory and store management
  | 'ME'               // Monitoring & Evaluation
  | 'FIELD_OFFICER'    // Field operations
  | 'ACCOUNTANT'       // Accounting operations
  | 'USER';             // Basic user access

export interface RolePermissions {
  canManageUsers: boolean;
  canAssignRoles: boolean;
  canCreateTasks: boolean;
  canAssignTasks: boolean;
  canViewAllTasks: boolean;
  canManageProjects: boolean;
  canManageContent: boolean;
  canViewAnalytics: boolean;
  canManageFinance: boolean;
  canManageHR: boolean;
  canManageProcurement: boolean;
  canManageInventory: boolean;
  canSendMessages: boolean;
  canReceiveMessages: boolean;
  canViewReports: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  SUPER_ADMIN: {
    canManageUsers: true,
    canAssignRoles: true,
    canCreateTasks: true,
    canAssignTasks: true,
    canViewAllTasks: true,
    canManageProjects: true,
    canManageContent: true,
    canViewAnalytics: true,
    canManageFinance: true,
    canManageHR: true,
    canManageProcurement: true,
    canManageInventory: true,
    canSendMessages: true,
    canReceiveMessages: true,
    canViewReports: true,
  },
  ADMIN: {
    canManageUsers: false,
    canAssignRoles: false,
    canCreateTasks: true,
    canAssignTasks: true,
    canViewAllTasks: true,
    canManageProjects: true,
    canManageContent: true,
    canViewAnalytics: true,
    canManageFinance: false,
    canManageHR: false,
    canManageProcurement: false,
    canManageInventory: false,
    canSendMessages: true,
    canReceiveMessages: true,
    canViewReports: true,
  },
  GENERAL_MANAGER: {
    canManageUsers: true,
    canAssignRoles: true,
    canCreateTasks: true,
    canAssignTasks: true,
    canViewAllTasks: true,
    canManageProjects: true,
    canManageContent: true,
    canViewAnalytics: true,
    canManageFinance: true,
    canManageHR: true,
    canManageProcurement: true,
    canManageInventory: true,
    canSendMessages: true,
    canReceiveMessages: true,
    canViewReports: true,
  },
  PROGRAM_MANAGER: {
    canManageUsers: false,
    canAssignRoles: false,
    canCreateTasks: true,
    canAssignTasks: true,
    canViewAllTasks: true,
    canManageProjects: true,
    canManageContent: false,
    canViewAnalytics: true,
    canManageFinance: false,
    canManageHR: false,
    canManageProcurement: false,
    canManageInventory: false,
    canSendMessages: true,
    canReceiveMessages: true,
    canViewReports: true,
  },
  PROJECT_COORDINATOR: {
    canManageUsers: false,
    canAssignRoles: false,
    canCreateTasks: true,
    canAssignTasks: true,
    canViewAllTasks: false,
    canManageProjects: true,
    canManageContent: false,
    canViewAnalytics: true,
    canManageFinance: false,
    canManageHR: false,
    canManageProcurement: false,
    canManageInventory: false,
    canSendMessages: true,
    canReceiveMessages: true,
    canViewReports: true,
  },
  HR: {
    canManageUsers: true,
    canAssignRoles: false,
    canCreateTasks: true,
    canAssignTasks: true,
    canViewAllTasks: false,
    canManageProjects: false,
    canManageContent: false,
    canViewAnalytics: true,
    canManageFinance: false,
    canManageHR: true,
    canManageProcurement: false,
    canManageInventory: false,
    canSendMessages: true,
    canReceiveMessages: true,
    canViewReports: true,
  },
  FINANCE: {
    canManageUsers: false,
    canAssignRoles: false,
    canCreateTasks: true,
    canAssignTasks: true,
    canViewAllTasks: false,
    canManageProjects: false,
    canManageContent: false,
    canViewAnalytics: true,
    canManageFinance: true,
    canManageHR: false,
    canManageProcurement: false,
    canManageInventory: false,
    canSendMessages: true,
    canReceiveMessages: true,
    canViewReports: true,
  },
  PROCUREMENT: {
    canManageUsers: false,
    canAssignRoles: false,
    canCreateTasks: true,
    canAssignTasks: true,
    canViewAllTasks: false,
    canManageProjects: false,
    canManageContent: false,
    canViewAnalytics: true,
    canManageFinance: false,
    canManageHR: false,
    canManageProcurement: true,
    canManageInventory: false,
    canSendMessages: true,
    canReceiveMessages: true,
    canViewReports: true,
  },
  STOREKEEPER: {
    canManageUsers: false,
    canAssignRoles: false,
    canCreateTasks: true,
    canAssignTasks: true,
    canViewAllTasks: false,
    canManageProjects: false,
    canManageContent: false,
    canViewAnalytics: true,
    canManageFinance: false,
    canManageHR: false,
    canManageProcurement: false,
    canManageInventory: true,
    canSendMessages: true,
    canReceiveMessages: true,
    canViewReports: true,
  },
  ME: {
    canManageUsers: false,
    canAssignRoles: false,
    canCreateTasks: true,
    canAssignTasks: true,
    canViewAllTasks: false,
    canManageProjects: false,
    canManageContent: false,
    canViewAnalytics: true,
    canManageFinance: false,
    canManageHR: false,
    canManageProcurement: false,
    canManageInventory: false,
    canSendMessages: true,
    canReceiveMessages: true,
    canViewReports: true,
  },
  FIELD_OFFICER: {
    canManageUsers: false,
    canAssignRoles: false,
    canCreateTasks: true,
    canAssignTasks: true,
    canViewAllTasks: false,
    canManageProjects: false,
    canManageContent: false,
    canViewAnalytics: true,
    canManageFinance: false,
    canManageHR: false,
    canManageProcurement: false,
    canManageInventory: false,
    canSendMessages: true,
    canReceiveMessages: true,
    canViewReports: true,
  },
  ACCOUNTANT: {
    canManageUsers: false,
    canAssignRoles: false,
    canCreateTasks: true,
    canAssignTasks: true,
    canViewAllTasks: false,
    canManageProjects: false,
    canManageContent: false,
    canViewAnalytics: true,
    canManageFinance: true,
    canManageHR: false,
    canManageProcurement: false,
    canManageInventory: false,
    canSendMessages: true,
    canReceiveMessages: true,
    canViewReports: true,
  },
  USER: {
    canManageUsers: false,
    canAssignRoles: false,
    canCreateTasks: false,
    canAssignTasks: false,
    canViewAllTasks: false,
    canManageProjects: false,
    canManageContent: false,
    canViewAnalytics: false,
    canManageFinance: false,
    canManageHR: false,
    canManageProcurement: false,
    canManageInventory: false,
    canSendMessages: true,
    canReceiveMessages: true,
    canViewReports: false,
  },
};

export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  GENERAL_MANAGER: 'General Manager',
  PROGRAM_MANAGER: 'Program Manager',
  PROJECT_COORDINATOR: 'Project Coordinator',
  HR: 'HR',
  FINANCE: 'Finance',
  PROCUREMENT: 'Procurement',
  STOREKEEPER: 'Storekeeper',
  ME: 'M&E',
  FIELD_OFFICER: 'Field Officer',
  ACCOUNTANT: 'Accountant',
  USER: 'User',
};

export const ROLE_HIERARCHY: UserRole[] = [
  'SUPER_ADMIN',
  'GENERAL_MANAGER',
  'ADMIN',
  'PROGRAM_MANAGER',
  'PROJECT_COORDINATOR',
  'HR',
  'FINANCE',
  'PROCUREMENT',
  'STOREKEEPER',
  'ME',
  'FIELD_OFFICER',
  'ACCOUNTANT',
  'USER',
];

export function canAssignRole(assignerRole: UserRole, targetRole: UserRole): boolean {
  const assignerIndex = ROLE_HIERARCHY.indexOf(assignerRole);
  const targetIndex = ROLE_HIERARCHY.indexOf(targetRole);
  
  // Only SUPER_ADMIN and GENERAL_MANAGER can assign roles
  if (assignerRole !== 'SUPER_ADMIN' && assignerRole !== 'GENERAL_MANAGER') {
    return false;
  }
  
  // SUPER_ADMIN can assign any role
  if (assignerRole === 'SUPER_ADMIN') {
    return true;
  }
  
  // GENERAL_MANAGER can assign roles lower than themselves (but not SUPER_ADMIN)
  return targetIndex > assignerIndex && targetRole !== 'SUPER_ADMIN';
}

export function hasPermission(userRole: UserRole, permission: keyof RolePermissions): boolean {
  return ROLE_PERMISSIONS[userRole]?.[permission] || false;
}

export function getRolesByPermission(permission: keyof RolePermissions): UserRole[] {
  return Object.entries(ROLE_PERMISSIONS)
    .filter(([, perms]) => perms[permission])
    .map(([role]) => role as UserRole);
}

export function canSendMessage(fromRole: UserRole, toRole: UserRole): boolean {
  // All roles can send messages to all other roles
  return hasPermission(fromRole, 'canSendMessages') && hasPermission(toRole, 'canReceiveMessages');
}
