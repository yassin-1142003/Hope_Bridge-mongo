/**
 * Task Card Component
 * 
 * Displays a task with its details, files, and actions
 */

"use client";

import React, { useState } from 'react';
import { Task, TaskFile } from '@/lib/services/TaskService';

interface TaskCardProps {
  task: Task;
  onUpdate?: (taskId: string, updates: Partial<Task>) => Promise<void>;
  onDelete?: (taskId: string) => Promise<void>;
  isArabic?: boolean;
  currentUserId?: string;
}

export default function TaskCard({ 
  task, 
  onUpdate, 
  onDelete, 
  isArabic = false,
  currentUserId 
}: TaskCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showFiles, setShowFiles] = useState(false);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-300';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-300';
      case 'pending': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPriorityLabel = (priority: string) => {
    const labels = {
      urgent: isArabic ? 'عاجل' : 'Urgent',
      high: isArabic ? 'عالي' : 'High',
      medium: isArabic ? 'متوسط' : 'Medium',
      low: isArabic ? 'منخفض' : 'Low'
    };
    return labels[priority as keyof typeof labels] || priority;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      completed: isArabic ? 'مكتملة' : 'Completed',
      in_progress: isArabic ? 'قيد التنفيذ' : 'In Progress',
      cancelled: isArabic ? 'ملغاة' : 'Cancelled',
      pending: isArabic ? 'قيد الانتظار' : 'Pending'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return '🖼️';
    if (type.startsWith('video/')) return '🎥';
    if (type.includes('pdf')) return '📄';
    if (type.includes('word') || type.includes('document')) return '📝';
    return '📎';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isOverdue = task.endDate && new Date(task.endDate) < new Date() && task.status !== 'completed';

  const handleStatusChange = async (newStatus: string) => {
    if (!onUpdate) return;
    
    setIsUpdating(true);
    try {
      await onUpdate(task._id!, { status: newStatus as any });
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    
    if ((isArabic ? confirm('هل أنت متأكد من حذف هذه المهمة؟') : confirm('Are you sure you want to delete this task?'))) {
      try {
        await onDelete(task._id!);
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className={`p-4 ${isOverdue ? 'bg-red-50 dark:bg-red-900/20' : ''}`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className={`text-lg font-semibold text-gray-900 dark:text-white mb-2 ${isArabic ? 'text-right' : 'text-left'}`}>
              {task.title}
            </h3>
            <p className={`text-gray-600 dark:text-gray-300 text-sm mb-3 ${isArabic ? 'text-right' : 'text-left'}`}>
              {task.description}
            </p>
          </div>
          
          {/* Action Menu */}
          {onDelete && (
            <button
              onClick={handleDelete}
              className="text-gray-400 hover:text-red-500 transition-colors"
              title={isArabic ? 'حذف المهمة' : 'Delete task'}
            >
              🗑️
            </button>
          )}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-3">
          <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(task.priority)}`}>
            {getPriorityLabel(task.priority)}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(task.status)}`}>
            {getStatusLabel(task.status)}
          </span>
          {isOverdue && (
            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border-red-300">
              {isArabic ? 'متأخرة' : 'Overdue'}
            </span>
          )}
        </div>

        {/* Meta Information */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className={`flex items-center space-x-4 ${isArabic ? 'flex-row-reverse space-x-reverse' : ''}`}>
            <span>
              {isArabic ? 'المسند إلى:' : 'Assigned to:'} {task.assignedTo}
            </span>
            {task.endDate && (
              <span className={isOverdue ? 'text-red-500 font-semibold' : ''}>
                {isArabic ? 'تاريخ الاستحقاق:' : 'Due:'} {formatDate(task.endDate)}
              </span>
            )}
          </div>
          <span>
            {formatDate(task.createdAt)}
          </span>
        </div>
      </div>

      {/* Files Section */}
      {task.files && task.files.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setShowFiles(!showFiles)}
            className="w-full px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-between"
          >
            <span>
              {isArabic ? 'المرفقات' : 'Attachments'} ({task.files.length})
            </span>
            <span className={`transform transition-transform ${showFiles ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>
          
          {showFiles && (
            <div className="px-4 pb-4 space-y-2">
              {task.files.map((file: TaskFile) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{getFileIcon(file.type)}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                        {file.originalName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatFileSize(file.size)} • {formatDate(file.uploadedAt)}
                      </p>
                    </div>
                  </div>
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                  >
                    {isArabic ? 'عرض' : 'View'}
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Status Update */}
      {onUpdate && task.status !== 'completed' && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {isArabic ? 'تحديث الحالة:' : 'Update status:'}
            </span>
            <div className="flex space-x-2">
              {task.status === 'pending' && (
                <button
                  onClick={() => handleStatusChange('in_progress')}
                  disabled={isUpdating}
                  className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {isArabic ? 'بدء العمل' : 'Start Work'}
                </button>
              )}
              {task.status === 'in_progress' && (
                <>
                  <button
                    onClick={() => handleStatusChange('pending')}
                    disabled={isUpdating}
                    className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
                  >
                    {isArabic ? 'إعادة' : 'Reopen'}
                  </button>
                  <button
                    onClick={() => handleStatusChange('completed')}
                    disabled={isUpdating}
                    className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                  >
                    {isArabic ? 'إكمال' : 'Complete'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
