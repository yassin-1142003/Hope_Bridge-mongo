/**
 * Task Form Component
 * 
 * A comprehensive form for creating and editing tasks with file upload support
 * for images, videos, and documents.
 */

"use client";

import React, { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { UserRole, ROLE_DISPLAY_NAMES, canSendMessage } from '@/lib/roles';

interface TaskFormData {
  title: string;
  description: string;
  assignedTo: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  startDate: string;
  endDate: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  alertBeforeDue?: boolean;
  alertDays?: number;
}

interface UploadedFile {
  id: string;
  file: File;
  preview?: string;
  type: string;
  name: string;
  size: number;
}

interface TaskFormProps {
  initialData?: Partial<TaskFormData>;
  onSubmit: (data: TaskFormData, files: File[]) => Promise<void>;
  isLoading?: boolean;
  isArabic?: boolean;
  employees?: Array<{ id: string; name: string; email: string; role: UserRole }>;
  currentUserRole?: UserRole;
}

export default function TaskForm({ 
  initialData = {}, 
  onSubmit, 
  isLoading = false, 
  isArabic = false,
  employees = [],
  currentUserRole = 'USER'
}: TaskFormProps) {
  const [formData, setFormData] = useState<TaskFormData>({
    title: initialData.title || '',
    description: initialData.description || '',
    assignedTo: initialData.assignedTo || '',
    priority: initialData.priority || 'medium',
    startDate: initialData.startDate || '',
    endDate: initialData.endDate || '',
    status: initialData.status || 'pending',
    alertBeforeDue: initialData.alertBeforeDue || false,
    alertDays: initialData.alertDays || 1
  });

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = useTranslations('tasks');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newFiles: UploadedFile[] = Array.from(files).map(file => {
      const uploadedFile: UploadedFile = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        file,
        type: file.type,
        name: file.name,
        size: file.size
      };

      // Create preview for images
      if (file.type.startsWith('image/')) {
        uploadedFile.preview = URL.createObjectURL(file);
      }

      return uploadedFile;
    });

    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => {
      const fileToRemove = prev.find(f => f.id === fileId);
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter(f => f.id !== fileId);
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return '🖼️';
    if (type.startsWith('video/')) return '🎥';
    if (type.includes('pdf')) return '📄';
    if (type.includes('word') || type.includes('document')) return '📝';
    return '📎';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const requiredFields = ['title', 'description', 'assignedTo', 'startDate', 'endDate'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof TaskFormData]);
    
    // Validate date logic
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (start > end) {
        alert(isArabic ? 'تاريخ البدء يجب أن يكون قبل تاريخ الانتهاء' : 'Start date must be before end date');
        return;
      }
    }
    
    if (missingFields.length > 0) {
      alert(isArabic ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields');
      return;
    }

    const files = uploadedFiles.map(uf => uf.file);
    await onSubmit(formData, files);
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${isArabic ? 'text-right' : 'text-left'}`}>
      {/* Title */}
      <div>
        <label 
          htmlFor="task-title"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          {isArabic ? 'عنوان المهمة' : 'Task Title'} *
        </label>
        <input
          id="task-title"
          type="text"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          placeholder={isArabic ? 'أدخل عنوان المهمة' : 'Enter task title'}
          required
          aria-label={isArabic ? 'عنوان المهمة' : 'Task title'}
          aria-required="true"
        />
      </div>

      {/* Description */}
      <div>
        <label 
          htmlFor="task-description"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          {isArabic ? 'وصف المهمة' : 'Task Description'} *
        </label>
        <textarea
          id="task-description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          placeholder={isArabic ? 'أدخل وصف المهمة' : 'Enter task description'}
          required
          aria-label={isArabic ? 'وصف المهمة' : 'Task description'}
          aria-required="true"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Assigned To */}
        <div>
          <label 
            htmlFor="task-assigned-to"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            {isArabic ? 'المسند إلى' : 'Assigned To'} *
          </label>
          <select
            id="task-assigned-to"
            name="assignedTo"
            value={formData.assignedTo}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            required
            aria-label={isArabic ? 'المسند إلى' : 'Assigned to employee'}
            aria-required="true"
          >
            <option value="">{isArabic ? 'اختر الموظف' : 'Select employee'}</option>
            {employees
              .filter(emp => canSendMessage(currentUserRole, emp.role))
              .map(emp => (
                <option key={emp.id} value={emp.email}>
                  {emp.name} ({emp.email}) - {ROLE_DISPLAY_NAMES[emp.role]}
                </option>
              ))}
          </select>
        </div>

        {/* Priority */}
        <div>
          <label 
            htmlFor="task-priority"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            {isArabic ? 'الأولوية' : 'Priority'}
          </label>
          <select
            id="task-priority"
            name="priority"
            value={formData.priority}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            aria-label={isArabic ? 'الأولوية' : 'Task priority'}
          >
            <option value="low">{isArabic ? 'منخفضة' : 'Low'}</option>
            <option value="medium">{isArabic ? 'متوسطة' : 'Medium'}</option>
            <option value="high">{isArabic ? 'عالية' : 'High'}</option>
            <option value="urgent">{isArabic ? 'عاجلة' : 'Urgent'}</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Start Date */}
        <div>
          <label 
            htmlFor="task-start-date"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            {isArabic ? 'تاريخ البدء' : 'Start Date'} *
          </label>
          <input
            id="task-start-date"
            type="datetime-local"
            name="startDate"
            value={formData.startDate}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            aria-label={isArabic ? 'تاريخ البدء' : 'Task start date'}
            required
          />
        </div>

        {/* End Date */}
        <div>
          <label 
            htmlFor="task-end-date"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            {isArabic ? 'تاريخ الانتهاء' : 'End Date'} *
          </label>
          <input
            id="task-end-date"
            type="datetime-local"
            name="endDate"
            value={formData.endDate}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            aria-label={isArabic ? 'تاريخ الانتهاء' : 'Task end date'}
            required
          />
        </div>
      </div>

      {/* Alert Settings */}
      <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          {isArabic ? 'إعدادات التنبيه' : 'Alert Settings'}
        </h3>
        
        <div className="space-y-4">
          {/* Alert Toggle */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="alert-before-due"
              name="alertBeforeDue"
              checked={formData.alertBeforeDue}
              onChange={(e) => setFormData(prev => ({ ...prev, alertBeforeDue: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label 
              htmlFor="alert-before-due"
              className="ml-2 block text-sm text-gray-900 dark:text-gray-300"
            >
              {isArabic ? 'إرسال تنبيه قبل تاريخ الانتهاء' : 'Send alert before due date'}
            </label>
          </div>

          {/* Alert Days */}
          {formData.alertBeforeDue && (
            <div>
              <label 
                htmlFor="alert-days"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                {isArabic ? 'أيام قبل التنبيه' : 'Alert Days Before'}
              </label>
              <select
                id="alert-days"
                name="alertDays"
                value={formData.alertDays}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                aria-label={isArabic ? 'أيام قبل التنبيه' : 'Alert days before due date'}
              >
                <option value="1">{isArabic ? 'يوم واحد' : '1 day'}</option>
                <option value="2">{isArabic ? 'يومان' : '2 days'}</option>
                <option value="3">{isArabic ? '3 أيام' : '3 days'}</option>
                <option value="7">{isArabic ? 'أسبوع واحد' : '1 week'}</option>
                <option value="14">{isArabic ? 'أسبوعان' : '2 weeks'}</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Status */}
      <div>
        <label 
          htmlFor="task-status"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          {isArabic ? 'الحالة' : 'Status'}
        </label>
        <select
          id="task-status"
          name="status"
          value={formData.status}
          onChange={handleInputChange}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          aria-label={isArabic ? 'الحالة' : 'Task status'}
        >
          <option value="pending">{isArabic ? 'قيد الانتظار' : 'Pending'}</option>
          <option value="in_progress">{isArabic ? 'قيد التنفيذ' : 'In Progress'}</option>
          <option value="completed">{isArabic ? 'مكتملة' : 'Completed'}</option>
          <option value="cancelled">{isArabic ? 'ملغاة' : 'Cancelled'}</option>
        </select>
      </div>

      {/* File Upload */}
      <div>
        <label 
          htmlFor="task-files"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          {isArabic ? 'المرفقات (صور، فيديوهات، مستندات)' : 'Attachments (Images, Videos, Documents)'}
        </label>
        
        {/* Drop Zone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
            isDragging 
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }`}
          role="button"
          tabIndex={0}
          aria-label={isArabic ? 'منطقة إسقاط الملفات - اسحب أو انقر لاختيار الملفات' : 'File drop zone - drag files here or click to select'}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
        >
          <div className="space-y-2">
            <div className="text-4xl">📁</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isArabic 
                ? 'اسحب الملفات هنا أو انقر للاختيار' 
                : 'Drag files here or click to select'
              }
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              {isArabic 
                ? 'الصور، الفيديوهات، والمستندات مدعومة (الحد الأقصى: 50 ميجابايت)' 
                : 'Images, videos, and documents supported (Max: 50MB)'
              }
            </p>
          </div>
          <input
            ref={fileInputRef}
            id="task-files"
            type="file"
            multiple
            accept="image/*,video/*,.pdf,.doc,.docx,.txt"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
            aria-label={isArabic ? 'اختر ملفات للمرفقات' : 'Select files for attachments'}
            title={isArabic ? 'اختر ملفات للمرفقات' : 'Select files for attachments'}
          />
        </div>

        {/* Uploaded Files */}
        {uploadedFiles.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {isArabic ? 'الملفات المرفوعة' : 'Uploaded Files'} ({uploadedFiles.length})
            </h4>
            <div className="space-y-2">
              {uploadedFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{getFileIcon(file.type)}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(file.id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    {isArabic ? 'حذف' : 'Remove'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading 
            ? (isArabic ? 'جاري الإرسال...' : 'Sending...')
            : (isArabic ? 'إرسال المهمة' : 'Send Task')
          }
        </button>
      </div>
    </form>
  );
}
