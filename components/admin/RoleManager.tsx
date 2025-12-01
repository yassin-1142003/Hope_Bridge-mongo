/**
 * Role Manager Component
 * 
 * Official role management interface for authorized administrators only.
 * Roles are hidden from general users and can only be assigned/updated by admins.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Users, 
  ChevronDown, 
  Search, 
  Edit, 
  Save, 
  X, 
  AlertTriangle,
  CheckCircle,
  User as UserIcon,
  Crown,
  Building,
  Briefcase,
  Clipboard,
  DollarSign,
  ShoppingCart,
  Package,
  ChartBar,
  MapPin,
  Calculator
} from 'lucide-react';

import { 
  UserRole, 
  User, 
  ROLE_DISPLAY_NAMES, 
  ROLE_HIERARCHY, 
  canAssignRole,
  hasPermission 
} from '@/lib/roles';

interface RoleManagerProps {
  currentUserRole: UserRole;
  onRoleUpdate?: (userId: string, newRole: UserRole) => Promise<void>;
}

// Role icons for visual hierarchy
const ROLE_ICONS: Record<UserRole, React.ReactNode> = {
  SUPER_ADMIN: <Crown className="w-4 h-4" />,
  ADMIN: <Shield className="w-4 h-4" />,
  GENERAL_MANAGER: <Building className="w-4 h-4" />,
  PROGRAM_MANAGER: <Briefcase className="w-4 h-4" />,
  PROJECT_COORDINATOR: <Users className="w-4 h-4" />,
  HR: <Clipboard className="w-4 h-4" />,
  FINANCE: <DollarSign className="w-4 h-4" />,
  PROCUREMENT: <ShoppingCart className="w-4 h-4" />,
  STOREKEEPER: <Package className="w-4 h-4" />,
  ME_OFFICER: <ChartBar className="w-4 h-4" />,
  FIELD_OFFICER: <MapPin className="w-4 h-4" />,
  ACCOUNTANT: <Calculator className="w-4 h-4" />,
  USER: <UserIcon className="w-4 h-4" />
};

// Role descriptions
const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  SUPER_ADMIN: 'Full system access and user management',
  ADMIN: 'Full system access and user management',
  GENERAL_MANAGER: 'Manage all departments and assign tasks to any user',
  PROGRAM_MANAGER: 'Manage programs and assign tasks to project coordinators and field teams',
  PROJECT_COORDINATOR: 'Manage tasks within projects and assign to field staff',
  HR: 'Manage HR workflows, staff records, and HR-specific tasks',
  FINANCE: 'Manage financial tasks and approvals',
  PROCUREMENT: 'Manage purchase requests and procurement workflows',
  STOREKEEPER: 'Manage stock tasks and inventory documentation',
  ME_OFFICER: 'Perform monitoring, evaluation, and data submissions',
  FIELD_OFFICER: 'Receive field assignments and submit reports',
  ACCOUNTANT: 'Handle accounting workflows and financial document submissions',
  USER: 'Basic user access'
};

const RoleManager: React.FC<RoleManagerProps> = ({ 
  currentUserRole, 
  onRoleUpdate 
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>('USER');
  const [updating, setUpdating] = useState(false);

  // Check if current user can manage roles
  const canManageRoles = hasPermission(currentUserRole, 'canManageUsers');

  useEffect(() => {
    if (canManageRoles) {
      fetchUsers();
    }
  }, [canManageRoles]);

  useEffect(() => {
    applyFilters();
  }, [users, searchQuery]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...users];
    
    if (searchQuery) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredUsers(filtered);
  };

  const handleRoleUpdate = async (userId: string, newRole: UserRole) => {
    if (!canManageRoles) {
      return;
    }

    try {
      setUpdating(true);
      
      // Call the provided callback or make API call
      if (onRoleUpdate) {
        await onRoleUpdate(userId, newRole);
      } else {
        const response = await fetch(`/api/users/${userId}/role`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: newRole })
        });
        
        if (!response.ok) {
          throw new Error('Failed to update role');
        }
      }
      
      // Refresh users list
      await fetchUsers();
      setEditingUserId(null);
      
    } catch (error) {
      console.error('Failed to update role:', error);
    } finally {
      setUpdating(false);
    }
  };

  const startEditing = (user: User) => {
    if (!canManageRoles || !canAssignRole(currentUserRole, user.role)) {
      return;
    }
    
    setEditingUserId(user.id);
    setSelectedRole(user.role);
  };

  const cancelEditing = () => {
    setEditingUserId(null);
    setSelectedRole('USER');
  };

  const saveRole = (userId: string) => {
    if (!canAssignRole(currentUserRole, selectedRole)) {
      return;
    }
    
    handleRoleUpdate(userId, selectedRole);
  };

  if (!canManageRoles) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Restricted</h3>
        <p className="text-gray-600">
          Only authorized administrators can manage user roles.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Role Management</h2>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="w-4 h-4" />
            <span>{filteredUsers.length} users</span>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users by name or email..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Users List */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-600">
              {searchQuery ? 'Try adjusting your search' : 'No users available'}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    {editingUserId === user.id ? (
                      <div className="flex items-center gap-2">
                        <select
                          value={selectedRole}
                          onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          aria-label={`Select new role for ${user.name}`}
                          title={`Select new role for ${user.name}`}
                        >
                          {ROLE_HIERARCHY.map((role) => (
                            <option key={role} value={role}>
                              {ROLE_DISPLAY_NAMES[role]}
                            </option>
                          ))}
                        </select>
                        
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => saveRole(user.id)}
                            disabled={updating || !canAssignRole(currentUserRole, selectedRole)}
                            className="p-1 text-green-600 hover:text-green-700 disabled:opacity-50"
                            title="Save role"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="p-1 text-gray-600 hover:text-gray-700"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-800">
                          {ROLE_ICONS[user.role]}
                          <span>{ROLE_DISPLAY_NAMES[user.role]}</span>
                        </div>
                      </div>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {user.department || '—'}
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      user.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${
                        user.isActive ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {editingUserId !== user.id && (
                        <button
                          onClick={() => startEditing(user)}
                          disabled={!canAssignRole(currentUserRole, user.role)}
                          className="p-1 text-gray-400 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Edit role"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                      
                      {!canAssignRole(currentUserRole, user.role) && (
                        <div className="group relative">
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            Cannot modify this role
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Role Legend */}
      <div className="p-6 border-t border-gray-200 bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Official Role Hierarchy</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {ROLE_HIERARCHY.map((role) => (
            <div key={role} className="flex items-center gap-2 text-sm">
              <div className="text-gray-600">
                {ROLE_ICONS[role]}
              </div>
              <div>
                <div className="font-medium text-gray-900">
                  {ROLE_DISPLAY_NAMES[role]}
                </div>
                <div className="text-xs text-gray-500">
                  {ROLE_DESCRIPTIONS[role]}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RoleManager;
