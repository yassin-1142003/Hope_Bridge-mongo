/**
 * Enhanced Task Form Component
 * 
 * A beautiful, modern form for creating and editing tasks with:
 * - Advanced date/time pickers with validation
 * - Beautiful file upload with Cloudinary integration
 * - Modern UI with animations and micro-interactions
 * - Comprehensive error handling and user feedback
 */

"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { UserRole, ROLE_DISPLAY_NAMES, canSendMessage } from '@/lib/roles';
import { Calendar, Clock, Upload, X, Check, AlertCircle, FileText, Image, Video, Paperclip } from 'lucide-react';

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
  uploadProgress?: number;
  uploadStatus?: 'pending' | 'uploading' | 'success' | 'error';
}

interface TaskFormProps {
  initialData?: Partial<TaskFormData>;
  onSubmit: (data: TaskFormData, files: File[]) => Promise<void>;
  isLoading?: boolean;
  isArabic?: boolean;
  employees?: Array<{ id: string; name: string; email: string; role: UserRole }>;
  currentUserRole?: UserRole;
}

const priorityColors = {
  low: 'bg-green-100 text-green-800 border-green-200',
  medium: 'bg-blue-100 text-blue-800 border-blue-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  urgent: 'bg-red-100 text-red-800 border-red-200'
};

const statusColors = {
  pending: 'bg-gray-100 text-gray-800 border-gray-200',
  in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
  completed: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200'
};

