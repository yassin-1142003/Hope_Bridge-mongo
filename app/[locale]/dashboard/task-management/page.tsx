/**
 * Task Management System Dashboard
 * 
 * Main dashboard that switches between GM and Employee views based on user role
 */

'use client';

import React, { useEffect, useState } from 'react';
import { getServerSession } from 'next-auth';
import { UserRole } from '@/lib/roles';
import GMDashboard from '@/components/taskManagement/GMDashboard';
import EmployeeDashboard from '@/components/taskManagement/EmployeeDashboard';
import { Briefcase, AlertCircle } from 'lucide-react';

interface TaskManagementPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

const TaskManagementPage: React.FC<TaskManagementPageProps> = ({ searchParams }) => {
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('USER');
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user session and set role
    const getUserSession = async () => {
      try {
        const session = await getServerSession();
        if (session?.user) {
          setCurrentUserRole(session.user.role as UserRole);
          setCurrentUserId(session.user.id);
        }
      } catch (error) {
        console.error('Failed to get user session:', error);
      } finally {
        setLoading(false);
      }
    };

    getUserSession();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Check if user has access to task management
  const hasAccess = currentUserRole !== 'USER';

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Restricted</h2>
          <p className="text-gray-600">
            You don't have permission to access the Task Management System.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <Briefcase className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Task Management System</h1>
              <p className="text-gray-600">
                {currentUserRole === 'GENERAL_MANAGER' || currentUserRole === 'SUPER_ADMIN' || currentUserRole === 'ADMIN'
                  ? 'Manage and monitor all tasks across the organization'
                  : 'View and complete your assigned tasks'}
              </p>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        {(currentUserRole === 'GENERAL_MANAGER' || currentUserRole === 'SUPER_ADMIN' || currentUserRole === 'ADMIN') ? (
          <GMDashboard currentUserRole={currentUserRole} />
        ) : (
          <EmployeeDashboard currentUserRole={currentUserRole} currentUserId={currentUserId} />
        )}
      </div>
    </div>
  );
};

export default TaskManagementPage;
