/**
 * Enhanced Task Card Component
 * 
 * Displays a task with beautiful styling, date information, file previews,
 * and interactive elements with modern UI/UX
 */

"use client";

import React, { useState } from 'react';
import { Task, TaskFile } from '@/lib/services/SimpleTaskService';
import { 
  Calendar, 
  Clock, 
  User, 
  FileText, 
  Image, 
  Video, 
  Paperclip, 
  ChevronDown, 
  ChevronUp,
  CheckCircle,
  AlertCircle,
  PlayCircle,
  XCircle,
  MoreVertical,
  Download,
  Eye
} from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onUpdate?: (taskId: string, updates: Partial<Task>) => Promise<void>;
  onDelete?: (taskId: string) => Promise<void>;
  isArabic?: boolean;
  currentUserId?: string;
}

const priorityConfig = {
  urgent: { color: 'bg-red-500', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: 'Urgent' },
  high: { color: 'bg-orange-500', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', label: 'High' },
  medium: { color: 'bg-blue-500', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'Medium' },
  low: { color: 'bg-green-500', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', label: 'Low' }
};

const statusConfig = {
  completed: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', label: 'Completed' },
  in_progress: { icon: PlayCircle, color: 'text-blue-600', bg: 'bg-blue-50', label: 'In Progress' },
  cancelled: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', label: 'Cancelled' },
  pending: { icon: AlertCircle, color: 'text-gray-600', bg: 'bg-gray-50', label: 'Pending' }
};

export default function EnhancedTaskCard({ 
  task, 
  onUpdate, 
  onDelete, 
  isArabic = false,
  currentUserId 
}: TaskCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showFiles, setShowFiles] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOverdue = (endDate?: string) => {
    if (!endDate) return false;
    return new Date(endDate) < new Date() && task.status !== 'completed';
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (type.startsWith('video/')) return <Video className="w-4 h-4" />;
    if (type.includes('pdf') || type.includes('document')) return <FileText className="w-4 h-4" />;
    return <Paperclip className="w-4 h-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const StatusIcon = statusConfig[task.status as keyof typeof statusConfig]?.icon || AlertCircle;
  const priority = priorityConfig[task.priority as keyof typeof priorityConfig] || priorityConfig.medium;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {task.title}
              </h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${priority.bg} ${priority.text} ${priority.border} border`}>
                {priority.label}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span className="truncate">{task.assignedTo}</span>
              </div>
              <div className="flex items-center gap-1">
                <StatusIcon className="w-4 h-4" />
                <span>{statusConfig[task.status as keyof typeof statusConfig]?.label}</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {task.description}
        </p>

        {/* Schedule Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-blue-500" />
            <div>
              <p className="text-gray-500">{isArabic ? 'بدء' : 'Start'}</p>
              <p className="font-medium text-gray-900">
                {formatDate(task.startDate) || 'Not set'}
              </p>
            </div>
          </div>
          
          <div className={`flex items-center gap-2 text-sm ${isOverdue(task.endDate) ? 'text-red-600' : ''}`}>
            <Clock className={`w-4 h-4 ${isOverdue(task.endDate) ? 'text-red-500' : 'text-blue-500'}`} />
            <div>
              <p className="text-gray-500">{isArabic ? 'انتهاء' : 'End'}</p>
              <p className={`font-medium ${isOverdue(task.endDate) ? 'text-red-600' : 'text-gray-900'}`}>
                {formatDate(task.endDate) || 'Not set'}
                {isOverdue(task.endDate) && (
                  <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                    {isArabic ? 'متأخر' : 'Overdue'}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Files Preview */}
        {task.files && task.files.length > 0 && (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Paperclip className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {task.files.length} {task.files.length === 1 ? 'file' : 'files'}
              </span>
            </div>
            <button
              onClick={() => setShowFiles(!showFiles)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
            >
              {showFiles ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  {isArabic ? 'إخفاء' : 'Hide'}
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  {isArabic ? 'عرض' : 'Show'}
                </>
              )}
            </button>
          </div>
        )}

        {/* Expanded Content */}
        {expanded && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            {/* Alert Settings */}
            {task.alerts && task.alerts.length > 0 && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 text-blue-700">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {isArabic ? 'تنبيهات' : 'Alerts'}
                  </span>
                </div>
                <div className="mt-2 space-y-1">
                  {task.alerts.map((alert: string, index: number) => (
                    <p key={index} className="text-sm text-blue-600">
                      {alert}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-1"
                onClick={() => task._id && onUpdate?.(task._id, { status: 'in_progress' })}
                disabled={isUpdating}
              >
                <PlayCircle className="w-4 h-4" />
                {isArabic ? 'بدء' : 'Start'}
              </button>
              
              <button
                className="px-3 py-1.5 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-1"
                onClick={() => task._id && onUpdate?.(task._id, { status: 'completed' })}
                disabled={isUpdating}
              >
                <CheckCircle className="w-4 h-4" />
                {isArabic ? 'إكمال' : 'Complete'}
              </button>
              
              <button
                className="px-3 py-1.5 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-1"
                onClick={() => task._id && onDelete?.(task._id)}
                disabled={isUpdating}
              >
                <XCircle className="w-4 h-4" />
                {isArabic ? 'حذف' : 'Delete'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Files Section */}
      {showFiles && task.files && task.files.length > 0 && (
        <div className="border-t border-gray-200 bg-gray-50 p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            {isArabic ? 'الملفات المرفقة' : 'Attached Files'}
          </h4>
          <div className="space-y-2">
            {task.files.map((file, index) => (
              <div
                key={file.id || index}
                className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="text-blue-500 flex-shrink-0">
                    {getFileIcon(file.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)} • {new Date(file.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    onClick={() => window.open(file.url, '_blank')}
                    title={isArabic ? 'معاينة' : 'Preview'}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = file.url;
                      link.download = file.originalName || file.name;
                      link.click();
                    }}
                    title={isArabic ? 'تحميل' : 'Download'}
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