export default function EnhancedTaskForm({ 
  initialData = {}, 
  onSubmit, 
  isLoading = false, 
  isArabic = false,
  employees = [],
  currentUserRole = 'USER'
}: TaskFormProps) {
  const t = useTranslations('task');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<TaskFormData>({
    title: initialData.title || '',
    description: initialData.description || '',
    assignedTo: initialData.assignedTo || '',
    priority: initialData.priority || 'medium',
    startDate: initialData.startDate || '',
    endDate: initialData.endDate || '',
    status: initialData.status || 'pending',
    alertBeforeDue: initialData.alertBeforeDue || false,
    alertDays: initialData.alertDays || 3,
  });

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Date validation
  const validateDates = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.startDate) {
      newErrors.startDate = isArabic ? 'تاريخ البدء مطلوب' : 'Start date is required';
    }
    
    if (!formData.endDate) {
      newErrors.endDate = isArabic ? 'تاريخ الانتهاء مطلوب' : 'End date is required';
    }
    
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      
      if (start > end) {
        newErrors.endDate = isArabic 
          ? 'تاريخ الانتهاء يجب أن يكون بعد تاريخ البدء' 
          : 'End date must be after start date';
      }
      
      // Check if dates are in the past
      const now = new Date();
      if (start < now) {
        newErrors.startDate = isArabic 
          ? 'تاريخ البدء لا يمكن أن يكون في الماضي' 
          : 'Start date cannot be in the past';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = isArabic ? 'عنوان المهمة مطلوب' : 'Task title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = isArabic ? 'وصف المهمة مطلوب' : 'Task description is required';
    }
    
    if (!formData.assignedTo) {
      newErrors.assignedTo = isArabic ? 'يجب تعيين المهمة' : 'Task must be assigned';
    }
    
    // Validate dates
    const dateValidation = validateDates();
    if (!dateValidation) {
      return false;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checkbox.checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newFiles: UploadedFile[] = Array.from(files).map(file => {
      const uploadedFile: UploadedFile = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        file,
        type: file.type,
        name: file.name,
        size: file.size,
        uploadStatus: 'pending'
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
    if (type.startsWith('image/')) return <Image className="w-5 h-5" />;
    if (type.startsWith('video/')) return <Video className="w-5 h-5" />;
    if (type.includes('pdf')) return <FileText className="w-5 h-5" />;
    if (type.includes('word') || type.includes('document') || type.includes('.doc')) return <FileText className="w-5 h-5 text-blue-600" />;
    if (type.includes('sheet') || type.includes('excel') || type.includes('.xls')) return <FileText className="w-5 h-5 text-green-600" />;
    if (type.includes('presentation') || type.includes('powerpoint') || type.includes('.ppt')) return <FileText className="w-5 h-5 text-orange-600" />;
    if (type.includes('text') || type.includes('.txt')) return <FileText className="w-5 h-5 text-gray-600" />;
    if (type.includes('csv')) return <FileText className="w-5 h-5 text-purple-600" />;
    if (type.includes('zip') || type.includes('rar') || type.includes('7z')) return <Paperclip className="w-5 h-5 text-yellow-600" />;
    return <Paperclip className="w-5 h-5" />;
  };

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitSuccess(false);

    try {
      const files = uploadedFiles.map(uf => uf.file);
      await onSubmit(formData, files);
      setSubmitSuccess(true);
      
      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          title: '',
          description: '',
          assignedTo: '',
          priority: 'medium',
          startDate: '',
          endDate: '',
          status: 'pending',
          alertBeforeDue: false,
          alertDays: 3,
        });
        setUploadedFiles([]);
        setSubmitSuccess(false);
      }, 2000);
      
    } catch (error) {
      console.error('Task submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`max-w-4xl mx-auto p-6 ${isArabic ? 'text-right' : 'text-left'}`}>
      {/* Success Message */}
      {submitSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 animate-pulse">
          <Check className="w-5 h-5 text-green-600" />
          <p className="text-green-800 font-medium">
            {isArabic ? 'تم إنشاء المهمة بنجاح!' : 'Task created successfully!'}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {isArabic ? 'إنشاء مهمة جديدة' : 'Create New Task'}
          </h2>
          <p className="text-gray-600">
            {isArabic 
              ? 'املأ التفاصيل أدناه لإنشاء مهمة جديدة مع المرفقات' 
              : 'Fill in the details below to create a new task with attachments'
            }
          </p>
        </div>

        {/* Basic Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            {isArabic ? 'المعلومات الأساسية' : 'Basic Information'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isArabic ? 'عنوان المهمة' : 'Task Title'} *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.title ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder={isArabic ? 'أدخل عنوان المهمة' : 'Enter task title'}
                disabled={isSubmitting}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.title}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isArabic ? 'وصف المهمة' : 'Task Description'} *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none ${
                  errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder={isArabic ? 'أدخل وصف المهمة' : 'Enter task description'}
                disabled={isSubmitting}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.description}
                </p>
              )}
            </div>

            {/* Assigned To - Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isArabic ? 'المسند إلى (البريد الإلكتروني)' : 'Assigned To (Email)'} *
              </label>
              <input
                type="email"
                name="assignedTo"
                value={formData.assignedTo}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.assignedTo ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder={isArabic ? 'أدخل البريد الإلكتروني للموظف' : 'Enter employee email address'}
                disabled={isSubmitting}
                aria-label={isArabic ? 'البريد الإلكتروني للموظف' : 'Employee email address'}
                title={isArabic ? 'أدخل البريد الإلكتروني للموظف لتعيين المهمة' : 'Enter employee email address to assign task'}
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                {isArabic 
                  ? 'أدخل البريد الإلكتروني للموظف الذي تريد إسناد المهمة إليه' 
                  : 'Enter the email address of the employee to assign this task to'
                }
              </p>
              {errors.assignedTo && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.assignedTo}
                </p>
              )}
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isArabic ? 'الأولوية' : 'Priority'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['low', 'medium', 'high', 'urgent'] as const).map(priority => (
                  <label key={priority} className="relative">
                    <input
                      type="radio"
                      name="priority"
                      value={priority}
                      checked={formData.priority === priority}
                      onChange={handleInputChange}
                      className="sr-only peer"
                      disabled={isSubmitting}
                    />
                    <div className={`px-3 py-2 rounded-lg border-2 cursor-pointer transition-all text-center text-sm font-medium ${
                      formData.priority === priority
                        ? priorityColors[priority] + ' border-current'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Schedule */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            {isArabic ? 'جدولة المهمة' : 'Task Schedule'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                {isArabic ? 'تاريخ البدء' : 'Start Date & Time'} *
              </label>
              <input
                type="datetime-local"
                name="startDate"
                value={formatDateForInput(formData.startDate)}
                onChange={handleInputChange}
                min={new Date().toISOString().slice(0, 16)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.startDate ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
                aria-label={isArabic ? 'تاريخ البدء والوقت' : 'Start date and time'}
                title={isArabic ? 'اختر تاريخ ووقت بدء المهمة' : 'Select task start date and time'}
              />
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.startDate}
                </p>
              )}
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                {isArabic ? 'تاريخ الانتهاء' : 'End Date & Time'} *
              </label>
              <input
                type="datetime-local"
                name="endDate"
                value={formatDateForInput(formData.endDate)}
                onChange={handleInputChange}
                min={formData.startDate || new Date().toISOString().slice(0, 16)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.endDate ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
                aria-label={isArabic ? 'تاريخ الانتهاء والوقت' : 'End date and time'}
                title={isArabic ? 'اختر تاريخ ووقت انتهاء المهمة' : 'Select task end date and time'}
              />
              {errors.endDate && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.endDate}
                </p>
              )}
            </div>
          </div>

          {/* Alert Settings */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="alertBeforeDue"
                  checked={formData.alertBeforeDue}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  disabled={isSubmitting}
                />
                <span className="ml-2 text-sm font-medium text-blue-900">
                  {isArabic ? 'إرسال تنبيه قبل تاريخ الانتهاء' : 'Send alert before due date'}
                </span>
              </label>
            </div>
            
            {formData.alertBeforeDue && (
              <div className="mt-3">
                <select
                  name="alertDays"
                  value={formData.alertDays}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-blue-200 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isSubmitting}
                  aria-label={isArabic ? 'عدد أيام التنبيه' : 'Alert days'}
                  title={isArabic ? 'اختر عدد الأيام قبل تاريخ الانتهاء للتنبيه' : 'Select number of days before due date for alert'}
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            {isArabic ? 'حالة المهمة' : 'Task Status'}
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(['pending', 'in_progress', 'completed', 'cancelled'] as const).map(status => (
              <label key={status} className="relative">
                <input
                  type="radio"
                  name="status"
                  value={status}
                  checked={formData.status === status}
                  onChange={handleInputChange}
                  className="sr-only peer"
                  disabled={isSubmitting}
                />
                <div className={`px-3 py-2 rounded-lg border-2 cursor-pointer transition-all text-center text-sm font-medium ${
                  formData.status === status
                    ? statusColors[status] + ' border-current'
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* File Upload */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Upload className="w-5 h-5 text-blue-500" />
            {isArabic ? 'المرفقات' : 'Attachments'}
            <span className="text-sm font-normal text-gray-500">
              ({isArabic ? 'صور، فيديوهات، مستندات' : 'Images, Videos, Documents'})
            </span>
          </h3>
          
          {/* Drop Zone */}
          <div className="relative">
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                isDragging 
                  ? 'border-blue-500 bg-blue-50 scale-[1.02]' 
                  : 'border-gray-300 bg-gray-50'
              }`}
            >
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <Upload className="w-8 h-8 text-blue-500" />
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-700">
                    {isArabic 
                      ? 'اسحب الملفات هنا أو' 
                      : 'Drag files here or'
                    }
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    aria-label={isArabic ? 'اختر ملفات' : 'Select files'}
                  >
                    {isArabic ? 'اختر ملفات' : 'Select Files'}
                  </button>
                  <p className="text-sm text-gray-500 mt-2">
                    {isArabic 
                      ? 'جميع أنواع الملفات مدعومة (الحد الأقصى: 100 ميجابايت)' 
                      : 'All file types supported (Max: 100MB)'
                    }
                  </p>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar,.7z,.tar,.gz,.psd,.ai,.eps,.svg,.dwg,.skp,.stl,.obj,.dae,.3ds,.blend,.max,.c4d,.ma,.mb,.fbx,.unity,.package,.prefab,.scene,.anim,.controller,.shader,.compute,.cg,.hlsl,.glsl,.metal,.spirv,.wasm,.js,.jsx,.ts,.tsx,.html,.css,.scss,.sass,.less,.xml,.json,.yaml,.yml,.toml,.ini,.cfg,.conf,.log,.bak,.tmp,.cache,.lock,.env,.config,.settings,.prefs,.profile,.session,.cookie,.token,.key,.pem,.crt,.cer,.der,.p12,.pfx,.jks,.keystore,.bks,.mobileprovision,.provisionprofile,.ipa,.apk,.aab,.exe,.msi,.dmg,.pkg,.deb,.rpm,.snap,.flatpak,.appimage,.bin,.run,.sh,.bat,.cmd,.ps1,.py,.rb,.php,.pl,.go,.rs,.java,.class,.jar,.war,.ear,.nar,.swf,.flv,.avi,.mov,.wmv,.mp4,.m4v,.3gp,.3g2,.mkv,.webm,.ogg,.ogv,.oga,.wav,.mp3,.flac,.aac,.m4a,.wma,.aiff,.au,.ra,.amr,.3ga,.m4b,.m4p,.m4r,.ogg,.opus"
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
                disabled={isSubmitting}
                aria-label={isArabic ? 'اختر ملفات للرفع' : 'Select files to upload'}
                title={isArabic ? 'اختر ملفات للرفع (جميع أنواع الملفات المدعومة)' : 'Select files to upload (all supported file types)'}
              />
            </div>
          </div>

          {/* Uploaded Files */}
          {uploadedFiles.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                {isArabic ? 'الملفات المرفوعة' : 'Uploaded Files'} ({uploadedFiles.length})
              </h4>
              <div className="space-y-2">
                {uploadedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="text-blue-500">
                        {getFileIcon(file.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(file.id)}
                      className="text-red-500 hover:text-red-700 transition-colors p-1"
                      disabled={isSubmitting}
                      aria-label={isArabic ? 'إزالة الملف' : 'Remove file'}
                      title={isArabic ? 'إزالة هذا الملف من المرفقات' : 'Remove this file from attachments'}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-center pt-6">
          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] disabled:scale-100 shadow-lg"
          >
            {isSubmitting || isLoading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {isArabic ? 'جاري الإرسال...' : 'Creating Task...'}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                {isArabic ? 'إنشاء المهمة' : 'Create Task'}
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
