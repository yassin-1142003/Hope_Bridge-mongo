"use client";
import React from "react";
import { motion, AnimatePresence } from 'framer-motion';
import EnhancedTaskForm from "@/components/EnhancedTaskForm";
import EnhancedTaskCard from "@/components/EnhancedTaskCard";
import { EnhancedTaskService, type TaskFilters, type TaskAnalytics } from '@/lib/services/EnhancedTaskService';
import { authManager } from '@/lib/auth-enhanced';
import { notificationManager } from '@/lib/notifications/NotificationManager';
import { errorHandler } from '@/lib/errorHandling/ErrorHandler';
import { useLoadingState, useDebouncedValue, useInfiniteScroll } from '@/hooks/usePerformanceOptimizations';
import { AdvancedSearch, SearchSuggestions } from '@/components/search/AdvancedSearch';
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';
import { 
  EnhancedButton, 
  EnhancedCard, 
  EnhancedInput, 
  LoadingSpinner,
  EnhancedAlert,
  EnhancedBadge 
} from '@/components/ui/enhanced-components';
import { 
  Search, 
  Filter, 
  Plus, 
  Edit2, 
  Trash2, 
  Calendar, 
  User as UserIcon,
  Clock,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  BarChart3,
  Bell,
  Settings
} from 'lucide-react';
import type { User as UserType, UserRole } from '@/lib/roles';
import { getClientSession } from '@/lib/auth-client';

// Static data for employees with roles
const employees = [
  { id: "1", name: "Ahmed Hassan", email: "ahmed@company.com", role: "ADMIN" as UserRole },
  { id: "2", name: "Sara Mohamed", email: "sara@company.com", role: "PROJECT_COORDINATOR" as UserRole },
  { id: "3", name: "Omar Ali", email: "omar@company.com", role: "FIELD_OFFICER" as UserRole },
  { id: "4", name: "Fatima Ibrahim", email: "fatima@company.com", role: "HR" as UserRole },
];

