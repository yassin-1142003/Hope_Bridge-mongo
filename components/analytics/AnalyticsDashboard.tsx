// components/analytics/AnalyticsDashboard.tsx - Data visualization and analytics dashboard
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Calendar,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { EnhancedCard, EnhancedButton } from '@/components/ui/enhanced-components';
import { LoadingSpinner } from '@/components/ui/enhanced-components';
import { useCache } from '@/hooks/usePerformanceOptimizations';
import { cn } from '@/lib/utils';

export interface AnalyticsData {
  overview: {
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    overdueTasks: number;
    completionRate: number;
    averageCompletionTime: number;
    activeUsers: number;
    totalUsers: number;
  };
  tasksByStatus: Array<{ name: string; value: number; color: string }>;
  tasksByPriority: Array<{ name: string; value: number; color: string }>;
  tasksByUser: Array<{ name: string; completed: number; pending: number; overdue: number }>;
  completionTrend: Array<{ date: string; completed: number; created: number; rate: number }>;
  productivityMetrics: Array<{ day: string; tasks: number; hours: number; efficiency: number }>;
  departmentPerformance: Array<{ department: string; tasks: number; completionRate: number; avgTime: number }>;
}

export interface AnalyticsDashboardProps {
  data?: AnalyticsData;
  isLoading?: boolean;
  onRefresh?: () => void;
  onExport?: (format: 'pdf' | 'excel' | 'csv') => void;
  dateRange?: { start: string; end: string };
  onDateRangeChange?: (range: { start: string; end: string }) => void;
  className?: string;
  isArabic?: boolean;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  data,
  isLoading = false,
  onRefresh,
  onExport,
  dateRange,
  onDateRangeChange,
  className,
  isArabic = false
}) => {
  const [selectedMetric, setSelectedMetric] = useState<'overview' | 'trends' | 'productivity' | 'users'>('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mock data for demonstration
  const mockData: AnalyticsData = useMemo(() => ({
    overview: {
      totalTasks: 156,
      completedTasks: 89,
      pendingTasks: 45,
      overdueTasks: 22,
      completionRate: 57.1,
      averageCompletionTime: 3.2,
      activeUsers: 12,
      totalUsers: 18
    },
    tasksByStatus: [
      { name: 'Completed', value: 89, color: '#10b981' },
      { name: 'In Progress', value: 45, color: '#3b82f6' },
      { name: 'Pending', value: 22, color: '#f59e0b' },
      { name: 'Overdue', value: 0, color: '#ef4444' }
    ],
    tasksByPriority: [
      { name: 'Low', value: 34, color: '#10b981' },
      { name: 'Medium', value: 67, color: '#3b82f6' },
      { name: 'High', value: 45, color: '#f59e0b' },
      { name: 'Urgent', value: 10, color: '#ef4444' }
    ],
    tasksByUser: [
      { name: 'Ahmed Hassan', completed: 23, pending: 8, overdue: 2 },
      { name: 'Sara Mohamed', completed: 18, pending: 12, overdue: 3 },
      { name: 'Omar Ali', completed: 15, pending: 6, overdue: 1 },
      { name: 'Fatima Ibrahim', completed: 12, pending: 4, overdue: 0 },
      { name: 'Khalid Ahmed', completed: 21, pending: 15, overdue: 5 }
    ],
    completionTrend: [
      { date: '2024-01-01', completed: 12, created: 15, rate: 80.0 },
      { date: '2024-01-02', completed: 18, created: 20, rate: 90.0 },
      { date: '2024-01-03', completed: 15, created: 18, rate: 83.3 },
      { date: '2024-01-04', completed: 22, created: 25, rate: 88.0 },
      { date: '2024-01-05', completed: 19, created: 22, rate: 86.4 },
      { date: '2024-01-06', completed: 25, created: 28, rate: 89.3 },
      { date: '2024-01-07', completed: 20, created: 23, rate: 87.0 }
    ],
    productivityMetrics: [
      { day: 'Mon', tasks: 12, hours: 8, efficiency: 85.0 },
      { day: 'Tue', tasks: 15, hours: 8.5, efficiency: 88.2 },
      { day: 'Wed', tasks: 18, hours: 9, efficiency: 90.0 },
      { day: 'Thu', tasks: 14, hours: 7.5, efficiency: 93.3 },
      { day: 'Fri', tasks: 16, hours: 8, efficiency: 92.0 },
      { day: 'Sat', tasks: 8, hours: 4, efficiency: 80.0 },
      { day: 'Sun', tasks: 5, hours: 3, efficiency: 83.3 }
    ],
    departmentPerformance: [
      { department: 'Operations', tasks: 45, completionRate: 78.5, avgTime: 2.8 },
      { department: 'Projects', tasks: 38, completionRate: 82.4, avgTime: 3.1 },
      { department: 'HR', tasks: 25, completionRate: 92.0, avgTime: 2.2 },
      { department: 'Finance', tasks: 18, completionRate: 88.9, avgTime: 2.5 },
      { department: 'IT', tasks: 30, completionRate: 75.0, avgTime: 3.8 }
    ]
  }), []);

  const currentData = data || mockData;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh?.();
    } finally {
      setIsRefreshing(false);
    }
  };

  const MetricCard: React.FC<{
    title: string;
    value: string | number;
    change?: number;
    icon: React.ReactNode;
    color: string;
    trend?: 'up' | 'down';
  }> = ({ title, value, change, icon, color, trend }) => (
    <motion.div
      className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change !== undefined && (
            <div className={cn(
              "flex items-center gap-1 text-sm mt-1",
              trend === 'up' ? 'text-green-600' : 'text-red-600'
            )}>
              {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{change}% from last period</span>
            </div>
          )}
        </div>
        <div className={cn("p-3 rounded-lg", color)}>
          {icon}
        </div>
      </div>
    </motion.div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-gray-600">Track your team's performance and productivity</p>
        </div>
        
        <div className="flex items-center gap-3">
          {dateRange && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>{new Date(dateRange.start).toLocaleDateString()} - {new Date(dateRange.end).toLocaleDateString()}</span>
            </div>
          )}
          
          <EnhancedButton
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            loading={isRefreshing}
          >
            <RefreshCw className="w-4 h-4" />
          </EnhancedButton>
          
          <div className="relative">
            <EnhancedButton variant="outline" size="sm">
              <Download className="w-4 h-4" />
            </EnhancedButton>
            {/* Dropdown for export options */}
            <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10 hidden">
              <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm">
                Export as PDF
              </button>
              <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm">
                Export as Excel
              </button>
              <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm">
                Export as CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Tabs */}
      <div className="flex border-b border-gray-200">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'trends', label: 'Trends' },
          { id: 'productivity', label: 'Productivity' },
          { id: 'users', label: 'Users' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedMetric(tab.id as any)}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
              selectedMetric === tab.id
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Overview Tab */}
        {selectedMetric === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Total Tasks"
                value={currentData.overview.totalTasks}
                change={12}
                icon={<CheckCircle className="w-6 h-6 text-white" />}
                color="bg-blue-500"
                trend="up"
              />
              <MetricCard
                title="Completion Rate"
                value={`${currentData.overview.completionRate}%`}
                change={5.2}
                icon={<TrendingUp className="w-6 h-6 text-white" />}
                color="bg-green-500"
                trend="up"
              />
              <MetricCard
                title="Overdue Tasks"
                value={currentData.overview.overdueTasks}
                change={-8}
                icon={<AlertCircle className="w-6 h-6 text-white" />}
                color="bg-red-500"
                trend="down"
              />
              <MetricCard
                title="Avg. Completion Time"
                value={`${currentData.overview.averageCompletionTime} days`}
                change={-0.5}
                icon={<Clock className="w-6 h-6 text-white" />}
                color="bg-purple-500"
                trend="down"
              />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Tasks by Status */}
              <EnhancedCard className="p-6">
                <h3 className="text-lg font-semibold mb-4">Tasks by Status</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={currentData.tasksByStatus}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {currentData.tasksByStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </EnhancedCard>

              {/* Tasks by Priority */}
              <EnhancedCard className="p-6">
                <h3 className="text-lg font-semibold mb-4">Tasks by Priority</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={currentData.tasksByPriority}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </EnhancedCard>
            </div>
          </motion.div>
        )}

        {/* Trends Tab */}
        {selectedMetric === 'trends' && (
          <motion.div
            key="trends"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <EnhancedCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Completion Trend</h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={currentData.completionTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} />
                  <Line type="monotone" dataKey="created" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="rate" stroke="#f59e0b" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </EnhancedCard>
          </motion.div>
        )}

        {/* Productivity Tab */}
        {selectedMetric === 'productivity' && (
          <motion.div
            key="productivity"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <EnhancedCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Weekly Productivity</h3>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={currentData.productivityMetrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="tasks" stackId="1" stroke="#3b82f6" fill="#3b82f6" />
                  <Area type="monotone" dataKey="efficiency" stackId="2" stroke="#10b981" fill="#10b981" />
                </AreaChart>
              </ResponsiveContainer>
            </EnhancedCard>

            {/* Department Performance */}
            <EnhancedCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Department Performance</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={currentData.departmentPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="department" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completionRate" fill="#10b981" />
                  <Bar dataKey="tasks" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </EnhancedCard>
          </motion.div>
        )}

        {/* Users Tab */}
        {selectedMetric === 'users' && (
          <motion.div
            key="users"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <EnhancedCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">User Performance</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={currentData.tasksByUser}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completed" fill="#10b981" />
                  <Bar dataKey="pending" fill="#3b82f6" />
                  <Bar dataKey="overdue" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </EnhancedCard>

            {/* User Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <MetricCard
                title="Active Users"
                value={currentData.overview.activeUsers}
                icon={<Users className="w-6 h-6 text-white" />}
                color="bg-blue-500"
              />
              <MetricCard
                title="Total Users"
                value={currentData.overview.totalUsers}
                icon={<Users className="w-6 h-6 text-white" />}
                color="bg-purple-500"
              />
              <MetricCard
                title="Participation Rate"
                value={`${((currentData.overview.activeUsers / currentData.overview.totalUsers) * 100).toFixed(1)}%`}
                icon={<TrendingUp className="w-6 h-6 text-white" />}
                color="bg-green-500"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
