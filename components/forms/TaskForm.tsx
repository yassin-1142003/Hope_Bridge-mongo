/**
 * Professional Task Form Component
 * 
 * Advanced task creation form with perfect UX, validation,
 * date handling, and professional design.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, User, Tag, AlertCircle, Paperclip, X, Check, ChevronDown } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface TaskFormData {
  title: string;
  description: string;
  assignedTo: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  startDate: string;
  endDate: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  alertBeforeDue: boolean;
  alertDays: number;
  tags: string[];
  category: string;
  files: File[];
}

interface User {
  email: string;
  name: string;
  role: string;
}

interface TaskFormProps {
  initialData?: Partial<TaskFormData>;
  onSubmit: (data: TaskFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  mode?: 'create' | 'edit';
}

const TaskForm: React.FC<TaskFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  mode = 'create'
}) => {
  const { data: session } = useSession();
  const [formData, setFormData] = useState<TaskFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    assignedTo: initialData?.assignedTo || '',
    priority: initialData?.priority || 'medium',
    startDate: initialData?.startDate || new Date().toISOString().split('T')[0],
    endDate: initialData?.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: initialData?.status || 'pending',
    alertBeforeDue: initialData?.alertBeforeDue || false,
    alertDays: initialData?.alertDays || 1,
    tags: initialData?.tags || [],
    category: initialData?.category || 'general',
    files: initialData?.files || []
  });

  const [users, setUsers] = useState<User[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const categories = [
    { value: 'general', label: 'General', color: 'bg-gray-500' },
    { value: 'development', label: 'Development', color: 'bg-blue-500' },
    { value: 'design', label: 'Design', color: 'bg-purple-500' },
    { value: 'marketing', label: 'Marketing', color: 'bg-green-500' },
    { value: 'finance', label: 'Finance', color: 'bg-yellow-500' },
    { value: 'hr', label: 'Human Resources', color: 'bg-pink-500' },
    { value: 'operations', label: 'Operations', color: 'bg-indigo-500' },
    { value: 'maintenance', label: 'Maintenance', color: 'bg-orange-500' }
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800 border-green-300' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
    { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800 border-orange-300' },
    { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800 border-red-300' }
  ];

  const statuses = [
    { value: 'pending', label: 'Pending', color: 'bg-gray-100 text-gray-800' },
    { value: 'in_progress', label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
    { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' }
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title must be less than 200 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length > 2000) {
      newErrors.description = 'Description must be less than 2000 characters';
    }

    if (!formData.assignedTo) {
      newErrors.assignedTo = 'Please assign this task to someone';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    } else if (formData.startDate && new Date(formData.endDate) < new Date(formData.startDate)) {
      newErrors.endDate = 'End date must be after start date';
    }

    if (formData.alertBeforeDue && (formData.alertDays < 1 || formData.alertDays > 30)) {
      newErrors.alertDays = 'Alert days must be between 1 and 30';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Failed to submit task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof TaskFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      handleInputChange('tags', [...formData.tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    handleInputChange('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'text/plain'];
      const maxSize = 50 * 1024 * 1024; // 50MB
      return allowedTypes.includes(file.type) && file.size <= maxSize;
    });

    if (validFiles.length !== files.length) {
      alert('Some files were invalid. Only images, PDFs, and text files up to 50MB are allowed.');
    }

    handleInputChange('files', [...formData.files, ...validFiles]);
  };

  const removeFile = (index: number) => {
    handleInputChange('files', formData.files.filter((_, i) => i !== index));
  };

  const getSelectedUser = () => {
    return users.find(user => user.email === formData.assignedTo);
  };

  const getCategoryInfo = () => {
    return categories.find(cat => cat.value === formData.category);
  };

  const getPriorityInfo = () => {
    return priorities.find(p => p.value === formData.priority);
  };

  const getStatusInfo = () => {
    return statuses.find(s => s.value === formData.status);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-2xl shadow-xl border border-gray-200 max-w-4xl mx-auto"
    >
      {/* Header */}
      <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {mode === 'create' ? 'Create New Task' : 'Edit Task'}
            </h2>
            <p className="text-gray-600 mt-1">
              {mode === 'create' ? 'Fill in the details to create a new task' : 'Update the task information'}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Cancel and close form"
            aria-label="Cancel and close form"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Task Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                errors.title ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="Enter task title..."
              maxLength={200}
            />
            {errors.title && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-sm text-red-600 flex items-center gap-1"
              >
                <AlertCircle className="w-4 h-4" />
                {errors.title}
              </motion.p>
            )}
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none ${
                errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="Describe the task in detail..."
              rows={4}
              maxLength={2000}
            />
            {errors.description && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-sm text-red-600 flex items-center gap-1"
              >
                <AlertCircle className="w-4 h-4" />
                {errors.description}
              </motion.p>
            )}
          </div>

          {/* Assigned To */}
          <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Assigned To <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-left flex items-center justify-between ${
                  errors.assignedTo ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <span className={getSelectedUser() ? 'text-gray-900' : 'text-gray-500'}>
                    {getSelectedUser()?.name || 'Select user...'}
                  </span>
                </div>
                <ChevronDown className="w-5 h-5 text-gray-400" />
              </button>
              
              <AnimatePresence>
                {showUserDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto"
                  >
                    {users.map((user) => (
                      <button
                        key={user.email}
                        type="button"
                        onClick={() => {
                          handleInputChange('assignedTo', user.email);
                          setShowUserDropdown(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
                      >
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {errors.assignedTo && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-sm text-red-600 flex items-center gap-1"
              >
                <AlertCircle className="w-4 h-4" />
                {errors.assignedTo}
              </motion.p>
            )}
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Priority
            </label>
            <div className="grid grid-cols-4 gap-2">
              {priorities.map((priority) => (
                <button
                  key={priority.value}
                  type="button"
                  onClick={() => handleInputChange('priority', priority.value)}
                  className={`px-3 py-2 rounded-lg border-2 font-medium transition-all ${
                    formData.priority === priority.value
                      ? priority.color
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {priority.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dates */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Start Date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                id="start-date"
                name="start-date"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                className={`w-full px-4 py-3 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.startDate ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Select start date"
                title="Select task start date"
                aria-label="Task start date"
                aria-describedby={errors.startDate ? 'start-date-error' : undefined}
              />
              <Calendar className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
            </div>
            {errors.startDate && (
              <motion.p
                id="start-date-error"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-sm text-red-600 flex items-center gap-1"
                role="alert"
              >
                <AlertCircle className="w-4 h-4" />
                {errors.startDate}
              </motion.p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              End Date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                id="end-date"
                name="end-date"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                min={formData.startDate}
                className={`w-full px-4 py-3 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.endDate ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Select end date"
                title="Select task end date"
                aria-label="Task end date"
                aria-describedby={errors.endDate ? 'end-date-error' : undefined}
              />
              <Calendar className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
            </div>
            {errors.endDate && (
              <motion.p
                id="end-date-error"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-sm text-red-600 flex items-center gap-1"
                role="alert"
              >
                <AlertCircle className="w-4 h-4" />
                {errors.endDate}
              </motion.p>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Status
            </label>
            <div className="grid grid-cols-2 gap-2">
              {statuses.map((status) => (
                <button
                  key={status.value}
                  type="button"
                  onClick={() => handleInputChange('status', status.value)}
                  className={`px-3 py-2 rounded-lg border-2 font-medium transition-all ${
                    formData.status === status.value
                      ? status.color
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Category
            </label>
            <div className="relative">
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none"
                title="Select task category"
                aria-label="Task category"
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Alert Settings */}
        <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-blue-500" />
            Alert Settings
          </h3>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.alertBeforeDue}
                onChange={(e) => handleInputChange('alertBeforeDue', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-gray-700">Send alert before due date</span>
            </label>
            {formData.alertBeforeDue && (
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Alert</label>
                <input
                  type="number"
                  id="alert-days"
                  name="alert-days"
                  min="1"
                  max="30"
                  value={formData.alertDays}
                  onChange={(e) => handleInputChange('alertDays', parseInt(e.target.value))}
                  className={`w-20 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.alertDays ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="1"
                  title="Number of days before due date to send alert"
                  aria-label="Alert days before due date"
                  aria-describedby={errors.alertDays ? 'alert-days-error' : undefined}
                />
                <span className="text-sm text-gray-600">days before</span>
              </div>
            )}
          </div>
          {errors.alertDays && (
            <motion.p
              id="alert-days-error"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 text-sm text-red-600 flex items-center gap-1"
              role="alert"
            >
              <AlertCircle className="w-4 h-4" />
              {errors.alertDays}
            </motion.p>
          )}
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Tags
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {formData.tags.map((tag) => (
              <motion.span
                key={tag}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                <Tag className="w-3 h-3" />
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1 hover:text-blue-600"
                  title={`Remove tag: ${tag}`}
                  aria-label={`Remove tag: ${tag}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              placeholder="Add a tag..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={addTag}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Add Tag
            </button>
          </div>
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Attachments
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
              accept="image/*,.pdf,.txt"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              <Paperclip className="w-8 h-8 text-gray-400" />
              <span className="text-gray-600">Click to upload files</span>
              <span className="text-sm text-gray-500">Images, PDFs, and text files up to 50MB</span>
            </label>
          </div>
          {formData.files.length > 0 && (
            <div className="mt-4 space-y-2">
              {formData.files.map((file, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Paperclip className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">{file.name}</span>
                    <span className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="text-red-500 hover:text-red-600"
                    title={`Remove file: ${file.name}`}
                    aria-label={`Remove file: ${file.name}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            title="Cancel task creation"
            aria-label="Cancel task creation"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            title="Create new task"
            aria-label="Create new task"
          >
            {isSubmitting || isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {mode === 'create' ? 'Creating...' : 'Updating...'}
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                {mode === 'create' ? 'Create Task' : 'Update Task'}
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default TaskForm;
