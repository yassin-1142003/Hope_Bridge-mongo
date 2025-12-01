import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

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
  const { data: session } = useSession();
  const [userTasks, setUserTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getUserRole = (): string | null => {
    return session?.user?.role || null;
  };

  const fetchUserTasks = async () => {
    if (!session?.user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/tasks/user/${session.user.id}`);
      
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
  }, [session?.user?.id]);

  return {
    userTasks,
    loading,
    error,
    refreshTasks,
    updateTaskStatus,
    getUserRole,
  };
};
