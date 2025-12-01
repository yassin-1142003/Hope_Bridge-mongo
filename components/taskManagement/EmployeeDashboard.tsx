/**
 * Employee Dashboard
 * 
 * Task management interface for regular users/employees
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, 
  Clock, 
  CheckCircle, 
  FileText, 
  AlertCircle, 
  Eye, 
  Upload,
  Calendar,
  User,
  Target,
  RefreshCw,
  Filter,
  Search,
  Download,
  Star
} from 'lucide-react';

import TaskFormSubmission from './TaskFormSubmission';
import TaskDetailView from './TaskDetailView';
import { UserRole } from '@/lib/roles';

interface Task {
  _id: string;
  title: string;
  description: string;
  assignedBy: string;
  assignedByName: string;
  assignedTo: string;
  assignedToName: string;
  assignedToRole: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'SUBMITTED' | 'COMPLETED' | 'CANCELLED';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  formData: {
    title: string;
    description: string;
    fields: any[];
    instructions?: string;
  };
  attachments: any[];
  responseFiles: any[];
  activities: any[];
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  completedAt?: string;
  dueDate?: string;
  category?: string;
  tags: string[];
  estimatedHours?: number;
  actualHours?: number;
  employeeResponse?: any;
}

interface Statistics {
  total: number;
  pending: number;
  inProgress: number;
  submitted: number;
  completed: number;
  cancelled: number;
  overdue: number;
}

const EmployeeDashboard: React.FC<{ currentUserRole: UserRole; currentUserId: string }> = ({ 
  currentUserRole, 
  currentUserId 
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskDetail, setShowTaskDetail] = useState<Task | null>(null);
  const [showTaskForm, setShowTaskForm] = useState<Task | null>(null);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    fetchTasks();
    fetchStatistics();
  }, [currentPage, sortBy, sortOrder, statusFilter, priorityFilter, searchQuery]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        sortBy,
        sortOrder,
        ...(statusFilter && { status: statusFilter }),
        ...(priorityFilter && { priority: priorityFilter }),
        ...(searchQuery && { search: searchQuery })
      });

      const response = await fetch(`/api/task-management?${params}`);
      if (response.ok) {
        const data = await response.json();
        setTasks(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await fetch('/api/task-management/statistics');
      if (response.ok) {
        const data = await response.json();
        setStatistics(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    }
  };

  const handleTaskSubmit = async (taskId: string, response: any, files: any[]) => {
    try {
      const submitResponse = await fetch(`/api/task-management/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operation: 'submit_response',
          response,
          uploadedFiles: files
        })
      });

      if (submitResponse.ok) {
        setShowTaskForm(null);
        fetchTasks();
        fetchStatistics();
      }
    } catch (error) {
      console.error('Failed to submit task:', error);
    }
  };

  const handleStatusUpdate = async (taskId: string, status: 'PENDING' | 'IN_PROGRESS' | 'CANCELLED') => {
    try {
      const response = await fetch(`/api/task-management/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operation: 'update_status',
          status
        })
      });

      if (response.ok) {
        fetchTasks();
        fetchStatistics();
      }
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800 border-green-300',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      high: 'bg-orange-100 text-orange-800 border-orange-300',
      urgent: 'bg-red-100 text-red-800 border-red-300'
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      PENDING: <Clock className="w-4 h-4" />,
      IN_PROGRESS: <RefreshCw className="w-4 h-4 animate-spin" />,
      SUBMITTED: <FileText className="w-4 h-4" />,
      COMPLETED: <CheckCircle className="w-4 h-4" />,
      CANCELLED: <AlertCircle className="w-4 h-4" />
    };
    return icons[status as keyof typeof icons] || icons.PENDING;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      PENDING: 'bg-gray-100 text-gray-800',
      IN_PROGRESS: 'bg-blue-100 text-blue-800',
      SUBMITTED: 'bg-purple-100 text-purple-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || colors.PENDING;
  };

  const isOverdue = (task: Task) => {
    if (!task.dueDate) return false;
    return new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED';
  };

  const canSubmitTask = (task: Task) => {
    return task.status === 'PENDING' || task.status === 'IN_PROGRESS';
  };

  const activeTasks = tasks.filter(task => 
    task.status !== 'COMPLETED' && task.status !== 'CANCELLED'
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Briefcase className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-600">
            {activeTasks.length} active tasks
          </div>
          <button
            onClick={fetchTasks}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <Briefcase className="w-6 h-6 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">{statistics.total}</span>
            </div>
            <h3 className="text-sm font-semibold text-gray-900">Total Tasks</h3>
            <p className="text-xs text-gray-600">All assigned tasks</p>
          </div>
          
          <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-6 h-6 text-yellow-600" />
              <span className="text-2xl font-bold text-gray-900">{statistics.pending}</span>
            </div>
            <h3 className="text-sm font-semibold text-gray-900">Pending</h3>
            <p className="text-xs text-gray-600">Tasks to start</p>
          </div>
          
          <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <FileText className="w-6 h-6 text-purple-600" />
              <span className="text-2xl font-bold text-gray-900">{statistics.submitted}</span>
            </div>
            <h3 className="text-sm font-semibold text-gray-900">Submitted</h3>
            <p className="text-xs text-gray-600">Awaiting review</p>
          </div>
          
          <div className="bg-green-50 rounded-xl p-6 border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <span className="text-2xl font-bold text-gray-900">{statistics.completed}</span>
            </div>
            <h3 className="text-sm font-semibold text-gray-900">Completed</h3>
            <p className="text-xs text-gray-600">Successfully finished</p>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label="Filter by task status"
            title="Filter by task status"
          >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label="Filter by task priority"
            title="Filter by task priority"
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
          
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Sort tasks by"
              title="Sort tasks by"
            >
              <option value="createdAt">Created Date</option>
              <option value="updatedAt">Updated Date</option>
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
              <option value="title">Title</option>
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-3 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center">
              <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading tasks...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="p-8 text-center">
              <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No tasks found</h3>
              <p className="text-gray-600">
                {searchQuery || statusFilter || priorityFilter 
                  ? 'Try adjusting your filters' 
                  : 'No tasks have been assigned to you yet'}
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Task
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tasks.map((task) => (
                  <motion.tr
                    key={task._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`hover:bg-gray-50 transition-colors ${
                      isOverdue(task) ? 'bg-red-50' : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900 cursor-pointer hover:text-blue-600"
                             onClick={() => setShowTaskDetail(task)}>
                          {task.title}
                        </div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {task.description}
                        </div>
                        {task.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {task.tags.slice(0, 2).map(tag => (
                              <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                                {tag}
                              </span>
                            ))}
                            {task.tags.length > 2 && (
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                                +{task.tags.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                          {task.assignedByName.charAt(0).toUpperCase()}
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {task.assignedByName}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                        {getStatusIcon(task.status)}
                        {task.status.replace('_', ' ')}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        {task.dueDate ? (
                          <div className={`font-medium ${isOverdue(task) ? 'text-red-600' : 'text-gray-900'}`}>
                            {new Date(task.dueDate).toLocaleDateString()}
                            {isOverdue(task) && (
                              <div className="text-red-600 text-xs flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                Overdue
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-gray-500">No due date</div>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setShowTaskDetail(task)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="View task details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {task.status === 'PENDING' && (
                          <button
                            onClick={() => handleStatusUpdate(task._id, 'IN_PROGRESS')}
                            className="p-1 text-blue-600 hover:text-blue-700 transition-colors"
                            title="Start task"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        )}
                        
                        {canSubmitTask(task) && (
                          <button
                            onClick={() => setShowTaskForm(task)}
                            className="p-1 text-green-600 hover:text-green-700 transition-colors"
                            title="Submit task"
                          >
                            <Upload className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-3 py-2 text-sm text-gray-700">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Task Detail View */}
      <AnimatePresence>
        {showTaskDetail && (
          <TaskDetailView
            task={showTaskDetail}
            onClose={() => setShowTaskDetail(null)}
            currentUserRole={currentUserRole}
          />
        )}
      </AnimatePresence>

      {/* Task Form Submission */}
      <AnimatePresence>
        {showTaskForm && canSubmitTask(showTaskForm) && (
          <TaskFormSubmission
            task={showTaskForm}
            onClose={() => setShowTaskForm(null)}
            onSubmit={handleTaskSubmit}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default EmployeeDashboard;
