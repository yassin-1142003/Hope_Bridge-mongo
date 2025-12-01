/**
 * Task Detail View
 * 
 * Comprehensive view of task details, form data, and responses
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  CheckCircle, 
  Clock, 
  FileText, 
  Download, 
  Eye, 
  Calendar,
  User,
  Briefcase,
  Star,
  Target,
  AlertCircle,
  RefreshCw,
  MessageSquare,
  Paperclip,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

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

interface TaskDetailViewProps {
  task: Task;
  onClose: () => void;
  onReview?: (taskId: string, reviewComment: string) => void;
  currentUserRole: UserRole;
}

const TaskDetailView: React.FC<TaskDetailViewProps> = ({ 
  task, 
  onClose, 
  onReview, 
  currentUserRole 
}) => {
  const [reviewComment, setReviewComment] = useState('');
  const [showActivities, setShowActivities] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    originalForm: true,
    response: true,
    attachments: true,
    activities: true
  });

  const getStatusIcon = (status: string) => {
    const icons = {
      PENDING: <Clock className="w-5 h-5" />,
      IN_PROGRESS: <RefreshCw className="w-5 h-5 animate-spin" />,
      SUBMITTED: <FileText className="w-5 h-5" />,
      COMPLETED: <CheckCircle className="w-5 h-5" />,
      CANCELLED: <AlertCircle className="w-5 h-5" />
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

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800 border-green-300',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      high: 'bg-orange-100 text-orange-800 border-orange-300',
      urgent: 'bg-red-100 text-red-800 border-red-300'
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev]
    }));
  };

  const handleReview = () => {
    if (onReview && reviewComment.trim()) {
      onReview(task._id, reviewComment);
    }
  };

  const isOverdue = () => {
    if (!task.dueDate) return false;
    return new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED';
  };

  const renderFormField = (field: any, value?: any, isResponse = false) => {
    const displayValue = value || '';

    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
      case 'date':
        return (
          <div className="p-3 bg-gray-50 rounded border border-gray-200">
            {displayValue || <span className="text-gray-400 italic">Not provided</span>}
          </div>
        );
      
      case 'textarea':
        return (
          <div className="p-3 bg-gray-50 rounded border border-gray-200 min-h-[100px]">
            {displayValue || <span className="text-gray-400 italic">Not provided</span>}
          </div>
        );
      
      case 'select':
        return (
          <div className="p-3 bg-gray-50 rounded border border-gray-200">
            {displayValue || <span className="text-gray-400 italic">Not selected</span>}
          </div>
        );
      
      case 'radio':
      case 'checkbox':
        if (Array.isArray(displayValue)) {
          return (
            <div className="space-y-2">
              {field.options?.map((option: string) => (
                <label key={option} className="flex items-center gap-2">
                  <input
                    type={field.type}
                    checked={displayValue.includes(option)}
                    readOnly
                    className="rounded border-gray-300"
                  />
                  <span className={displayValue.includes(option) ? 'font-medium' : 'text-gray-600'}>
                    {option}
                  </span>
                </label>
              ))}
            </div>
          );
        }
        return (
          <div className="p-3 bg-gray-50 rounded border border-gray-200">
            {displayValue || <span className="text-gray-400 italic">Not selected</span>}
          </div>
        );
      
      case 'file':
        return (
          <div className="p-3 bg-gray-50 rounded border border-gray-200">
            {displayValue ? (
              <div className="flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-gray-500" />
                <span className="text-sm">{displayValue}</span>
              </div>
            ) : (
              <span className="text-gray-400 italic">No file uploaded</span>
            )}
          </div>
        );
      
      default:
        return (
          <div className="p-3 bg-gray-50 rounded border border-gray-200">
            {displayValue || <span className="text-gray-400 italic">Not provided</span>}
          </div>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                {getStatusIcon(task.status)}
                <h2 className="text-2xl font-bold text-gray-900">{task.title}</h2>
              </div>
              
              <div className="flex flex-wrap items-center gap-3">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(task.status)}`}>
                  {task.status.replace('_', ' ')}
                </span>
                
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
                
                {task.category && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                    {task.category}
                  </span>
                )}
                
                {task.dueDate && (
                  <div className={`flex items-center gap-1 text-sm ${isOverdue() ? 'text-red-600' : 'text-gray-600'}`}>
                    <Calendar className="w-4 h-4" />
                    {formatDate(task.dueDate)}
                    {isOverdue() && (
                      <AlertCircle className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                )}
              </div>
              
              {task.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {task.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors ml-4"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Task Overview */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Task Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600 mb-1">Description</div>
                <div className="text-gray-900">{task.description}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-600 mb-1">Assignment</div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                    {task.assignedToName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium">{task.assignedToName}</div>
                    <div className="text-sm text-gray-500">{task.assignedToRole}</div>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-600 mb-1">Created By</div>
                <div className="font-medium">{task.assignedByName}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-600 mb-1">Time Tracking</div>
                <div className="text-sm">
                  {task.estimatedHours && (
                    <div>Estimated: {task.estimatedHours} hours</div>
                  )}
                  {task.actualHours && (
                    <div>Actual: {task.actualHours} hours</div>
                  )}
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-600 mb-1">Created</div>
                <div className="text-sm">{formatDate(task.createdAt)}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-600 mb-1">Last Updated</div>
                <div className="text-sm">{formatDate(task.updatedAt)}</div>
              </div>
            </div>
          </div>

          {/* Original Form */}
          <div className="border border-gray-200 rounded-lg">
            <button
              onClick={() => toggleSection('originalForm')}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <h3 className="text-lg font-semibold text-gray-900">Original Form</h3>
              {expandedSections.originalForm ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>
            
            <AnimatePresence>
              {expandedSections.originalForm && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-gray-200"
                >
                  <div className="p-4">
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2">{task.formData.title}</h4>
                      <p className="text-gray-600">{task.formData.description}</p>
                      {task.formData.instructions && (
                        <div className="mt-2 p-3 bg-blue-50 rounded border border-blue-200">
                          <div className="text-sm font-medium text-blue-900 mb-1">Instructions:</div>
                          <div className="text-sm text-blue-800">{task.formData.instructions}</div>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      {task.formData.fields.map((field: any) => (
                        <div key={field.id}>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                          </label>
                          {renderFormField(field)}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Employee Response */}
          {task.employeeResponse && (
            <div className="border border-gray-200 rounded-lg">
              <button
                onClick={() => toggleSection('response')}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <h3 className="text-lg font-semibold text-gray-900">Employee Response</h3>
                {expandedSections.response ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>
              
              <AnimatePresence>
                {expandedSections.response && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-gray-200"
                  >
                    <div className="p-4">
                      <div className="mb-4">
                        <div className="text-sm text-gray-600 mb-1">Submitted on</div>
                        <div className="font-medium">
                          {task.submittedAt ? formatDate(task.submittedAt) : 'Unknown'}
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        {task.formData.fields.map((field: any) => (
                          <div key={field.id}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {field.label}
                              {field.required && <span className="text-red-500 ml-1">*</span>}
                            </label>
                            {renderFormField(field, task.employeeResponse[field.id], true)}
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Attachments */}
          {(task.attachments.length > 0 || task.responseFiles.length > 0) && (
            <div className="border border-gray-200 rounded-lg">
              <button
                onClick={() => toggleSection('attachments')}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <h3 className="text-lg font-semibold text-gray-900">Attachments</h3>
                {expandedSections.attachments ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>
              
              <AnimatePresence>
                {expandedSections.attachments && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-gray-200"
                  >
                    <div className="p-4 space-y-4">
                      {task.attachments.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Task Attachments</h4>
                          <div className="space-y-2">
                            {task.attachments.map((file: any, index: number) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <Paperclip className="w-4 h-4 text-gray-500" />
                                  <div>
                                    <div className="text-sm font-medium">{file.originalName}</div>
                                    <div className="text-xs text-gray-500">
                                      {(file.size / 1024 / 1024).toFixed(2)} MB
                                    </div>
                                  </div>
                                </div>
                                <button
                                  onClick={() => window.open(file.url, '_blank')}
                                  className="p-1 text-blue-600 hover:text-blue-700 transition-colors"
                                  title="Download file"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {task.responseFiles.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Response Files</h4>
                          <div className="space-y-2">
                            {task.responseFiles.map((file: any, index: number) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <Paperclip className="w-4 h-4 text-gray-500" />
                                  <div>
                                    <div className="text-sm font-medium">{file.originalName}</div>
                                    <div className="text-xs text-gray-500">
                                      {(file.size / 1024 / 1024).toFixed(2)} MB
                                    </div>
                                  </div>
                                </div>
                                <button
                                  onClick={() => window.open(file.url, '_blank')}
                                  className="p-1 text-blue-600 hover:text-blue-700 transition-colors"
                                  title="Download file"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Activity Timeline */}
          <div className="border border-gray-200 rounded-lg">
            <button
              onClick={() => toggleSection('activities')}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <h3 className="text-lg font-semibold text-gray-900">Activity Timeline</h3>
              {expandedSections.activities ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>
            
            <AnimatePresence>
              {expandedSections.activities && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-gray-200"
                >
                  <div className="p-4">
                    <div className="space-y-3">
                      {task.activities.map((activity: any, index: number) => (
                        <div key={activity.id} className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">
                              {activity.action.replace('_', ' ')}
                            </div>
                            <div className="text-sm text-gray-600">
                              {activity.comment}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {formatDate(activity.timestamp)} • {activity.performedBy}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer with Actions */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
          {task.status === 'SUBMITTED' && onReview && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Review Comment
                </label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your review comment..."
                />
              </div>
              
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReview}
                  disabled={!reviewComment.trim()}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle className="w-4 h-4" />
                  Review & Complete
                </button>
              </div>
            </div>
          )}
          
          {task.status !== 'SUBMITTED' && (
            <div className="flex items-center justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TaskDetailView;
