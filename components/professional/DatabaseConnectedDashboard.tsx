'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AwesomeDashboardForm from '@/components/ui/AwesomeDashboardForm';
import '../styles/awesome-dashboard.css';
import { 
  Calendar, 
  Clock, 
  Users, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  BarChart3,
  Filter,
  Search,
  Plus,
  Edit3,
  Trash2,
  Archive,
  Star,
  Flag,
  MessageSquare,
  Paperclip,
  User,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Download,
  Upload,
  RefreshCw,
  Settings,
  Bell,
  Zap,
  Target,
  Award,
  Activity,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Share2,
  Link2,
  Copy,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Heart,
  Shield,
  Crown,
  Rocket,
  Flame
} from 'lucide-react';

// Database Task Interface
interface DatabaseTask {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'active' | 'in_progress' | 'review' | 'completed' | 'cancelled' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'urgent' | 'critical';
  category: string;
  tags: string[];
  assignedToId: string;
  createdById: string;
  assignedTo: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: string;
    department: string;
    performance: number;
    availability: 'available' | 'busy' | 'offline';
  };
  createdBy: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  dueDate: Date;
  progress: number;
  budget?: number;
  actualCost?: number;
  attachments: {
    id: string;
    name: string;
    type: string;
    url: string;
  }[];
  comments: {
    id: string;
    content: string;
    author: string;
    authorAvatar?: string;
    createdAt: Date;
    mentions: string[];
  }[];
  subtasks: {
    id: string;
    title: string;
    completed: boolean;
    assignedTo: string;
  }[];
  timeTracking: {
    entries: {
      id: string;
      user: string;
      startTime: Date;
      endTime?: Date;
      duration: number;
      description: string;
      billable: boolean;
    }[];
    total: number;
    billable: number;
  };
  approvals: {
    type: string;
    required: number;
    received: number;
    status: 'pending' | 'approved' | 'rejected';
    approvers: {
      id: string;
      name: string;
      status: 'pending' | 'approved' | 'rejected';
      comment?: string;
      timestamp?: Date;
    }[];
  }[];
}

