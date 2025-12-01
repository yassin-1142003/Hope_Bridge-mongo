'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: {
    id: string;
    name: string;
    role: string;
    email: string;
  };
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: Date;
  attachments?: {
    id: string;
    name: string;
    type: string;
    url: string;
  }[];
  createdBy: string;
  createdAt: Date;
}

interface UseRoleBasedTasksReturn {
  userTasks: Task[];
  loading: boolean;
  error: string | null;
  refreshTasks: () => void;
  updateTaskStatus: (taskId: string, status: Task['status']) => Promise<void>;
  getUserRole: () => string | null;
}

export const useRoleBasedTasks = (): UseRoleBasedTasksReturn => {
  const { user, token } = useAuth();
  const [userTasks, setUserTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getUserRole = (): string | null => {
    return user?.role || null;
  };

  const fetchUserTasks = async () => {
    if (!user?.id || !token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('DEBUG - useRoleBasedTasks token:', token ? token.substring(0, 20) + '...' : 'none');
      console.log('DEBUG - useRoleBasedTasks user.id:', user.id);

      const response = await fetch(`/api/tasks/user/${user.id}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }

      const tasks = await response.json();
      setUserTasks(tasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching user tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId: string, status: Task['status']) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task status');
      }

      // Update local state
      setUserTasks(prev => 
        prev.map(task => 
          task.id === taskId ? { ...task, status } : task
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
      throw err;
    }
  };

  const refreshTasks = () => {
    fetchUserTasks();
  };

  useEffect(() => {
    fetchUserTasks();
  }, [user?.id, token]);

  return {
    userTasks,
    loading,
    error,
    refreshTasks,
    updateTaskStatus,
    getUserRole,
  };
};
