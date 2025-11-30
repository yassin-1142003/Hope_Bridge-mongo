/**
 * Professional Task List Component
 * 
 * Advanced task management interface with perfect UX,
 * professional design, and comprehensive functionality.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Plus, 
  Calendar, 
  User as UserIcon,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  MoreVertical,
  Edit,
  Trash2,
  ChevronDown,
  RefreshCw,
  Download,
  Eye,
  Bell
} from 'lucide-react';
import DatePicker from '@/components/ui/DatePicker';

// Simple toast implementation since react-hot-toast may not be installed
const toast = {
  success: (message: string) => console.log('✅ SUCCESS:', message),
  error: (message: string) => console.error('❌ ERROR:', message),
  loading: (message: string) => console.log('⏳ LOADING:', message)
};

interface Task {
  _id: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedToName?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  startDate: string;
  endDate: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  category: string;
  files?: any[];
  alertBeforeDue?: boolean;
  alertDays?: number;
}

interface TaskListProps {
  onTaskSelect?: (task: Task) => void;
  onTaskEdit?: (task: Task) => void;
  onTaskDelete?: (taskId: string) => void;
  onTaskCreate?: () => void;
  className?: string;
}

const TaskList: React.FC<TaskListProps> = ({
  onTaskSelect,
  onTaskEdit,
  onTaskDelete,
  onTaskCreate,
  className = ''
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'createdAt' | 'endDate' | 'priority' | 'title'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [tasksPerPage] = useState(10);

  // Filter states
  const [filters, setFilters] = useState<{
    status: string;
    priority: string;
    assignedTo: string;
    category: string;
    startDateRange: { start: string; end: string };
    tags: string[];
  }>({
    status: '',
    priority: '',
    assignedTo: '',
    category: '',
    startDateRange: { start: '', end: '' },
    tags: []
  });

  // Available options
  const [users, setUsers] = useState<Array<{ email: string; name: string }>>([]);
  const [categories] = useState([
    'general', 'development', 'design', 'marketing', 
    'finance', 'hr', 'operations', 'maintenance'
  ]);
  const [allTags, setAllTags] = useState<string[]>([]);

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [tasks, searchQuery, filters, sortBy, sortOrder]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: tasksPerPage.toString(),
        sortBy,
        sortOrder
      });

      // Add filters to params
      Object.entries(filters).forEach(([key, value]) => {
        if (key === 'startDateRange') {
          const dateRange = value as { start: string; end: string };
          if (dateRange.start) params.append('startDate', dateRange.start);
          if (dateRange.end) params.append('endDate', dateRange.end);
        } else if (value && Array.isArray(value)) {
          value.forEach(v => params.append(key, v));
        } else if (value) {
          params.append(key, String(value));
        }
      });

      const response = await fetch(`/api/tasks?${params}`);
      if (response.ok) {
        const data = await response.json();
        setTasks(data.data || []);
        
        // Extract all tags
        const tags = new Set<string>();
        data.data?.forEach((task: Task) => {
          task.tags?.forEach(tag => tags.add(tag));
        });
        setAllTags(Array.from(tags));
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...tasks];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(task => task.status === filters.status);
    }

    // Priority filter
    if (filters.priority) {
      filtered = filtered.filter(task => task.priority === filters.priority);
    }

    // Assigned to filter
    if (filters.assignedTo) {
      filtered = filtered.filter(task => task.assignedTo === filters.assignedTo);
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(task => task.category === filters.category);
    }

    // Date range filter
    if (filters.startDateRange.start) {
      filtered = filtered.filter(task => task.startDate >= filters.startDateRange.start);
    }
    if (filters.startDateRange.end) {
      filtered = filtered.filter(task => task.endDate <= filters.startDateRange.end);
    }

    // Tags filter
    if (filters.tags.length > 0) {
      filtered = filtered.filter(task =>
        filters.tags.some(tag => task.tags.includes(tag))
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy];
      let bValue: any = b[sortBy];

      if (sortBy === 'priority') {
        const priorityOrder = { low: 1, medium: 2, high: 3, urgent: 4 };
        aValue = priorityOrder[a.priority];
        bValue = priorityOrder[b.priority];
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredTasks(filtered);
  };

  const handleTaskSelect = (taskId: string) => {
    setSelectedTasks(prev =>
      prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleSelectAll = () => {
    if (selectedTasks.length === filteredTasks.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(filteredTasks.map(task => task._id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTasks.length === 0) return;

    try {
      const response = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operation: 'bulkDelete',
          taskIds: selectedTasks
        })
      });

      if (response.ok) {
        toast.success(`${selectedTasks.length} tasks deleted successfully`);
        setSelectedTasks([]);
        fetchTasks();
      } else {
        throw new Error('Failed to delete tasks');
      }
    } catch (error) {
      console.error('Bulk delete error:', error);
      toast.error('Failed to delete tasks');
    }
  };

  const exportTasks = () => {
    const csv = [
      ['Title', 'Status', 'Priority', 'Assigned To', 'Start Date', 'End Date', 'Category'],
      ...filteredTasks.map(task => [
        task.title,
        task.status,
        task.priority,
        task.assignedToName || task.assignedTo,
        task.startDate,
        task.endDate,
        task.category
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tasks-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
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
      pending: <Clock className="w-4 h-4" />,
      in_progress: <RefreshCw className="w-4 h-4 animate-spin" />,
      completed: <CheckCircle className="w-4 h-4" />,
      cancelled: <XCircle className="w-4 h-4" />
    };
    return icons[status as keyof typeof icons] || icons.pending;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  const isOverdue = (task: Task) => {
    return new Date(task.endDate) < new Date() && task.status !== 'completed';
  };

  const getDaysRemaining = (task: Task) => {
    const today = new Date();
    const dueDate = new Date(task.endDate);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Tasks</h2>
          <div className="flex items-center gap-3">
            {selectedTasks.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete ({selectedTasks.length})
              </button>
            )}
            
            <button
              onClick={exportTasks}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
              title="Export tasks to CSV"
              aria-label="Export tasks to CSV"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            
            <button
              onClick={fetchTasks}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              title="Refresh tasks"
              aria-label="Refresh tasks"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            
            <button
              onClick={onTaskCreate}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
              title="Create new task"
              aria-label="Create new task"
            >
              <Plus className="w-4 h-4" />
              New Task
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
                type="text"
                id="search-tasks"
                name="search-tasks"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks..."
                title="Search tasks by title, description, or tags"
                aria-label="Search tasks"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
          </div>
          
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 border rounded-lg transition-colors flex items-center gap-2 ${
                showFilters 
                  ? 'border-blue-500 bg-blue-50 text-blue-600' 
                  : 'border-gray-300 text-gray-700 hover:border-gray-400'
              }`}
              title="Toggle advanced filters"
              aria-label="Toggle advanced filters"
              aria-expanded={showFilters ? 'true' : 'false'}> {/* Edge Tools may show false positive due to JSX parsing limitations */}
              <Filter className="w-4 h-4" />
              Filters
              {Object.values(filters).some(v => 
                typeof v === 'string' ? v : Array.isArray(v) ? v.length > 0 : false
              ) && (
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              )}
            </button>
            
            <select
              id="sort-by"
              name="sort-by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              title="Sort tasks by"
              aria-label="Sort tasks by"
            >
              <option value="createdAt">Created Date</option>
              <option value="endDate">Due Date</option>
              <option value="priority">Priority</option>
              <option value="title">Title</option>
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-3 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
              title={`Sort order: ${sortOrder === 'asc' ? 'ascending' : 'descending'}`}
              aria-label={`Toggle sort order, currently ${sortOrder === 'asc' ? 'ascending' : 'descending'}`}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    id="filter-status"
                    name="filter-status"
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    title="Filter by status"
                    aria-label="Filter by status"
                  >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    id="filter-priority"
                    name="filter-priority"
                    value={filters.priority}
                    onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    title="Filter by priority"
                    aria-label="Filter by priority"
                  >
                    <option value="">All Priorities</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                  <select
                    id="filter-assigned-to"
                    name="filter-assigned-to"
                    value={filters.assignedTo}
                    onChange={(e) => setFilters(prev => ({ ...prev, assignedTo: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    title="Filter by assigned user"
                    aria-label="Filter by assigned user"
                  >
                    <option value="">All Users</option>
                    {users.map(user => (
                      <option key={user.email} value={user.email}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    id="filter-category"
                    name="filter-category"
                    value={filters.category}
                    onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    title="Filter by category"
                    aria-label="Filter by category"
                  >
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <DatePicker
                    value={filters.startDateRange.start}
                    onChange={(date) => setFilters(prev => ({
                      ...prev,
                      startDateRange: { ...prev.startDateRange, start: date }
                    }))}
                    placeholder="From date..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <DatePicker
                    value={filters.startDateRange.end}
                    onChange={(date) => setFilters(prev => ({
                      ...prev,
                      startDateRange: { ...prev.startDateRange, end: date }
                    }))}
                    placeholder="To date..."
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {allTags.slice(0, 8).map(tag => (
                      <button
                        key={tag}
                        onClick={() => {
                          if (filters.tags.includes(tag)) {
                            setFilters(prev => ({
                              ...prev,
                              tags: prev.tags.filter(t => t !== tag)
                            }));
                          } else {
                            setFilters(prev => ({
                              ...prev,
                              tags: [...prev.tags, tag]
                            }));
                          }
                        }}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                          filters.tags.includes(tag)
                            ? 'bg-blue-100 text-blue-800 border-blue-300'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setFilters({
                    status: '',
                    priority: '',
                    assignedTo: '',
                    category: '',
                    startDateRange: { start: '', end: '' },
                    tags: []
                  })}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                  title="Clear all filters"
                  aria-label="Clear all filters"
                >
                  Clear All Filters
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Task List */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center">
            <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading tasks...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No tasks found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || Object.values(filters).some(v => 
                typeof v === 'string' ? v : Array.isArray(v) ? v.length > 0 : false
              )
                ? 'Try adjusting your search or filters'
                : 'Create your first task to get started'
              }
            </p>
            {!searchQuery && !Object.values(filters).some(v => 
              typeof v === 'string' ? v : Array.isArray(v) ? v.length > 0 : false
            ) && (
              <button
                onClick={onTaskCreate}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                title="Create your first task"
                aria-label="Create your first task"
              >
                Create Task
              </button>
            )}
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedTasks.length === filteredTasks.length}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    title="Select all tasks"
                    aria-label="Select all tasks"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Task
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned To
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
              {filteredTasks.map((task) => (
                <motion.tr
                  key={task._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`hover:bg-gray-50 transition-colors ${
                    selectedTasks.includes(task._id) ? 'bg-blue-50' : ''
                  } ${isOverdue(task) ? 'bg-red-50' : ''}`}
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedTasks.includes(task._id)}
                      onChange={() => handleTaskSelect(task._id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      title={`Select task: ${task.title}`}
                      aria-label={`Select task: ${task.title}`}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900 cursor-pointer hover:text-blue-600"
                           onClick={() => onTaskSelect?.(task)}>
                        {task.title}
                      </div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {task.description}
                      </div>
                      {task.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {task.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                              {tag}
                            </span>
                          ))}
                          {task.tags.length > 3 && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                              +{task.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
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
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                        {(task.assignedToName || task.assignedTo).charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm text-gray-900">
                        {task.assignedToName || task.assignedTo}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className={`font-medium ${isOverdue(task) ? 'text-red-600' : 'text-gray-900'}`}>
                        {new Date(task.endDate).toLocaleDateString()}
                      </div>
                      {isOverdue(task) ? (
                        <div className="text-red-600 text-xs flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Overdue
                        </div>
                      ) : (
                        <div className="text-gray-500 text-xs">
                          {getDaysRemaining(task) > 0 ? `${getDaysRemaining(task)} days left` : 'Due today'}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onTaskSelect?.(task)}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onTaskEdit?.(task)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Edit task"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onTaskDelete?.(task._id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {filteredTasks.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {Math.min((currentPage - 1) * tasksPerPage + 1, filteredTasks.length)} to{' '}
            {Math.min(currentPage * tasksPerPage, filteredTasks.length)} of {filteredTasks.length} tasks
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-3 py-2 text-sm text-gray-700">
              Page {currentPage}
            </span>
            <button
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={currentPage * tasksPerPage >= filteredTasks.length}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskList;
