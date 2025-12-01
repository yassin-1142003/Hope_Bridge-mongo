import React, { useState, useEffect } from 'react';
import { PlusIcon, FunnelIcon } from '@heroicons/react/24/outline';
import TaskCard from '../components/TaskCard';
import { tasksAPI } from '../services/api';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [sentTasks, setSentTasks] = useState([]);
  const [receivedTasks, setReceivedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('received');
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    search: ''
  });
  const [showTaskForm, setShowTaskForm] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, [activeTab, filters]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const apiCall = activeTab === 'sent' ? tasksAPI.getMySentTasks : tasksAPI.getMyReceivedTasks;
      const response = await apiCall(filters);
      
      if (activeTab === 'sent') {
        setSentTasks(response.data.tasks);
      } else {
        setReceivedTasks(response.data.tasks);
      }
    } catch (error) {
      toast.error('Error fetching tasks');
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskAction = async (action, taskId) => {
    try {
      if (action === 'markComplete') {
        await tasksAPI.markComplete(taskId);
        toast.success('Task marked as complete');
      } else if (action === 'sendReminder') {
        await tasksAPI.sendReminder(taskId);
        toast.success('Reminder sent successfully');
      }
      fetchTasks();
    } catch (error) {
      toast.error('Error performing action');
      console.error('Error performing task action:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const currentTasks = activeTab === 'sent' ? sentTasks : receivedTasks;

  const sortedTasks = [...currentTasks].sort((a, b) => {
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
    const statusOrder = { pending: 0, in_progress: 1, completed: 2 };
    
    if (a.priority !== b.priority) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    if (a.status !== b.status) {
      return statusOrder[a.status] - statusOrder[b.status];
    }
    return new Date(a.dueDate) - new Date(b.dueDate);
  });

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Task Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your tasks efficiently</p>
        </div>
        <button
          onClick={() => setShowTaskForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          New Task
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('received')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'received'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Tasks I Received ({receivedTasks.length})
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'sent'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Tasks I Sent ({sentTasks.length})
          </button>
        </div>

        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <FunnelIcon className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">Filters:</span>
            </div>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Priority</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <input
              type="text"
              placeholder="Search tasks..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {(filters.status || filters.priority || filters.search) && (
              <button
                onClick={() => setFilters({ status: '', priority: '', search: '' })}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : sortedTasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-4">
                {filters.status || filters.priority || filters.search
                  ? 'No tasks found matching your filters'
                  : `No ${activeTab === 'sent' ? 'sent' : 'received'} tasks yet`}
              </div>
              {!filters.status && !filters.priority && !filters.search && (
                <button
                  onClick={() => setShowTaskForm(true)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Create your first task
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sortedTasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onAction={handleTaskAction}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {showTaskForm && (
        <TaskForm
          onClose={() => setShowTaskForm(false)}
          onSuccess={() => {
            setShowTaskForm(false);
            fetchTasks();
          }}
        />
      )}
    </div>
  );
};

const TaskForm = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    dueDate: '',
    priority: 'medium',
    tags: ''
  });
  const [loading, setLoading] = useState(false);
  const { tasksAPI } = require('../services/api');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const taskData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };
      
      await tasksAPI.createTask(taskData);
      onSuccess();
      toast.success('Task created successfully');
    } catch (error) {
      toast.error('Error creating task');
      console.error('Error creating task:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Task</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                required
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assigned To *
              </label>
              <input
                type="text"
                required
                placeholder="User ID"
                value={formData.assignedTo}
                onChange={(e) => setFormData(prev => ({ ...prev, assignedTo: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date *
              </label>
              <input
                type="date"
                required
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                placeholder="design, frontend, urgent"
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Task'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
