<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Bell, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

interface TaskAlert {
  id: string;
  title: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'new' | 'pending' | 'in-progress' | 'completed';
  assignedTo: string;
  dueDate?: string;
}

const TaskAlertDashboard: React.FC = () => {
  const [alerts, setAlerts] = useState<TaskAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching task alerts
    const fetchAlerts = async () => {
      try {
        // Mock data - replace with actual API call
        const mockAlerts: TaskAlert[] = [
          {
            id: '1',
            title: 'Complete project documentation',
            priority: 'high',
            status: 'new',
            assignedTo: 'John Doe',
            dueDate: '2024-12-05'
          },
          {
            id: '2', 
            title: 'Review pull requests',
            priority: 'medium',
            status: 'pending',
            assignedTo: 'Jane Smith'
          },
          {
            id: '3',
            title: 'Update dependencies',
            priority: 'urgent',
            status: 'in-progress',
            assignedTo: 'Mike Johnson',
            dueDate: '2024-12-02'
          }
        ];
        
        setAlerts(mockAlerts);
      } catch (error) {
        console.error('Failed to fetch task alerts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <Bell className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'in-progress': return <AlertTriangle className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getAlertCount = (priority: string) => {
    return alerts.filter(alert => alert.priority === priority).length;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Urgent</p>
                <p className="text-2xl font-bold text-red-600">{getAlertCount('urgent')}</p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High</p>
                <p className="text-2xl font-bold text-orange-600">{getAlertCount('high')}</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Bell className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Medium</p>
                <p className="text-2xl font-bold text-yellow-600">{getAlertCount('medium')}</p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-blue-600">{alerts.length}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Alerts List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Task Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alerts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No task alerts at this time</p>
              </div>
            ) : (
              alerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${getPriorityColor(alert.priority)}`}>
                      {getStatusIcon(alert.status)}
                    </div>
                    <div>
                      <h4 className="font-medium">{alert.title}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>Assigned to: {alert.assignedTo}</span>
                        {alert.dueDate && (
                          <>
                            <span>•</span>
                            <span>Due: {alert.dueDate}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getPriorityColor(alert.priority)}>
                      {alert.priority}
                    </Badge>
                    <Badge variant="outline">
                      {alert.status}
                    </Badge>
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
=======
/**
 * Task Alert Dashboard Component
 * 
 * Professional dashboard with integrated real-time task alerts,
 * notification management, and comprehensive task monitoring.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import TaskAlertSystem from '@/components/notifications/TaskAlertSystem';
import { 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  TrendingUp,
  Users,
  Calendar,
  BarChart3,
  Activity,
  Settings
} from 'lucide-react';

interface DashboardStats {
  totalTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  overdueTasks: number;
  unreadNotifications: number;
  actionRequiredNotifications: number;
  todayTasks: number;
  weeklyTasks: number;
}

interface TaskAlertDashboardProps {
  userId?: string;
  userRole?: string;
  onTaskClick?: (taskId: string) => void;
  className?: string;
}

const TaskAlertDashboard: React.FC<TaskAlertDashboardProps> = ({
  userId,
  userRole,
  onTaskClick,
  className = ''
}) => {
  const [stats, setStats] = useState<DashboardStats>({
    totalTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
    unreadNotifications: 0,
    actionRequiredNotifications: 0,
    todayTasks: 0,
    weeklyTasks: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Fetch dashboard statistics
  const fetchStats = async () => {
    try {
      const [tasksResponse, notificationsResponse] = await Promise.all([
        fetch('/api/tasks', {
          headers: { 'Cache-Control': 'no-cache' }
        }),
        fetch('/api/notifications/tasks?limit=100&includeRead=false', {
          headers: { 'Cache-Control': 'no-cache' }
        })
      ]);

      const tasksData = await tasksResponse.json();
      const notificationsData = await notificationsResponse.json();

      if (tasksData.success) {
        const tasks = tasksData.data || [];
        const today = new Date();
        const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

        setStats(prev => ({
          ...prev,
          totalTasks: tasks.length,
          pendingTasks: tasks.filter((t: any) => t.status === 'pending').length,
          inProgressTasks: tasks.filter((t: any) => t.status === 'in_progress').length,
          completedTasks: tasks.filter((t: any) => t.status === 'completed').length,
          overdueTasks: tasks.filter((t: any) => 
            new Date(t.endDate) < today && t.status !== 'completed'
          ).length,
          todayTasks: tasks.filter((t: any) => {
            const taskDate = new Date(t.endDate);
            return taskDate.toDateString() === today.toDateString();
          }).length,
          weeklyTasks: tasks.filter((t: any) => {
            const taskDate = new Date(t.endDate);
            return taskDate >= today && taskDate <= weekFromNow;
          }).length
        }));
      }

      if (notificationsData.success) {
        const alerts = notificationsData.alerts || [];
        setStats(prev => ({
          ...prev,
          unreadNotifications: notificationsData.unreadCount || 0,
          actionRequiredNotifications: alerts.filter((a: any) => a.actionRequired).length
        }));
      }

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color, 
    trend, 
    subtitle 
  }: {
    title: string;
    value: number;
    icon: any;
    color: string;
    trend?: number;
    subtitle?: string;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      
      {trend !== undefined && (
        <div className="flex items-center mt-4 text-sm">
          <TrendingUp className={`w-4 h-4 mr-1 ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`} />
          <span className={trend >= 0 ? 'text-green-600' : 'text-red-600'}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
          <span className="text-gray-500 ml-1">from last week</span>
        </div>
      )}
    </motion.div>
  );

  // Helper function to get progress class based on percentage
  const getProgressClass = (percentage: number): string => {
    const rounded = Math.round(percentage / 5) * 5; // Round to nearest 5
    return `progress-${rounded}`;
  };

  // Pre-calculate ARIA values as constants to avoid expression parsing issues
  // Note: Microsoft Edge Tools may show false positive ARIA warnings due to JSX parsing limitations
  // TypeScript requires number type for ARIA progressbar attributes
  const pendingValueNow = Number(stats.pendingTasks) || 0;
  const pendingValueMin = 0;
  const pendingValueMax = Number(stats.totalTasks) || 0;

  const inProgressValueNow = Number(stats.inProgressTasks) || 0;
  const inProgressValueMin = 0;
  const inProgressValueMax = Number(stats.totalTasks) || 0;

  const completedValueNow = Number(stats.completedTasks) || 0;
  const completedValueMin = 0;
  const completedValueMax = Number(stats.totalTasks) || 0;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Alert System */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Task Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Real-time task monitoring and alerts
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <TaskAlertSystem
            userId={userId}
            userRole={userRole}
            onTaskClick={onTaskClick}
            onMarkAllRead={() => fetchStats()}
          />
          
          <button
            onClick={fetchStats}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Activity className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Tasks"
          value={stats.totalTasks}
          icon={BarChart3}
          color="bg-blue-500"
          subtitle="Active tasks"
        />
        
        <StatCard
          title="In Progress"
          value={stats.inProgressTasks}
          icon={Clock}
          color="bg-yellow-500"
          subtitle="Currently being worked on"
        />
        
        <StatCard
          title="Completed"
          value={stats.completedTasks}
          icon={CheckCircle}
          color="bg-green-500"
          subtitle="Successfully finished"
        />
        
        <StatCard
          title="Overdue"
          value={stats.overdueTasks}
          icon={AlertCircle}
          color="bg-red-500"
          subtitle="Need immediate attention"
        />
      </div>

      {/* Alert Statistics */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            Alert Summary
          </h2>
          <span className="text-xs text-gray-500">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unread Alerts</p>
                <p className="text-xl font-bold text-blue-600">{stats.unreadNotifications}</p>
              </div>
              <Bell className="w-8 h-8 text-blue-500 opacity-20" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Action Required</p>
                <p className="text-xl font-bold text-red-600">{stats.actionRequiredNotifications}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500 opacity-20" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today's Tasks</p>
                <p className="text-xl font-bold text-green-600">{stats.todayTasks}</p>
              </div>
              <Calendar className="w-8 h-8 text-green-500 opacity-20" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Task Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Status Distribution</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Pending</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{stats.pendingTasks}</span>
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className={`progress-bar-fill progress-bar-pending ${getProgressClass(stats.totalTasks > 0 ? (stats.pendingTasks / stats.totalTasks) * 100 : 0)}`}
                    role="progressbar"
                    aria-valuenow={pendingValueNow} // Edge Tools may show false positive - this is correct number usage
                    aria-valuemin={pendingValueMin}
                    aria-valuemax={pendingValueMax}
                    aria-label={`Pending tasks: ${stats.pendingTasks} of ${stats.totalTasks}`}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-gray-700">In Progress</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{stats.inProgressTasks}</span>
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className={`progress-bar-fill progress-bar-in-progress ${getProgressClass(stats.totalTasks > 0 ? (stats.inProgressTasks / stats.totalTasks) * 100 : 0)}`}
                    role="progressbar"
                    aria-valuenow={inProgressValueNow}
                    aria-valuemin={inProgressValueMin}
                    aria-valuemax={inProgressValueMax}
                    aria-label={`In progress tasks: ${stats.inProgressTasks} of ${stats.totalTasks}`}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{stats.completedTasks}</span>
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className={`progress-bar-fill progress-bar-completed ${getProgressClass(stats.totalTasks > 0 ? (stats.completedTasks / stats.totalTasks) * 100 : 0)}`}
                    role="progressbar"
                    aria-valuenow={completedValueNow}
                    aria-valuemin={completedValueMin}
                    aria-valuemax={completedValueMax}
                    aria-label={`Completed tasks: ${stats.completedTasks} of ${stats.totalTasks}`}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Tasks</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-gray-700">Today</span>
              </div>
              <span className="text-sm font-medium text-blue-600">{stats.todayTasks}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-500" />
                <span className="text-sm text-gray-700">This Week</span>
              </div>
              <span className="text-sm font-medium text-indigo-600">{stats.weeklyTasks}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-sm text-gray-700">Overdue</span>
              </div>
              <span className="text-sm font-medium text-red-600">{stats.overdueTasks}</span>
            </div>
          </div>
          
          {stats.overdueTasks > 0 && (
            <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm text-red-800">
                <strong>⚠️ Action Required:</strong> You have {stats.overdueTasks} overdue task(s) that need immediate attention.
              </p>
            </div>
          )}
        </motion.div>
      </div>
>>>>>>> 2efbb4e38f6799641e973bb9be8bca702baa4001
    </div>
  );
};

export default TaskAlertDashboard;