const DatabaseConnectedDashboard: React.FC = () => {
  const [tasks, setTasks] = useState<DatabaseTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'kanban' | 'list' | 'calendar' | 'gantt' | 'timeline'>('kanban');
  const [filters, setFilters] = useState({
    status: [] as string[],
    priority: [] as string[],
    category: [] as string[],
    assignedTo: [] as string[],
    dateRange: { start: null as Date | null, end: null as Date | null },
    tags: [] as string[]
  });
  const [sortBy, setSortBy] = useState<'priority' | 'dueDate' | 'progress' | 'created' | 'updated'>('priority');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeTask, setActiveTask] = useState<DatabaseTask | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showTeamView, setShowTeamView] = useState(false);
  const [showTimeTracking, setShowTimeTracking] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Fetch current user session
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch('/api/auth/session');
        if (response.ok) {
          const session = await response.json();
          setCurrentUser(session.user);
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };
    fetchCurrentUser();
  }, []);

  // Fetch all tasks from database
  const fetchTasks = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all tasks that are visible to current user
      const response = await fetch('/api/tasks');
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      
      const allTasks = await response.json();
      
      // Filter tasks based on user permissions
      const visibleTasks = allTasks.filter((task: DatabaseTask) => {
        // User can see tasks they created, are assigned to, or if they're admin/manager
        return task.assignedToId === currentUser.id || 
               task.createdById === currentUser.id ||
               ['admin', 'manager'].includes(currentUser.role || '');
      });
      
      setTasks(visibleTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Fetch tasks when component mounts or user changes
  useEffect(() => {
    if (currentUser) {
      fetchTasks();
    }
  }, [currentUser, fetchTasks]);

  // Auto-refresh tasks every 30 seconds
  useEffect(() => {
    if (!currentUser) return;
    
    const interval = setInterval(fetchTasks, 30000);
    return () => clearInterval(interval);
  }, [currentUser, fetchTasks]);

  // Helper functions
  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800 border-gray-300',
      active: 'bg-blue-100 text-blue-800 border-blue-300',
      in_progress: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      review: 'bg-purple-100 text-purple-800 border-purple-300',
      completed: 'bg-green-100 text-green-800 border-green-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300',
      archived: 'bg-gray-100 text-gray-600 border-gray-300'
    };
    return colors[status as keyof typeof colors] || colors.draft;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-gray-100 text-gray-700 border-gray-300',
      medium: 'bg-blue-100 text-blue-700 border-blue-300',
      high: 'bg-orange-100 text-orange-700 border-orange-300',
      urgent: 'bg-red-100 text-red-700 border-red-300',
      critical: 'bg-red-600 text-white border-red-700'
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  const getStatusDisplay = (status: string) => {
    const displays = {
      draft: '🔄 Draft',
      active: '🚀 Active', 
      in_progress: '⏳ In Progress',
      review: '👁️ Review',
      completed: '✅ Completed',
      cancelled: '❌ Cancelled',
      archived: '📦 Archived'
    };
    return displays[status as keyof typeof displays] || displays.draft;
  };

  const getPriorityDisplay = (priority: string) => {
    const displays = {
      low: '🟢 Low',
      medium: '🟡 Medium',
      high: '🟠 High', 
      urgent: '🔴 Urgent',
      critical: '🚨 Critical'
    };
    return displays[priority as keyof typeof displays] || displays.medium;
  };

  const getPriorityIcon = (priority: string) => {
    const icons = {
      low: <Flag className="w-3 h-3" />,
      medium: <Flag className="w-3 h-3" />,
      high: <AlertCircle className="w-3 h-3" />,
      urgent: <Zap className="w-3 h-3" />,
      critical: <Flame className="w-3 h-3" />
    };
    return icons[priority as keyof typeof icons] || icons.medium;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getPerformanceColor = (performance: number) => {
    if (performance >= 90) return 'text-green-600';
    if (performance >= 80) return 'text-blue-600';
    if (performance >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressClass = (percentage: number): string => {
    const rounded = Math.round(percentage / 5) * 5;
    return `progress-${rounded}`;
  };

  // Computed filtered and sorted tasks
  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks.filter(task => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        if (!task.title.toLowerCase().includes(searchLower) &&
            !task.description.toLowerCase().includes(searchLower) &&
            !task.tags.some(tag => tag.toLowerCase().includes(searchLower))) {
          return false;
        }
      }
      
      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(task.status)) {
        return false;
      }
      
      // Priority filter
      if (filters.priority.length > 0 && !filters.priority.includes(task.priority)) {
        return false;
      }
      
      // Category filter
      if (filters.category.length > 0 && !filters.category.includes(task.category)) {
        return false;
      }
      
      // Assigned to filter
      if (filters.assignedTo.length > 0 && !filters.assignedTo.includes(task.assignedToId)) {
        return false;
      }
      
      // Date range filter
      if (filters.dateRange.start && task.dueDate < filters.dateRange.start) {
        return false;
      }
      if (filters.dateRange.end && task.dueDate > filters.dateRange.end) {
        return false;
      }
      
      // Tags filter
      if (filters.tags.length > 0 && !filters.tags.some(tag => task.tags.includes(tag))) {
        return false;
      }
      
      return true;
    });
    
    // Sort tasks
    return filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { critical: 5, urgent: 4, high: 3, medium: 2, low: 1 };
          aValue = priorityOrder[a.priority as keyof typeof priorityOrder];
          bValue = priorityOrder[b.priority as keyof typeof priorityOrder];
          break;
        case 'dueDate':
          aValue = a.dueDate ? a.dueDate.getTime() : 0;
          bValue = b.dueDate ? b.dueDate.getTime() : 0;
          break;
        case 'progress':
          aValue = a.progress;
          bValue = b.progress;
          break;
        case 'created':
          aValue = a.createdAt.getTime();
          bValue = b.createdAt.getTime();
          break;
        case 'updated':
          aValue = a.updatedAt.getTime();
          bValue = b.updatedAt.getTime();
          break;
        default:
          return 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });
  }, [tasks, searchTerm, filters, sortBy, sortOrder]);

  // Database operations
  const handleCreateTask = async () => {
    try {
      // Navigate to task creation or open modal
      console.log('Creating new task...');
      // Implementation would depend on your routing/modal system
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<DatabaseTask>) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      
      if (response.ok) {
        // Refresh tasks
        fetchTasks();
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        // Refresh tasks
        fetchTasks();
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full"
        />
        <div className="ml-4 text-xl font-semibold text-gray-700">Loading tasks from database...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Database Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchTasks}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Rocket className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Database Connected Dashboard
              </h1>
              <div className="ml-4 px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-semibold rounded-full">
                LIVE
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                <span className="font-medium">{tasks.length}</span> tasks loaded
              </div>
              
              <button
                onClick={fetchTasks}
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                title="Refresh tasks"
                aria-label="Refresh tasks"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {currentUser?.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                </div>
                <span className="text-sm font-medium text-gray-700">{currentUser?.name || 'User'}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Database Connected Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AwesomeDashboardForm
          onSearch={(query) => setSearchTerm(query)}
          onFilter={(filters) => {
            console.log('Filters updated:', filters);
            setFilters(prev => ({ ...prev, ...filters }));
          }}
          onCreateTask={handleCreateTask}
        />
      </div>

      {/* Real-time Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{filteredAndSortedTasks.length}</p>
                <p className="text-xs text-gray-500 mt-1">From database</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">
                  {filteredAndSortedTasks.filter(t => t.status === 'in_progress').length}
                </p>
                <p className="text-xs text-gray-500 mt-1">Active work</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {filteredAndSortedTasks.filter(t => t.status === 'completed').length}
                </p>
                <p className="text-xs text-gray-500 mt-1">Done</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-3xl font-bold text-red-600 mt-2">
                  {filteredAndSortedTasks.filter(t => t.dueDate < new Date() && t.status !== 'completed').length}
                </p>
                <p className="text-xs text-gray-500 mt-1">Need attention</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks Display */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">All Tasks from Database</h2>
          
          {filteredAndSortedTasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
              <p className="text-gray-500">No tasks match your current filters or there are no tasks in the database.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAndSortedTasks.map((task) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                          {getPriorityDisplay(task.priority)}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                          {getStatusDisplay(task.status)}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-3">{task.description}</p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <User className="w-4 h-4" />
                          <span>{task.assignedTo.name}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{task.dueDate.toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>Created {task.createdAt.toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      {task.tags.length > 0 && (
                        <div className="flex items-center space-x-2 mt-3">
                          {task.tags.map((tag) => (
                            <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setActiveTask(task)}
                        className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                        title="View task details"
                        aria-label="View task details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleUpdateTask(task.id, { status: 'completed' })}
                        className="p-2 text-gray-600 hover:text-green-600 transition-colors"
                        title="Mark as complete"
                        aria-label="Mark as complete"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                        title="Delete task"
                        aria-label="Delete task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DatabaseConnectedDashboard;
