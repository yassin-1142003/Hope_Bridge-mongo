/**
 * Role Validation Utilities
 * 
 * Comprehensive validation for role assignments and permissions
 * according to the official organization hierarchy.
 */

import { UserRole, canAssignRole, hasPermission } from './roles';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  warning?: string;
}

/**
 * Validates if a user can assign a specific role to another user
 */
export function validateRoleAssignment(
  assignerRole: UserRole,
  targetRole: UserRole,
  targetUserId?: string,
  assignerUserId?: string
): ValidationResult {
  // Check if assigner has permission to manage users
  if (!hasPermission(assignerRole, 'canManageUsers')) {
    return {
      isValid: false,
      error: 'Only authorized administrators can assign or update roles'
    };
  }

  // Check if assigner can assign this specific role
  if (!canAssignRole(assignerRole, targetRole)) {
    return {
      isValid: false,
      error: 'Insufficient privileges to assign this role'
    };
  }

  // Prevent self-modification (except for SUPER_ADMIN)
  if (targetUserId && assignerUserId && targetUserId === assignerUserId) {
    if (assignerRole !== 'SUPER_ADMIN') {
      return {
        isValid: false,
        error: 'Cannot modify your own role'
      };
    } else {
      return {
        isValid: true,
        warning: 'Super Admin modifying their own role'
      };
    }
  }

  return { isValid: true };
}

/**
 * Validates if a user can perform a specific action based on their role
 */
export function validateRoleAction(
  userRole: UserRole,
  action: string,
  context?: any
): ValidationResult {
  const permissionMap: Record<string, keyof import('./roles').RolePermissions> = {
    'create_task': 'canCreateTasks',
    'assign_task': 'canAssignTasks',
    'view_all_tasks': 'canViewAllTasks',
    'manage_projects': 'canManageProjects',
    'manage_content': 'canManageContent',
    'view_analytics': 'canViewAnalytics',
    'manage_finance': 'canManageFinance',
    'manage_hr': 'canManageHR',
    'manage_procurement': 'canManageProcurement',
    'manage_inventory': 'canManageInventory',
    'send_messages': 'canSendMessages',
    'view_reports': 'canViewReports'
  };

  const permission = permissionMap[action];
  if (!permission) {
    return {
      isValid: false,
      error: `Unknown action: ${action}`
    };
  }

  if (!hasPermission(userRole, permission)) {
    return {
      isValid: false,
      error: `Role ${userRole} does not have permission to ${action.replace('_', ' ')}`
    };
  }

  return { isValid: true };
}

/**
 * Validates role hierarchy for organizational structure
 */
export function validateRoleHierarchy(roles: UserRole[]): ValidationResult {
  const hierarchy = [
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
    'USER'
  ];

  // Check if all roles are valid
  for (const role of roles) {
    if (!hierarchy.includes(role)) {
      return {
        isValid: false,
        error: `Invalid role: ${role}`
      };
    }
  }

  return { isValid: true };
}

/**
 * Gets role assignment restrictions for UI display
 */
export function getRoleRestrictions(userRole: UserRole): {
  canAssignRoles: UserRole[];
  cannotAssignRoles: UserRole[];
  reason: string;
} {
  const allRoles: UserRole[] = [
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
    'USER'
  ];

  if (!hasPermission(userRole, 'canManageUsers')) {
    return {
      canAssignRoles: [],
      cannotAssignRoles: allRoles,
      reason: 'Only authorized administrators can assign or update roles. Roles are hidden from general users.'
    };
  }

  const canAssignRoles = allRoles.filter(role => canAssignRole(userRole, role));
  const cannotAssignRoles = allRoles.filter(role => !canAssignRole(userRole, role));

  let reason = '';
  if (userRole === 'SUPER_ADMIN') {
    reason = 'Super Admin can assign any role';
  } else if (userRole === 'ADMIN') {
    reason = 'Admin can assign any role except Super Admin';
  } else {
    reason = 'Limited role assignment permissions';
  }

  return {
    canAssignRoles,
    cannotAssignRoles,
    reason
  };
}

/**
 * Validates role transition (changing from one role to another)
 */
export function validateRoleTransition(
  currentRole: UserRole,
  newRole: UserRole,
  assignerRole: UserRole
): ValidationResult {
  // First validate the assignment itself
  const assignmentValidation = validateRoleAssignment(assignerRole, newRole);
  if (!assignmentValidation.isValid) {
    return assignmentValidation;
  }

  // Check for sensitive transitions
  const sensitiveTransitions = [
    { from: 'USER', to: 'ADMIN', warning: 'Elevating user to Admin level' },
    { from: 'USER', to: 'SUPER_ADMIN', warning: 'Elevating user to Super Admin level' },
    { from: 'FIELD_OFFICER', to: 'ADMIN', warning: 'Elevating Field Officer to Admin level' },
    { from: 'HR', to: 'SUPER_ADMIN', warning: 'Elevating HR to Super Admin level' },
    { from: 'FINANCE', to: 'SUPER_ADMIN', warning: 'Elevating Finance to Super Admin level' }
  ];

  const transition = sensitiveTransitions.find(
    t => t.from === currentRole && t.to === newRole
  );

  if (transition) {
    return {
      isValid: true,
      warning: transition.warning
    };
  }

  // Check for demotions
  const hierarchy = [
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
    'USER'
  ];

  const currentIndex = hierarchy.indexOf(currentRole);
  const newIndex = hierarchy.indexOf(newRole);

  if (newIndex > currentIndex) {
    return {
      isValid: true,
      warning: `Demoting from ${currentRole} to ${newRole}`
    };
  }

  return { isValid: true };
}

/**
 * Audit log for role changes
 */
export interface RoleAuditLog {
  userId: string;
  userName: string;
  userEmail: string;
  previousRole: UserRole;
  newRole: UserRole;
  changedBy: string;
  changedByRole: UserRole;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  reason?: string;
  validationWarnings?: string[];
}

/**
 * Creates an audit log entry for role changes
 */
export function createRoleAuditLog(
  change: Omit<RoleAuditLog, 'timestamp'>
): RoleAuditLog {
  return {
    ...change,
    timestamp: new Date()
  };
}

/**
 * Validates bulk role assignments
 */
export function validateBulkRoleAssignment(
  assignerRole: UserRole,
  assignments: Array<{ userId: string; newRole: UserRole }>
): ValidationResult {
  if (!hasPermission(assignerRole, 'canManageUsers')) {
    return {
      isValid: false,
      error: 'Only authorized administrators can perform bulk role assignments'
    };
  }

  const errors: string[] = [];
  const warnings: string[] = [];

  for (const assignment of assignments) {
    const validation = validateRoleAssignment(assignerRole, assignment.newRole);
    if (!validation.isValid) {
      errors.push(`User ${assignment.userId}: ${validation.error}`);
    }
    if (validation.warning) {
      warnings.push(`User ${assignment.userId}: ${validation.warning}`);
    }
  }

  if (errors.length > 0) {
    return {
      isValid: false,
      error: `Bulk assignment failed: ${errors.join('; ')}`
    };
  }

  if (warnings.length > 0) {
    return {
      isValid: true,
      warning: `Bulk assignment completed with warnings: ${warnings.join('; ')}`
    };
  }

  return { isValid: true };
}
