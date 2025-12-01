'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Briefcase, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  FileText,
  Download,
  Eye,
  Users,
  TrendingUp,
  Filter,
  Search,
  Link2,
  ExternalLink
} from 'lucide-react';
import { useRoleBasedTasks } from '../../hooks/useRoleBasedTasks';
import PrioritySelector from '../ui/PrioritySelector';
import TaskStatusSelector from '../ui/TaskStatusSelector';
import PDFViewer from '../ui/PDFViewer';
import { useLocale } from 'next-intl';

interface RoleBasedTaskDashboardProps {
  userId?: string;
  className?: string;
}

const RoleBasedTaskDashboard: React.FC<RoleBasedTaskDashboardProps> = ({
  userId,
  className = ''
}) => {
  const { userTasks, loading, error, refreshTasks, updateTaskStatus, getUserRole } = useRoleBasedTasks();
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const locale = useLocale();

  const userRole = getUserRole();
  const selectedTaskData = userTasks.find(task => task.id === selectedTask);

  // Filter tasks based on search and status
  const filteredTasks = userTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Task statistics
  const stats = {
    total: filteredTasks.length,
    pending: filteredTasks.filter(t => t.status === 'pending').length,
    inProgress: filteredTasks.filter(t => t.status === 'in_progress').length,
    completed: filteredTasks.filter(t => t.status === 'completed').length,
    overdue: filteredTasks.filter(t => t.dueDate < new Date() && t.status !== 'completed').length
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      await updateTaskStatus(taskId, newStatus as any);
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center min-h-96 ${className}`}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center min-h-96 ${className}`}>
        <div className="text-center p-6">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Tasks</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refreshTasks}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
            <p className="text-gray-600 mt-1">
              {userRole && `Role: ${userRole.charAt(0).toUpperCase() + userRole.slice(1)} • `}
              {stats.total} tasks assigned to you
            </p>
          </div>
          <button
            onClick={refreshTasks}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh tasks list"
            aria-label="Refresh tasks list"
          >
            <AlertCircle className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Project Integration */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link2 className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="font-medium text-blue-900">
                  {locale === 'ar' ? 'ربط المهام بالمشاريع' : 'Connect Tasks with Projects'}
                </h3>
                <p className="text-sm text-blue-700">
                  {locale === 'ar' ? 'عرض المشاريع المرتبطة بالمهام' : 'View projects related to your tasks'}
                </p>
              </div>
            </div>
            <a
              href={`/${locale}/projects`}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {locale === 'ar' ? 'عرض المشاريع' : 'View Projects'}
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Briefcase className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-xs text-gray-600">Total Tasks</p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                <p className="text-xs text-gray-600">Pending</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
                <p className="text-xs text-gray-600">In Progress</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                <p className="text-xs text-gray-600">Completed</p>
              </div>
            </div>
          </div>

          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
                <p className="text-xs text-gray-600">Overdue</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              title="Filter tasks by status"
              aria-label="Filter tasks by status"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="divide-y divide-gray-200">
          {filteredTasks.length === 0 ? (
            <div className="p-8 text-center">
              <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
              <p className="text-gray-600">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filters' 
                  : 'You have no tasks assigned to you yet'}
              </p>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{task.title}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        task.status === 'completed' ? 'bg-green-100 text-green-800' :
                        task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        task.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-3">{task.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Due: {task.dueDate.toLocaleDateString()}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{task.assignedTo.name}</span>
                      </div>
                      
                      {task.attachments && task.attachments.length > 0 && (
                        <div className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          <span>{task.attachments.length} files</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 ml-4">
                    <PrioritySelector
                      value={task.priority}
                      onChange={() => {}} // Read-only in this view
                      disabled
                    />
                    
                    <TaskStatusSelector
                      value={task.status}
                      onChange={(newStatus) => handleStatusChange(task.id, newStatus)}
                    />
                    
                    {task.attachments && task.attachments.length > 0 && (
                      <button
                        onClick={() => setSelectedTask(task.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="View task attachments"
                        aria-label="View task attachments"
                      >
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* PDF Viewer Modal */}
      {selectedTask && selectedTaskData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedTaskData.title}</h2>
                  <p className="text-gray-600 mt-1">Task Attachments</p>
                </div>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Close task attachments"
                  aria-label="Close task attachments"
                >
                  <AlertCircle className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-auto max-h-[calc(90vh-8rem)]">
              {selectedTaskData.attachments && selectedTaskData.attachments.length > 0 ? (
                <div className="space-y-6">
                  {selectedTaskData.attachments.map((attachment) => (
                    <div key={attachment.id}>
                      <h3 className="font-medium text-gray-900 mb-3">{attachment.name}</h3>
                      {attachment.type === 'application/pdf' ? (
                        <PDFViewer
                          url={attachment.url}
                          title={attachment.name}
                          className="h-96"
                        />
                      ) : (
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="w-8 h-8 text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-900">{attachment.name}</p>
                              <p className="text-sm text-gray-600">{attachment.type}</p>
                            </div>
                          </div>
                          <a
                            href={attachment.url}
                            download={attachment.name}
                            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                            title={`Download ${attachment.name}`}
                            aria-label={`Download ${attachment.name}`}
                          >
                            <Download className="w-4 h-4 text-gray-600" />
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No attachments available for this task</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleBasedTaskDashboard;
