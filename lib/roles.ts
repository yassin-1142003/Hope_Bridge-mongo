/**
 * Official Organization Role Hierarchy for Hope Bridge
 * 
 * This file defines the official user roles and their permissions
 * according to the organizational structure and hierarchy.
 */

export type UserRole = 
  | 'SUPER_ADMIN'      // System administrator - full system access and user management
  | 'ADMIN'            // Admin - full system access and user management
  | 'GENERAL_MANAGER'  // Manage all departments and assign tasks to any user
  | 'PROGRAM_MANAGER'  // Manage programs and assign tasks to project coordinators and field teams
  | 'PROJECT_COORDINATOR' // Manage tasks within projects and assign to field staff
  | 'HR'               // Manage HR workflows, staff records, and HR-specific tasks
  | 'FINANCE'          // Manage financial tasks and approvals
  | 'PROCUREMENT'      // Manage purchase requests and procurement workflows
  | 'STOREKEEPER'      // Manage stock tasks and inventory documentation
  | 'ME_OFFICER'       // Perform monitoring, evaluation, and data submissions
  | 'FIELD_OFFICER'    // Receive field assignments and submit reports
  | 'ACCOUNTANT'       // Handle accounting workflows and financial document submissions
  | 'USER';            // Basic user access - roles hidden from general users

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  isActive: boolean;
  avatar?: string;
}

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
  ME_OFFICER: {
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
  ME_OFFICER: 'M&E Officer',
  FIELD_OFFICER: 'Field Officer',
  ACCOUNTANT: 'Accountant',
  USER: 'User',
};

export const ROLE_HIERARCHY: UserRole[] = [
  'SUPER_ADMIN',
  'ADMIN',
  'GENERAL_MANAGER',
  'PROGRAM_MANAGER',
  'PROJECT_COORDINATOR',
  'HR',
  'FINANCE',
  'PROCUREMENT',
  'STOREKEEPER',
  'ME_OFFICER',
  'FIELD_OFFICER',
  'ACCOUNTANT',
  'USER',
];

export function canAssignRole(assignerRole: UserRole, targetRole: UserRole): boolean {
  // Only authorized administrators can assign or update roles
  // Roles are hidden from general users
  const authorizedAdmins = ['SUPER_ADMIN', 'ADMIN'];
  
  if (!authorizedAdmins.includes(assignerRole)) {
    return false;
  }
  
  // SUPER_ADMIN can assign any role
  if (assignerRole === 'SUPER_ADMIN') {
    return true;
  }
  
  // ADMIN can assign roles but not SUPER_ADMIN
  return targetRole !== 'SUPER_ADMIN';
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