const TaskManagerClient = ({ isArabic }: { isArabic: boolean }) => {
  // Enhanced services
  const taskService = new EnhancedTaskService();
  
  // State management
  const [tasks, setTasks] = React.useState<any[]>([]);
  const [users, setUsers] = React.useState<UserType[]>([]);
  const [session, setSession] = React.useState<any>(null);
  const [showAnalytics, setShowAnalytics] = React.useState(false);
  const [selectedTask, setSelectedTask] = React.useState<any>(null);
  const [showTaskDetails, setShowTaskDetails] = React.useState(false);
  const [notifications, setNotifications] = React.useState([]);
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  
  // Search and filters
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filters, setFilters] = React.useState<TaskFilters>({});
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const debouncedQuery = useDebouncedValue(searchQuery, 300);
  
  // Loading states
  const loadingState = useLoadingState('Loading tasks...');
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  
  // Analytics data
  const [analytics, setAnalytics] = React.useState<TaskAnalytics | null>(null);
  
  // Infinite scroll for large datasets
  const {
    data: infiniteTasks,
    isLoading: isLoadingMore,
    hasMore,
    loadMore,
    reset: resetInfiniteScroll,
    lastElementRef
  } = useInfiniteScroll(
    async (page) => {
      const filteredTasks = await taskService.getFilteredTasks({
        ...filters,
        search: debouncedQuery
      });
      const startIndex = (page - 1) * 20;
      return filteredTasks.slice(startIndex, startIndex + 20);
    },
    { pageSize: 20 }
  );

  // Get session on component mount
  // Initialize session and subscriptions
  React.useEffect(() => {
    const currentSession = getClientSession();
    setSession(currentSession);
    
    // Subscribe to auth changes
    const unsubscribeAuth = authManager.subscribe((authState) => {
      setSession(authState.session);
      if (!authState.isAuthenticated) {
        // Handle logout
        setTasks([]);
        setUsers([]);
      }
    });
  }, []);

  React.useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, []);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const result = await taskService.getAllTasks();
      setTasks(result);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      errorHandler.handleError(error as Error, { operation: 'fetchTasks' });
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced data fetching functions
  const fetchUsers = async () => {
    try {
      loadingState.startLoading('Loading users...');
      const result = await taskService.getUsers({ isActive: true });
      setUsers(result);
    } catch (error) {
      errorHandler.handleError(error as Error, { operation: 'fetchUsers' });
    } finally {
      loadingState.stopLoading();
    }
  };

  const fetchAnalytics = async () => {
    try {
      const analyticsData = await taskService.getTaskAnalytics();
      setAnalytics(analyticsData);
    } catch (error) {
      errorHandler.handleError(error as Error, { operation: 'fetchAnalytics' });
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        fetchUsers(),
        fetchAnalytics(),
        resetInfiniteScroll()
      ]);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSearch = (searchFilters: any) => {
    // Convert SearchFilters to TaskFilters format
    const taskFilters: TaskFilters = {
      search: searchFilters.search,
      status: searchFilters.status?.[0] as any, // Convert array to single value
      priority: searchFilters.priority?.[0] as any,
      assignedTo: searchFilters.assignedTo?.[0],
      tags: searchFilters.tags,
      categories: searchFilters.categories
    };
    setFilters(taskFilters);
    resetInfiniteScroll();
  };

  const handleClearSearch = () => {
    setFilters({});
    setSearchQuery('');
    resetInfiniteScroll();
  };

  const handleCreateTask = async (taskData: any, files: File[]) => {
    try {
      loadingState.startLoading('Creating task...');
      
      const newTask = await taskService.createTask({
        ...taskData,
        files,
        createdBy: session?.user?.email || 'unknown'
      });
      
      // Send notification to assigned user
      if (taskData.assignedTo && taskData.assignedTo !== session?.user?.email) {
        await notificationManager.notifyTaskAssigned(
          taskData.title,
          taskData.assignedTo,
          users.find(u => u.email === taskData.assignedTo)?.name || 'Unknown'
        );
      }
      
      resetInfiniteScroll();
    } catch (error) {
      errorHandler.handleError(error as Error, { operation: 'createTask' });
    } finally {
      loadingState.stopLoading();
    }
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<any>) => {
    try {
      loadingState.startLoading('Updating task...');
      await taskService.updateTask(taskId, updates);
      
      // Send notification for status changes
      if (updates.status === 'completed') {
        const task = infiniteTasks.find(t => t._id === taskId);
        if (task) {
          await notificationManager.notifyTaskCompleted(
            task.title,
            task.assignedTo,
            users.find(u => u.email === task.assignedTo)?.name || 'Unknown'
          );
        }
      }
      
      resetInfiniteScroll();
    } catch (error) {
      errorHandler.handleError(error as Error, { operation: 'updateTask' });
    } finally {
      loadingState.stopLoading();
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      loadingState.startLoading('Deleting task...');
      await taskService.deleteTask(taskId);
      resetInfiniteScroll();
    } catch (error) {
      errorHandler.handleError(error as Error, { operation: 'deleteTask' });
    } finally {
      loadingState.stopLoading();
    }
  };

  const handleBulkActions = async (action: 'complete' | 'delete', taskIds: string[]) => {
    try {
      loadingState.startLoading(`Bulk ${action}...`);
      
      if (action === 'complete') {
        await taskService.bulkUpdateTasks(taskIds, { status: 'completed' });
      } else {
        await taskService.bulkDeleteTasks(taskIds);
      }
      
      resetInfiniteScroll();
    } catch (error) {
      errorHandler.handleError(error, { operation: 'bulkAction', action, taskIds });
    } finally {
      loadingState.stopLoading();
    }
  };

  const getTaskStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {isArabic ? "إدارة المهام" : "Task Management"}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {isArabic ? "مرحباً" : "Welcome"}, {session?.user?.name || session?.user?.email}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <div className="relative">
              <EnhancedButton variant="outline" size="sm">
                <Bell className="w-4 h-4" />
                {notifications.filter(n => !n.read).length > 0 && (
                  <EnhancedBadge dot variant="destructive" className="absolute -top-1 -right-1" />
                )}
              </EnhancedButton>
            </div>
            
            {/* Analytics Toggle */}
            <EnhancedButton
              variant={showAnalytics ? "secondary" : "outline"}
              size="sm"
              onClick={() => setShowAnalytics(!showAnalytics)}
            >
              <BarChart3 className="w-4 h-4" />
              {showAnalytics ? "Tasks" : "Analytics"}
            </EnhancedButton>
            
            {/* Refresh */}
            <EnhancedButton
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              loading={isRefreshing}
            >
              <RefreshCw className="w-4 h-4" />
            </EnhancedButton>
          </div>
        </div>

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6"
            >
              <EnhancedAlert
                variant="destructive"
                title="Error"
                description={error}
                closable
                onClose={() => setError(null)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Analytics Dashboard */}
        {showAnalytics && analytics && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-8"
          >
            <AnalyticsDashboard
              data={{
                overview: {
                  totalTasks: analytics.totalTasks,
                  completedTasks: analytics.completedTasks,
                  pendingTasks: analytics.pendingTasks,
                  overdueTasks: analytics.overdueTasks,
                  completionRate: analytics.completionRate,
                  averageCompletionTime: analytics.averageCompletionTime,
                  activeUsers: users.length,
                  totalUsers: users.length
                },
                tasksByStatus: Object.entries(analytics.tasksByStatus).map(([status, count]: [string, number]) => ({
                  name: status,
                  value: count,
                  color: status === 'completed' ? '#10b981' : 
                         status === 'pending' ? '#f59e0b' : 
                         status === 'in_progress' ? '#3b82f6' : '#ef4444'
                })),
                tasksByPriority: Object.entries(analytics.tasksByPriority).map(([priority, count]: [string, number]) => ({
                  name: priority,
                  value: count,
                  color: priority === 'low' ? '#10b981' : 
                         priority === 'medium' ? '#3b82f6' : 
                         priority === 'high' ? '#f59e0b' : '#ef4444'
                })),
                tasksByUser: users.slice(0, 5).map(user => ({
                  name: user.name,
                  completed: Math.floor(Math.random() * 20) + 5,
                  pending: Math.floor(Math.random() * 10) + 1,
                  overdue: Math.floor(Math.random() * 3)
                })),
                completionTrend: [],
                productivityMetrics: [],
                departmentPerformance: []
              }}
              onRefresh={handleRefresh}
            />
          </motion.div>
        )}

        {/* Search and Filters */}
        <AdvancedSearch
          onSearch={handleSearch}
          onClear={handleClearSearch}
          placeholder={isArabic ? "البحث في المهام..." : "Search tasks..."}
          options={{
            status: [
              { value: 'pending', label: 'Pending', count: analytics?.pendingTasks || 0 },
              { value: 'in_progress', label: 'In Progress', count: 0 },
              { value: 'completed', label: 'Completed', count: analytics?.completedTasks || 0 },
              { value: 'cancelled', label: 'Cancelled', count: 0 }
            ],
            priority: [
              { value: 'low', label: 'Low', count: analytics?.tasksByPriority.low || 0 },
              { value: 'medium', label: 'Medium', count: analytics?.tasksByPriority.medium || 0 },
              { value: 'high', label: 'High', count: analytics?.tasksByPriority.high || 0 },
              { value: 'urgent', label: 'Urgent', count: analytics?.tasksByPriority.urgent || 0 }
            ],
            users: users.map(user => ({
              value: user.email,
              label: user.name,
              count: 0
            })),
            tags: [],
            categories: []
          }}
          isArabic={isArabic}
        />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Task Creation Form */}
          <div className="lg:col-span-1">
            <EnhancedCard hover={false} className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5" />
                {isArabic ? "إنشاء مهمة جديدة" : "Create New Task"}
              </h2>
              
              <EnhancedTaskForm
                onSubmit={handleCreateTask}
                isLoading={loadingState.isLoading}
                isArabic={isArabic}
                employees={users}
                currentUserRole={(session?.user?.role as UserRole) || 'USER'}
              />
            </EnhancedCard>

            {/* Quick Stats */}
            {analytics && (
              <EnhancedCard hover={false} className="p-6 mt-6">
                <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Tasks</span>
                    <span className="font-semibold">{analytics.totalTasks}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Completion Rate</span>
                    <span className="font-semibold">{analytics.completionRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Overdue Tasks</span>
                    <span className="font-semibold text-red-600">{analytics.overdueTasks}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Active Users</span>
                    <span className="font-semibold">{users.length}</span>
                  </div>
                </div>
              </EnhancedCard>
            )}
          </div>

          {/* Tasks List */}
          <div className="lg:col-span-2">
            <EnhancedCard hover={false} className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  {isArabic ? "قائمة المهام" : "Tasks List"}
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {infiniteTasks.length} tasks
                  </span>
                  {loadingState.isLoading && (
                    <LoadingSpinner size="sm" />
                  )}
                </div>
              </div>

              {/* Tasks Grid */}
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {infiniteTasks.length === 0 && !loadingState.isLoading ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-600">
                      {isArabic ? "لا توجد مهام حالياً" : "No tasks available"}
                    </p>
                  </div>
                ) : (
                  infiniteTasks.map((task, index) => (
                    <motion.div
                      key={task._id}
                      ref={index === infiniteTasks.length - 1 ? lastElementRef : undefined}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-gray-900">{task.title}</h3>
                            <EnhancedBadge size="sm" className={getTaskStatusColor(task.status)}>
                              {task.status}
                            </EnhancedBadge>
                            <EnhancedBadge size="sm" className={getPriorityColor(task.priority)}>
                              {task.priority}
                            </EnhancedBadge>
                          </div>
                          
                          <p className="text-gray-600 text-sm mb-3">{task.description}</p>
                          
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <UserIcon className="w-3 h-3" />
                              {task.assignedToName || task.assignedTo}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(task.endDate).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Created {new Date(task.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          <EnhancedButton size="sm" variant="ghost">
                            <Edit2 className="w-4 h-4" />
                          </EnhancedButton>
                          <EnhancedButton size="sm" variant="ghost" className="text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </EnhancedButton>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
                
                {/* Load More */}
                {hasMore && (
                  <div className="text-center py-4">
                    <EnhancedButton
                      variant="outline"
                      onClick={loadMore}
                      loading={isLoadingMore}
                    >
                      Load More
                    </EnhancedButton>
                  </div>
                )}
              </div>
            </EnhancedCard>
          </div>
        </div>
      </div>
    </div>
  );
};

const page = ({ params }: { params: Promise<{ locale: string }> }) => {
  return <TaskManagerClient isArabic={false} />;
};

export default page;
