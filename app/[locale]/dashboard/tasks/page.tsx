"use client";
import React, { useState, useEffect } from "react";
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  User as UserIcon,
  Clock,
  CheckCircle,
  AlertCircle,
  Filter,
  RefreshCw,
  X,
  Bell,
  TrendingUp,
  BarChart3,
  Settings,
  Moon,
  Sun,
} from "lucide-react";
import { useLocale } from "next-intl";

interface Task {
  id: string;
  title: string;
  description: string;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";
  assignedTo: string;
  assignedToName?: string;
  relatedTo: string[];
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  attachments?: TaskFile[];
}

interface TaskFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url?: string;
  file?: File;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

// Arabic translations
const translations = {
  en: {
    taskManager: "Task Manager",
    welcomeBack: "Welcome back",
    notifications: "Notifications",
    stats: "Stats",
    totalTasks: "Total Tasks",
    completed: "Completed",
    inProgress: "In Progress",
    pending: "Pending",
    urgent: "Urgent",
    searchTasks: "Search tasks...",
    allStatus: "All Status",
    pendingStatus: "Pending",
    inProgressStatus: "In Progress",
    completedStatus: "Completed",
    cancelledStatus: "Cancelled",
    allPriority: "All Priority",
    lowPriority: "Low",
    mediumPriority: "Medium",
    highPriority: "High",
    urgentPriority: "Urgent",
    newTask: "New Task",
    createNewTask: "Create New Task",
    editTask: "Edit Task",
    taskTitle: "Task Title",
    assignedTo: "Assigned To",
    relatedTo: "Related To",
    description: "Description",
    status: "Status",
    priority: "Priority",
    startDate: "Start Date",
    endDate: "Due Date",
    selectUser: "Select user",
    enterTaskTitle: "Enter task title",
    enterTaskDescription: "Enter task description",
    attachments: "Attachments",
    addFiles: "Add Files",
    dropFiles: "Drop files here or click to browse",
    supportedFormats:
      "Supported formats: Images, Videos, Documents, PDFs and more",
    maxFileSize: "Maximum file size: 10MB",
    removeFile: "Remove file",
    fileTooBig: "File size exceeds 10MB limit",
    cancel: "Cancel",
    createTask: "Create Task",
    updateTask: "Update Task",
    tasks: "Tasks",
    noTasksFound: "No tasks found",
    getStarted: "Get started by creating your first task",
    due: "Due",
    created: "Created",
  },
  ar: {
    taskManager: "مدير المهام",
    welcomeBack: "مرحباً بعودتك",
    notifications: "الإشعارات",
    stats: "الإحصائيات",
    totalTasks: "إجمالي المهام",
    completed: "مكتمل",
    inProgress: "قيد التنفيذ",
    pending: "في الانتظار",
    urgent: "عاجل",
    searchTasks: "البحث في المهام...",
    allStatus: "كل الحالات",
    pendingStatus: "في الانتظار",
    inProgressStatus: "قيد التنفيذ",
    completedStatus: "مكتمل",
    cancelledStatus: "ملغي",
    allPriority: "كل الأولويات",
    lowPriority: "منخفض",
    mediumPriority: "متوسط",
    highPriority: "مرتفع",
    urgentPriority: "عاجل",
    newTask: "مهمة جديدة",
    createNewTask: "إنشاء مهمة جديدة",
    editTask: "تعديل المهمة",
    taskTitle: "عنوان المهمة",
    assignedTo: "المسند إليه",
    relatedTo: "متعلق بـ",
    description: "الوصف",
    status: "الحالة",
    priority: "الأولوية",
    startDate: "تاريخ البدء",
    endDate: "تاريخ الاستحقاق",
    selectUser: "اختر المستخدم",
    enterTaskTitle: "أدخل عنوان المهمة",
    enterTaskDescription: "أدخل وصف المهمة",
    attachments: "المرفقات",
    addFiles: "إضافة ملفات",
    dropFiles: "اسقط الملفات هنا أو انقر للاختيار",
    supportedFormats:
      "التنسيقات المدعومة: صور، فيديو، مستندات، ملفات PDF والمزيد",
=======
import { motion } from "framer-motion";
import { useLocale } from "next-intl";
import RoleBasedTaskDashboard from "@/components/dashboard/RoleBasedTaskDashboard";
import { Shield, ArrowLeft } from "lucide-react";
import Link from "next/link";

=======
import { motion } from "framer-motion";
import { useLocale } from "next-intl";
import RoleBasedTaskDashboard from "@/components/dashboard/RoleBasedTaskDashboard";
import { Shield, ArrowLeft } from "lucide-react";
import Link from "next/link";

>>>>>>> Stashed changes
=======
import { motion } from "framer-motion";
import { useLocale } from "next-intl";
import RoleBasedTaskDashboard from "@/components/dashboard/RoleBasedTaskDashboard";
import { Shield, ArrowLeft } from "lucide-react";
import Link from "next/link";

>>>>>>> Stashed changes
=======
import { motion } from "framer-motion";
import { useLocale } from "next-intl";
import RoleBasedTaskDashboard from "@/components/dashboard/RoleBasedTaskDashboard";
import { Shield, ArrowLeft } from "lucide-react";
import Link from "next/link";

>>>>>>> Stashed changes
=======
import { motion } from "framer-motion";
import { useLocale } from "next-intl";
import RoleBasedTaskDashboard from "@/components/dashboard/RoleBasedTaskDashboard";
import { Shield, ArrowLeft } from "lucide-react";
import Link from "next/link";

>>>>>>> Stashed changes
export default function TasksPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = useLocale();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900">
      <div className="container mx-auto p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <Link href={`/${locale}/dashboard`}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/20 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </motion.button>
            </Link>
            
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold text-white">
                  {locale === 'ar' ? 'إدارة المهام' : 'Task Management'}
                </h1>
                <p className="text-white/70">
                  {locale === 'ar' ? 'نظام إدارة المهام المستند إلى الأدوار' : 'Role-based task management system'}
                </p>
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Task Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-6">
            <RoleBasedTaskDashboard className="w-full" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
    dropFiles: "اسقط الملفات هنا أو انقر للاختيار",
    supportedFormats: "التنسيقات المدعومة: صور، فيديو، مستندات، ملفات PDF والمزيد",
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
    maxFileSize: "أقصى حجم للملف: 10 ميجابايت",
    removeFile: "إزالة الملف",
    fileTooBig: "حجم الملف يتجاوز حد 10 ميجابايت",
    cancel: "إلغاء",
    createTask: "إنشاء مهمة",
    updateTask: "تحديث المهمة",
    tasks: "المهام",
    noTasksFound: "لم يتم العثور على مهام",
    getStarted: "ابدأ بإنشاء أول مهمة لك",
    due: "استحقاق",
    created: "إنشاء",
  },
};

const TaskManager = () => {
  const locale = useLocale() as "en" | "ar";
  const t = translations[locale];
  const isRTL = locale === "ar";
  const [isDarkMode, setIsDarkMode] = useState(false);
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream

=======
  
>>>>>>> Stashed changes
=======
  
>>>>>>> Stashed changes
=======
  
>>>>>>> Stashed changes
=======
  
>>>>>>> Stashed changes
  // State management
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "pending" as Task["status"],
    priority: "medium" as Task["priority"],
    assignedTo: "",
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
    relatedTo: [] as string[],
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
    startDate: "",
    endDate: "",
  });
  const [attachments, setAttachments] = useState<TaskFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showStats, setShowStats] = useState(false);
  const [session, setSession] = useState<any>(null);

  // Apply dark mode class to body
  useEffect(() => {
    if (isDarkMode) {
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
=======
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
>>>>>>> Stashed changes
=======
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
>>>>>>> Stashed changes
=======
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
>>>>>>> Stashed changes
=======
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
>>>>>>> Stashed changes
    }
  }, [isDarkMode]);

  // Mock data for demonstration
  useEffect(() => {
    // Initialize with mock data
    const mockTasks: Task[] = [
      {
        id: "1",
        title: "Complete project documentation",
        description: "Write comprehensive documentation for the new feature",
        status: "in_progress",
        priority: "high",
        assignedTo: "john@example.com",
        assignedToName: "John Doe",
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
        relatedTo: ["hope_bridge"],
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
        startDate: "2024-12-01",
        endDate: "2024-12-15",
        createdAt: "2024-12-01",
        updatedAt: "2024-12-01",
      },
      {
        id: "2",
        title: "Review pull requests",
        description: "Review and approve pending pull requests",
        status: "pending",
        priority: "medium",
        assignedTo: "jane@example.com",
        assignedToName: "Jane Smith",
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
        relatedTo: ["ummah", "one_nation"],
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
        startDate: "2024-12-01",
        endDate: "2024-12-10",
        createdAt: "2024-12-01",
        updatedAt: "2024-12-01",
      },
      {
        id: "3",
        title: "Fix critical bug",
        description: "Resolve the authentication issue reported by users",
        status: "completed",
        priority: "urgent",
        assignedTo: "bob@example.com",
        assignedToName: "Bob Johnson",
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
        relatedTo: ["dudley"],
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
        startDate: "2024-12-01",
        endDate: "2024-12-05",
        createdAt: "2024-12-01",
        updatedAt: "2024-12-03",
      },
    ];

    const mockUsers: User[] = [
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
      {
        id: "1",
        name: "John Doe",
        email: "john@example.com",
        role: "developer",
      },
      {
        id: "2",
        name: "Jane Smith",
        email: "jane@example.com",
        role: "designer",
      },
      {
        id: "3",
        name: "Bob Johnson",
        email: "bob@example.com",
        role: "manager",
      },
=======
      { id: "1", name: "John Doe", email: "john@example.com", role: "developer" },
      { id: "2", name: "Jane Smith", email: "jane@example.com", role: "designer" },
      { id: "3", name: "Bob Johnson", email: "bob@example.com", role: "manager" },
>>>>>>> Stashed changes
=======
      { id: "1", name: "John Doe", email: "john@example.com", role: "developer" },
      { id: "2", name: "Jane Smith", email: "jane@example.com", role: "designer" },
      { id: "3", name: "Bob Johnson", email: "bob@example.com", role: "manager" },
>>>>>>> Stashed changes
=======
      { id: "1", name: "John Doe", email: "john@example.com", role: "developer" },
      { id: "2", name: "Jane Smith", email: "jane@example.com", role: "designer" },
      { id: "3", name: "Bob Johnson", email: "bob@example.com", role: "manager" },
>>>>>>> Stashed changes
=======
      { id: "1", name: "John Doe", email: "john@example.com", role: "developer" },
      { id: "2", name: "Jane Smith", email: "jane@example.com", role: "designer" },
      { id: "3", name: "Bob Johnson", email: "bob@example.com", role: "manager" },
>>>>>>> Stashed changes
    ];

    setTasks(mockTasks);
    setUsers(mockUsers);
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
    setSession({
      user: {
        name: locale === "ar" ? "مدير النظام" : "Admin User",
        email: "admin@example.com",
        role: "admin",
      },
    });
=======
    setSession({ user: { name: locale === "ar" ? "مدير النظام" : "Admin User", email: "admin@example.com", role: "admin" } });
>>>>>>> Stashed changes
=======
    setSession({ user: { name: locale === "ar" ? "مدير النظام" : "Admin User", email: "admin@example.com", role: "admin" } });
>>>>>>> Stashed changes
=======
    setSession({ user: { name: locale === "ar" ? "مدير النظام" : "Admin User", email: "admin@example.com", role: "admin" } });
>>>>>>> Stashed changes
=======
    setSession({ user: { name: locale === "ar" ? "مدير النظام" : "Admin User", email: "admin@example.com", role: "admin" } });
>>>>>>> Stashed changes

    // Mock notifications
    setNotifications([
      {
        id: "1",
        title: locale === "ar" ? "مهمة جديدة معينة" : "New task assigned",
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
        message:
          locale === "ar"
            ? "لقد تم تعيينك لـ 'إكمال وثائق المشروع'"
            : "You have been assigned to 'Complete project documentation'",
=======
        message: locale === "ar" 
          ? "لقد تم تعيينك لـ 'إكمال وثائق المشروع'"
          : "You have been assigned to 'Complete project documentation'",
>>>>>>> Stashed changes
=======
        message: locale === "ar" 
          ? "لقد تم تعيينك لـ 'إكمال وثائق المشروع'"
          : "You have been assigned to 'Complete project documentation'",
>>>>>>> Stashed changes
=======
        message: locale === "ar" 
          ? "لقد تم تعيينك لـ 'إكمال وثائق المشروع'"
          : "You have been assigned to 'Complete project documentation'",
>>>>>>> Stashed changes
=======
        message: locale === "ar" 
          ? "لقد تم تعيينك لـ 'إكمال وثائق المشروع'"
          : "You have been assigned to 'Complete project documentation'",
>>>>>>> Stashed changes
        type: "task_assigned",
        read: false,
        timestamp: new Date().toISOString(),
      },
    ]);
    setUnreadCount(1);
  }, []);

  // Filter tasks based on search and filters
  const filteredTasks = tasks.filter((task) => {
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      selectedStatus === "all" || task.status === selectedStatus;
    const matchesPriority =
      selectedPriority === "all" || task.priority === selectedPriority;
=======
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === "all" || task.status === selectedStatus;
    const matchesPriority = selectedPriority === "all" || task.priority === selectedPriority;
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Get status color
  const getStatusColor = (status: Task["status"]) => {
    const colors = {
      pending: "bg-amber-100 text-amber-800 border-amber-200",
      in_progress: "bg-blue-100 text-blue-800 border-blue-200",
      completed: "bg-emerald-100 text-emerald-800 border-emerald-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
    };
    return colors[status];
  };

  // Get priority color
  const getPriorityColor = (priority: Task["priority"]) => {
    const colors = {
      low: "bg-gray-100 text-gray-800 border-gray-200",
      medium: "bg-blue-100 text-blue-800 border-blue-200",
      high: "bg-orange-100 text-orange-800 border-orange-200",
      urgent: "bg-red-100 text-red-800 border-red-200",
    };
    return colors[priority];
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream

    if (editingTask) {
      // Update existing task
      setTasks(
        tasks.map((task) =>
          task.id === editingTask.id
            ? {
                ...task,
                ...formData,
                attachments,
                updatedAt: new Date().toISOString(),
              }
            : task
        )
      );
=======
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
    
    if (editingTask) {
      // Update existing task
      setTasks(tasks.map(task => 
        task.id === editingTask.id 
          ? { ...task, ...formData, attachments, updatedAt: new Date().toISOString() }
          : task
      ));
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
    } else {
      // Create new task
      const newTask: Task = {
        id: Date.now().toString(),
        ...formData,
        attachments,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setTasks([newTask, ...tasks]);
    }

    // Reset form
    setFormData({
      title: "",
      description: "",
      status: "pending",
      priority: "medium",
      assignedTo: "",
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
      relatedTo: [],
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
      startDate: "",
      endDate: "",
    });
    setAttachments([]);
    setUploadError(null);
    setShowCreateForm(false);
    setEditingTask(null);
  };

  // Handle task deletion
  const handleDelete = (taskId: string) => {
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
    setTasks(tasks.filter((task) => task.id !== taskId));
=======
    setTasks(tasks.filter(task => task.id !== taskId));
>>>>>>> Stashed changes
=======
    setTasks(tasks.filter(task => task.id !== taskId));
>>>>>>> Stashed changes
=======
    setTasks(tasks.filter(task => task.id !== taskId));
>>>>>>> Stashed changes
=======
    setTasks(tasks.filter(task => task.id !== taskId));
>>>>>>> Stashed changes
  };

  // Handle task edit
  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      assignedTo: task.assignedTo,
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
      relatedTo: task.relatedTo || [],
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
      startDate: task.startDate,
      endDate: task.endDate,
    });
    setAttachments(task.attachments || []);
    setShowCreateForm(true);
  };

  // File upload handlers
  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream

    const newFiles: TaskFile[] = [];
    const maxSize = 10 * 1024 * 1024; // 10MB

    Array.from(files).forEach((file) => {
=======
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
    
    const newFiles: TaskFile[] = [];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    Array.from(files).forEach(file => {
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
      if (file.size > maxSize) {
        setUploadError(t.fileTooBig);
        return;
      }
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream

=======
      
>>>>>>> Stashed changes
=======
      
>>>>>>> Stashed changes
=======
      
>>>>>>> Stashed changes
=======
      
>>>>>>> Stashed changes
      const taskFile: TaskFile = {
        id: Date.now().toString() + Math.random().toString(36),
        name: file.name,
        type: file.type,
        size: file.size,
        file: file,
      };
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream

      newFiles.push(taskFile);
    });

=======
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
      
      newFiles.push(taskFile);
    });
    
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
    if (newFiles.length > 0) {
      setAttachments([...attachments, ...newFiles]);
      setUploadError(null);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream

=======
    
>>>>>>> Stashed changes
=======
    
>>>>>>> Stashed changes
=======
    
>>>>>>> Stashed changes
=======
    
>>>>>>> Stashed changes
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const removeFile = (fileId: string) => {
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
    setAttachments(attachments.filter((file) => file.id !== fileId));
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return "🖼️";
    if (type.startsWith("video/")) return "🎥";
    if (type.includes("pdf")) return "📄";
    if (type.includes("word") || type.includes("document")) return "📝";
    if (type.includes("excel") || type.includes("spreadsheet")) return "📊";
    if (type.includes("powerpoint") || type.includes("presentation"))
      return "📈";
    if (type.includes("zip") || type.includes("rar") || type.includes("7z"))
      return "🗜️";
    return "📎";
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
=======
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
    setAttachments(attachments.filter(file => file.id !== fileId));
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return '🖼️';
    if (type.startsWith('video/')) return '🎥';
    if (type.includes('pdf')) return '📄';
    if (type.includes('word') || type.includes('document')) return '📝';
    if (type.includes('excel') || type.includes('spreadsheet')) return '📊';
    if (type.includes('powerpoint') || type.includes('presentation')) return '📈';
    if (type.includes('zip') || type.includes('rar') || type.includes('7z')) return '🗜️';
    return '📎';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
  };

  // Calculate stats
  const stats = {
    total: tasks.length,
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
    completed: tasks.filter((t) => t.status === "completed").length,
    pending: tasks.filter((t) => t.status === "pending").length,
    inProgress: tasks.filter((t) => t.status === "in_progress").length,
    urgent: tasks.filter((t) => t.priority === "urgent").length,
  };

  return (
    <div
      className={`min-h-screen ${isDarkMode ? "dark:bg-gray-900" : "bg-linear-to-br from-primary/10 via-primary/5 to-background"} p-4 md:p-8`}
    >
      <div
        className={`max-w-7xl mx-auto ${isDarkMode ? "dark:bg-gray-800" : "bg-white"} rounded-2xl shadow-2xl overflow-hidden`}
      >
        {/* Header */}
        <div
          className={`bg-linear-to-r from-primary to-primary/80 p-8 print:hidden relative`}
        >
          {/* Dark Mode Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 text-white" />
            ) : (
              <Moon className="w-5 h-5 text-white" />
=======
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Task Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-6">
            <RoleBasedTaskDashboard className="w-full" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
    dropFiles: "اسقط الملفات هنا أو انقر للاختيار",
    supportedFormats: "التنسيقات المدعومة: صور، فيديو، مستندات، ملفات PDF والمزيد",
    maxFileSize: "أقصى حجم للملف: 10 ميجابايت",
    removeFile: "إزالة الملف",
    fileTooBig: "حجم الملف يتجاوز حد 10 ميجابايت",
    cancel: "إلغاء",
    createTask: "إنشاء مهمة",
    updateTask: "تحديث المهمة",
    tasks: "المهام",
    noTasksFound: "لم يتم العثور على مهام",
    getStarted: "ابدأ بإنشاء أول مهمة لك",
    due: "استحقاق",
    created: "إنشاء",
  },
};

const TaskManager = () => {
  const locale = useLocale() as "en" | "ar";
  const t = translations[locale];
  const isRTL = locale === "ar";
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // State management
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "pending" as Task["status"],
    priority: "medium" as Task["priority"],
    assignedTo: "",
    startDate: "",
    endDate: "",
  });
  const [attachments, setAttachments] = useState<TaskFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showStats, setShowStats] = useState(false);
  const [session, setSession] = useState<any>(null);

  // Apply dark mode class to body
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Mock data for demonstration
  useEffect(() => {
    // Initialize with mock data
    const mockTasks: Task[] = [
      {
        id: "1",
        title: "Complete project documentation",
        description: "Write comprehensive documentation for the new feature",
        status: "in_progress",
        priority: "high",
        assignedTo: "john@example.com",
        assignedToName: "John Doe",
        startDate: "2024-12-01",
        endDate: "2024-12-15",
        createdAt: "2024-12-01",
        updatedAt: "2024-12-01",
      },
      {
        id: "2",
        title: "Review pull requests",
        description: "Review and approve pending pull requests",
        status: "pending",
        priority: "medium",
        assignedTo: "jane@example.com",
        assignedToName: "Jane Smith",
        startDate: "2024-12-01",
        endDate: "2024-12-10",
        createdAt: "2024-12-01",
        updatedAt: "2024-12-01",
      },
      {
        id: "3",
        title: "Fix critical bug",
        description: "Resolve the authentication issue reported by users",
        status: "completed",
        priority: "urgent",
        assignedTo: "bob@example.com",
        assignedToName: "Bob Johnson",
        startDate: "2024-12-01",
        endDate: "2024-12-05",
        createdAt: "2024-12-01",
        updatedAt: "2024-12-03",
      },
    ];

    const mockUsers: User[] = [
      { id: "1", name: "John Doe", email: "john@example.com", role: "developer" },
      { id: "2", name: "Jane Smith", email: "jane@example.com", role: "designer" },
      { id: "3", name: "Bob Johnson", email: "bob@example.com", role: "manager" },
    ];

    setTasks(mockTasks);
    setUsers(mockUsers);
    setSession({ user: { name: locale === "ar" ? "مدير النظام" : "Admin User", email: "admin@example.com", role: "admin" } });

    // Mock notifications
    setNotifications([
      {
        id: "1",
        title: locale === "ar" ? "مهمة جديدة معينة" : "New task assigned",
        message: locale === "ar" 
          ? "لقد تم تعيينك لـ 'إكمال وثائق المشروع'"
          : "You have been assigned to 'Complete project documentation'",
        type: "task_assigned",
        read: false,
        timestamp: new Date().toISOString(),
      },
    ]);
    setUnreadCount(1);
  }, []);

  // Filter tasks based on search and filters
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === "all" || task.status === selectedStatus;
    const matchesPriority = selectedPriority === "all" || task.priority === selectedPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Get status color
  const getStatusColor = (status: Task["status"]) => {
    const colors = {
      pending: "bg-amber-100 text-amber-800 border-amber-200",
      in_progress: "bg-blue-100 text-blue-800 border-blue-200",
      completed: "bg-emerald-100 text-emerald-800 border-emerald-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
    };
    return colors[status];
  };

  // Get priority color
  const getPriorityColor = (priority: Task["priority"]) => {
    const colors = {
      low: "bg-gray-100 text-gray-800 border-gray-200",
      medium: "bg-blue-100 text-blue-800 border-blue-200",
      high: "bg-orange-100 text-orange-800 border-orange-200",
      urgent: "bg-red-100 text-red-800 border-red-200",
    };
    return colors[priority];
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingTask) {
      // Update existing task
      setTasks(tasks.map(task => 
        task.id === editingTask.id 
          ? { ...task, ...formData, attachments, updatedAt: new Date().toISOString() }
          : task
      ));
    } else {
      // Create new task
      const newTask: Task = {
        id: Date.now().toString(),
        ...formData,
        attachments,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setTasks([newTask, ...tasks]);
    }

    // Reset form
    setFormData({
      title: "",
      description: "",
      status: "pending",
      priority: "medium",
      assignedTo: "",
      startDate: "",
      endDate: "",
    });
    setAttachments([]);
    setUploadError(null);
    setShowCreateForm(false);
    setEditingTask(null);
  };

  // Handle task deletion
  const handleDelete = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  // Handle task edit
  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      assignedTo: task.assignedTo,
      startDate: task.startDate,
      endDate: task.endDate,
    });
    setAttachments(task.attachments || []);
    setShowCreateForm(true);
  };

  // File upload handlers
  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    
    const newFiles: TaskFile[] = [];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    Array.from(files).forEach(file => {
      if (file.size > maxSize) {
        setUploadError(t.fileTooBig);
        return;
      }
      
      const taskFile: TaskFile = {
        id: Date.now().toString() + Math.random().toString(36),
        name: file.name,
        type: file.type,
        size: file.size,
        file: file,
      };
      
      newFiles.push(taskFile);
    });
    
    if (newFiles.length > 0) {
      setAttachments([...attachments, ...newFiles]);
      setUploadError(null);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const removeFile = (fileId: string) => {
    setAttachments(attachments.filter(file => file.id !== fileId));
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return '🖼️';
    if (type.startsWith('video/')) return '🎥';
    if (type.includes('pdf')) return '📄';
    if (type.includes('word') || type.includes('document')) return '📝';
    if (type.includes('excel') || type.includes('spreadsheet')) return '📊';
    if (type.includes('powerpoint') || type.includes('presentation')) return '📈';
    if (type.includes('zip') || type.includes('rar') || type.includes('7z')) return '🗜️';
    return '📎';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Calculate stats
  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === "completed").length,
    pending: tasks.filter(t => t.status === "pending").length,
    inProgress: tasks.filter(t => t.status === "in_progress").length,
    urgent: tasks.filter(t => t.priority === "urgent").length,
  };

  return (
=======
    completed: tasks.filter(t => t.status === "completed").length,
    pending: tasks.filter(t => t.status === "pending").length,
    inProgress: tasks.filter(t => t.status === "in_progress").length,
    urgent: tasks.filter(t => t.priority === "urgent").length,
  };

  return (
>>>>>>> Stashed changes
=======
    completed: tasks.filter(t => t.status === "completed").length,
    pending: tasks.filter(t => t.status === "pending").length,
    inProgress: tasks.filter(t => t.status === "in_progress").length,
    urgent: tasks.filter(t => t.priority === "urgent").length,
  };

  return (
>>>>>>> Stashed changes
=======
    completed: tasks.filter(t => t.status === "completed").length,
    pending: tasks.filter(t => t.status === "pending").length,
    inProgress: tasks.filter(t => t.status === "in_progress").length,
    urgent: tasks.filter(t => t.priority === "urgent").length,
  };

  return (
>>>>>>> Stashed changes
    <div className={`min-h-screen bg-gradient-to-br ${isDarkMode ? 'dark:bg-gray-900' : 'from-primary/5 via-white to-primary/10'}`}>
      {/* Header */}
      <div className={`bg-white ${isDarkMode ? 'dark:bg-gray-800' : ''} shadow-sm border-b border-primary/20`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t.taskManager}</h1>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{t.welcomeBack}, {session?.user?.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Dark Mode Toggle */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5 text-yellow-400" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-700" />
                )}
              </button>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`relative p-2 rounded-lg ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
                >
                  <Bell className={`w-5 h-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {showNotifications && (
                  <div className={`absolute right-0 mt-2 w-80 ${isDarkMode ? 'dark:bg-gray-800' : 'bg-white'} rounded-lg shadow-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} z-50`}>
                    <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t.notifications}</h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div key={notification.id} className={`p-4 border-b ${isDarkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-100 hover:bg-gray-50'}`}>
                          <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{notification.title}</p>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{notification.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Stats Toggle */}
              <button
                onClick={() => setShowStats(!showStats)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  showStats
                    ? "bg-primary text-white"
                    : isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <BarChart3 className="w-4 h-4 inline mr-2" />
                {t.stats}
              </button>

              {/* Refresh */}
              <button className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}>
                <RefreshCw className={`w-5 h-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <AnimatePresence>
          {showStats && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8"
            >
              <div className={`rounded-lg p-4 shadow-sm border border-primary/20 ${isDarkMode ? 'dark:bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{t.totalTasks}</p>
                    <p className="text-2xl font-bold text-primary">{stats.total}</p>
                  </div>
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-primary" />
                  </div>
                </div>
              </div>

              <div className={`rounded-lg p-4 shadow-sm border border-emerald-200 ${isDarkMode ? 'dark:bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{t.completed}</p>
                    <p className="text-2xl font-bold text-emerald-600">{stats.completed}</p>
                  </div>
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  </div>
                </div>
              </div>

              <div className={`rounded-lg p-4 shadow-sm border border-blue-200 ${isDarkMode ? 'dark:bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{t.inProgress}</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
                  </div>
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className={`rounded-lg p-4 shadow-sm border border-amber-200 ${isDarkMode ? 'dark:bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{t.pending}</p>
                    <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
                  </div>
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                  </div>
                </div>
              </div>

              <div className={`rounded-lg p-4 shadow-sm border border-red-200 ${isDarkMode ? 'dark:bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{t.urgent}</p>
                    <p className="text-2xl font-bold text-red-600">{stats.urgent}</p>
                  </div>
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search and Filters */}
        <div className={`rounded-lg shadow-sm border border-primary/20 p-6 mb-8 ${isDarkMode ? 'dark:bg-gray-800' : 'bg-white'}`}>
          <div className={`flex flex-col md:flex-row gap-4 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400`} />
                <input
                  type="text"
                  placeholder={t.searchTasks}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${isDarkMode ? 'dark:bg-gray-700 dark:border-gray-600 dark:text-white' : ''}`}
                />
              </div>
            </div>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className={`px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${isDarkMode ? 'dark:bg-gray-700 dark:border-gray-600 dark:text-white' : ''}`}
            >
              <option value="all">{t.allStatus}</option>
              <option value="pending">{t.pendingStatus}</option>
              <option value="in_progress">{t.inProgressStatus}</option>
              <option value="completed">{t.completedStatus}</option>
              <option value="cancelled">{t.cancelledStatus}</option>
            </select>

            {/* Priority Filter */}
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className={`px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${isDarkMode ? 'dark:bg-gray-700 dark:border-gray-600 dark:text-white' : ''}`}
            >
              <option value="all">{t.allPriority}</option>
              <option value="low">{t.lowPriority}</option>
              <option value="medium">{t.mediumPriority}</option>
              <option value="high">{t.highPriority}</option>
              <option value="urgent">{t.urgentPriority}</option>
            </select>

            {/* Create Task Button */}
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              {t.newTask}
            </button>
          </div>
        </div>

        {/* Create/Edit Task Form */}
        <AnimatePresence>
          {(showCreateForm || editingTask) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`rounded-lg shadow-sm border border-primary/20 p-6 mb-8 ${isDarkMode ? 'dark:bg-gray-800' : 'bg-white'}`}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {editingTask ? t.editTask : t.createNewTask}
                </h2>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingTask(null);
                    setFormData({
                      title: "",
                      description: "",
                      status: "pending",
                      priority: "medium",
                      assignedTo: "",
                      startDate: "",
                      endDate: "",
                    });
                    setAttachments([]);
                    setUploadError(null);
                  }}
                  className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
                >
                  <X className={`w-5 h-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`} />
                </button>
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${isRTL ? 'md:grid-cols-2' : ''}`}>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t.taskTitle}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${isDarkMode ? 'dark:bg-gray-700 dark:border-gray-600 dark:text-white' : ''}`}
                      placeholder={t.enterTaskTitle}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t.assignedTo}
                    </label>
                    <select
                      required
                      value={formData.assignedTo}
                      onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                      className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${isDarkMode ? 'dark:bg-gray-700 dark:border-gray-600 dark:text-white' : ''}`}
                    >
                      <option value="">{t.selectUser}</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.email}>
                          {user.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t.description}
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${isDarkMode ? 'dark:bg-gray-700 dark:border-gray-600 dark:text-white' : ''}`}
                    placeholder={t.enterTaskDescription}
                  />
                </div>

                <div className={`grid grid-cols-1 md:grid-cols-4 gap-4 ${isRTL ? 'md:grid-cols-4' : ''}`}>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t.status}
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as Task["status"] })}
                      className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${isDarkMode ? 'dark:bg-gray-700 dark:border-gray-600 dark:text-white' : ''}`}
                    >
                      <option value="pending">{t.pendingStatus}</option>
                      <option value="in_progress">{t.inProgressStatus}</option>
                      <option value="completed">{t.completedStatus}</option>
                      <option value="cancelled">{t.cancelledStatus}</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t.priority}
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as Task["priority"] })}
                      className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${isDarkMode ? 'dark:bg-gray-700 dark:border-gray-600 dark:text-white' : ''}`}
                    >
                      <option value="low">{t.lowPriority}</option>
                      <option value="medium">{t.mediumPriority}</option>
                      <option value="high">{t.highPriority}</option>
                      <option value="urgent">{t.urgentPriority}</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t.startDate}
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${isDarkMode ? 'dark:bg-gray-700 dark:border-gray-600 dark:text-white' : ''}`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t.endDate}
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${isDarkMode ? 'dark:bg-gray-700 dark:border-gray-600 dark:text-white' : ''}`}
                    />
                  </div>
                </div>

                {/* File Upload Section */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t.attachments}
                  </label>
                  
                  {/* Drop Zone */}
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                      dragActive 
                        ? 'border-primary bg-primary/5' 
                        : isDarkMode 
                          ? 'border-gray-600 hover:border-gray-500' 
                          : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      multiple
                      onChange={(e) => handleFileSelect(e.target.files)}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                          <Plus className="w-6 h-6 text-primary" />
                        </div>
                        <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t.addFiles}</p>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>{t.dropFiles}</p>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} mt-2`}>{t.supportedFormats}</p>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{t.maxFileSize}</p>
                      </div>
                    </label>
                  </div>

                  {/* Upload Error */}
                  {uploadError && (
                    <div className="mt-2 p-2 bg-red-100 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600">{uploadError}</p>
                    </div>
                  )}

                  {/* File List */}
                  {attachments.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {attachments.map((file) => (
                        <div
                          key={file.id}
                          className={`flex items-center justify-between p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{getFileIcon(file.type)}</span>
                            <div>
                              <p className={`font-medium text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{file.name}</p>
                              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{formatFileSize(file.size)}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(file.id)}
                            className={`p-1 rounded ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'} transition-colors`}
                          >
                            <X className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className={`flex justify-end gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setEditingTask(null);
                      setFormData({
                        title: "",
                        description: "",
                        status: "pending",
                        priority: "medium",
                        assignedTo: "",
                        startDate: "",
                        endDate: "",
                      });
                      setAttachments([]);
                      setUploadError(null);
                    }}
                    className={`px-6 py-3 border border-gray-200 rounded-lg font-medium hover:bg-gray-50 transition-colors ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'text-gray-700'}`}
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
                  >
                    {editingTask ? t.updateTask : t.createTask}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tasks List */}
        <div className={`rounded-lg shadow-sm border border-primary/20 p-6 mb-8 ${isDarkMode ? 'dark:bg-gray-800' : 'bg-white'}`}>
          <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {t.tasks} ({filteredTasks.length})
            </h2>
          </div>

          <div className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
            {filteredTasks.length === 0 ? (
              <div className="p-12 text-center">
                <div className={`w-16 h-16 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <CheckCircle className={`w-8 h-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                </div>
                <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>{t.noTasksFound}</h3>
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>{t.getStarted}</p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                  <Plus className="w-5 h-5 inline mr-2" />
                  {t.createTask}
                </button>
              </div>
            ) : (
              filteredTasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-6 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}
                >
                  <div className={`flex items-start justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className="flex-1">
                      <div className={`flex items-center gap-3 mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{task.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                          {task.status.replace("_", " ")}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>

                      <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>{task.description}</p>

                      {/* Attachments Display */}
                      {task.attachments && task.attachments.length > 0 && (
                        <div className="mb-4">
                          <div className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-2`}>
                            <span>📎</span>
                            <span>{task.attachments.length} {locale === 'ar' ? 'ملفات مرفقة' : 'attachments'}</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {task.attachments.slice(0, 3).map((file, index) => (
                              <div
                                key={index}
                                className={`flex items-center gap-2 px-2 py-1 rounded-lg text-xs ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}
                              >
                                <span>{getFileIcon(file.type)}</span>
                                <span className="truncate max-w-24">{file.name}</span>
                              </div>
                            ))}
                            {task.attachments.length > 3 && (
                              <div className={`flex items-center px-2 py-1 rounded-lg text-xs ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                                <span>+{task.attachments.length - 3} more</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <div className={`flex items-center gap-6 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <UserIcon className="w-4 h-4" />
                          <span>{task.assignedToName || task.assignedTo}</span>
                        </div>
                        <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <Calendar className="w-4 h-4" />
                          <span>{t.due} {new Date(task.endDate).toLocaleDateString()}</span>
                        </div>
                        <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <Clock className="w-4 h-4" />
                          <span>{t.created} {new Date(task.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className={`flex items-center gap-2 ${isRTL ? 'mr-6' : 'ml-6'}`}>
                      <button
                        onClick={() => handleEdit(task)}
                        className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
                      >
                        <Edit2 className={`w-4 h-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`} />
                      </button>
                      <button
                        onClick={() => handleDelete(task.id)}
                        className={`p-2 rounded-lg ${isDarkMode ? 'bg-red-900/50 hover:bg-red-900' : 'bg-red-100 hover:bg-red-200'} transition-colors`}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
>>>>>>> Stashed changes
            )}
          </button>

          <div
            className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-6 ${isRTL ? "md:flex-row-reverse" : ""}`}
          >
            <div
              className={`flex items-center gap-4 ${isRTL ? "flex-row-reverse" : ""}`}
            >
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
                <CheckCircle className="w-12 h-12 text-primary" />
              </div>
              <div className="text-white">
                <h1 className="text-sm font-semibold mb-1">
                  {locale === "ar"
                    ? "جمعية جسر الأمل الخيرية الفلسطينية"
                    : "Palestinian Hope Bridge Charitable Association"}
                </h1>
                <h2 className="text-lg font-bold">{t.taskManager}</h2>
              </div>
            </div>
            <div className="bg-white text-primary px-8 py-3 rounded-full shadow-lg">
              <span className="text-2xl font-bold tracking-wider">TASKS</span>
            </div>
=======
import { motion } from "framer-motion";
import { useLocale } from "next-intl";
import RoleBasedTaskDashboard from "@/components/dashboard/RoleBasedTaskDashboard";
import { Shield, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function TasksPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = useLocale();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900">
      <div className="container mx-auto p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <Link href={`/${locale}/dashboard`}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/20 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </motion.button>
            </Link>
            
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold text-white">
                  {locale === 'ar' ? 'إدارة المهام' : 'Task Management'}
                </h1>
                <p className="text-white/70">
                  {locale === 'ar' ? 'نظام إدارة المهام المستند إلى الأدوار' : 'Role-based task management system'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Task Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-6">
            <RoleBasedTaskDashboard className="w-full" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
    dropFiles: "اسقط الملفات هنا أو انقر للاختيار",
    supportedFormats: "التنسيقات المدعومة: صور، فيديو، مستندات، ملفات PDF والمزيد",
    maxFileSize: "أقصى حجم للملف: 10 ميجابايت",
    removeFile: "إزالة الملف",
    fileTooBig: "حجم الملف يتجاوز حد 10 ميجابايت",
    cancel: "إلغاء",
    createTask: "إنشاء مهمة",
    updateTask: "تحديث المهمة",
    tasks: "المهام",
    noTasksFound: "لم يتم العثور على مهام",
    getStarted: "ابدأ بإنشاء أول مهمة لك",
    due: "استحقاق",
    created: "إنشاء",
  },
};

const TaskManager = () => {
  const locale = useLocale() as "en" | "ar";
  const t = translations[locale];
  const isRTL = locale === "ar";
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // State management
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "pending" as Task["status"],
    priority: "medium" as Task["priority"],
    assignedTo: "",
    startDate: "",
    endDate: "",
  });
  const [attachments, setAttachments] = useState<TaskFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showStats, setShowStats] = useState(false);
  const [session, setSession] = useState<any>(null);

  // Apply dark mode class to body
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Mock data for demonstration
  useEffect(() => {
    // Initialize with mock data
    const mockTasks: Task[] = [
      {
        id: "1",
        title: "Complete project documentation",
        description: "Write comprehensive documentation for the new feature",
        status: "in_progress",
        priority: "high",
        assignedTo: "john@example.com",
        assignedToName: "John Doe",
        startDate: "2024-12-01",
        endDate: "2024-12-15",
        createdAt: "2024-12-01",
        updatedAt: "2024-12-01",
      },
      {
        id: "2",
        title: "Review pull requests",
        description: "Review and approve pending pull requests",
        status: "pending",
        priority: "medium",
        assignedTo: "jane@example.com",
        assignedToName: "Jane Smith",
        startDate: "2024-12-01",
        endDate: "2024-12-10",
        createdAt: "2024-12-01",
        updatedAt: "2024-12-01",
      },
      {
        id: "3",
        title: "Fix critical bug",
        description: "Resolve the authentication issue reported by users",
        status: "completed",
        priority: "urgent",
        assignedTo: "bob@example.com",
        assignedToName: "Bob Johnson",
        startDate: "2024-12-01",
        endDate: "2024-12-05",
        createdAt: "2024-12-01",
        updatedAt: "2024-12-03",
      },
    ];

    const mockUsers: User[] = [
      { id: "1", name: "John Doe", email: "john@example.com", role: "developer" },
      { id: "2", name: "Jane Smith", email: "jane@example.com", role: "designer" },
      { id: "3", name: "Bob Johnson", email: "bob@example.com", role: "manager" },
    ];

    setTasks(mockTasks);
    setUsers(mockUsers);
    setSession({ user: { name: locale === "ar" ? "مدير النظام" : "Admin User", email: "admin@example.com", role: "admin" } });

    // Mock notifications
    setNotifications([
      {
        id: "1",
        title: locale === "ar" ? "مهمة جديدة معينة" : "New task assigned",
        message: locale === "ar" 
          ? "لقد تم تعيينك لـ 'إكمال وثائق المشروع'"
          : "You have been assigned to 'Complete project documentation'",
        type: "task_assigned",
        read: false,
        timestamp: new Date().toISOString(),
      },
    ]);
    setUnreadCount(1);
  }, []);

  // Filter tasks based on search and filters
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === "all" || task.status === selectedStatus;
    const matchesPriority = selectedPriority === "all" || task.priority === selectedPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Get status color
  const getStatusColor = (status: Task["status"]) => {
    const colors = {
      pending: "bg-amber-100 text-amber-800 border-amber-200",
      in_progress: "bg-blue-100 text-blue-800 border-blue-200",
      completed: "bg-emerald-100 text-emerald-800 border-emerald-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
    };
    return colors[status];
  };

  // Get priority color
  const getPriorityColor = (priority: Task["priority"]) => {
    const colors = {
      low: "bg-gray-100 text-gray-800 border-gray-200",
      medium: "bg-blue-100 text-blue-800 border-blue-200",
      high: "bg-orange-100 text-orange-800 border-orange-200",
      urgent: "bg-red-100 text-red-800 border-red-200",
    };
    return colors[priority];
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingTask) {
      // Update existing task
      setTasks(tasks.map(task => 
        task.id === editingTask.id 
          ? { ...task, ...formData, attachments, updatedAt: new Date().toISOString() }
          : task
      ));
    } else {
      // Create new task
      const newTask: Task = {
        id: Date.now().toString(),
        ...formData,
        attachments,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setTasks([newTask, ...tasks]);
    }

    // Reset form
    setFormData({
      title: "",
      description: "",
      status: "pending",
      priority: "medium",
      assignedTo: "",
      startDate: "",
      endDate: "",
    });
    setAttachments([]);
    setUploadError(null);
    setShowCreateForm(false);
    setEditingTask(null);
  };

  // Handle task deletion
  const handleDelete = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  // Handle task edit
  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      assignedTo: task.assignedTo,
      startDate: task.startDate,
      endDate: task.endDate,
    });
    setAttachments(task.attachments || []);
    setShowCreateForm(true);
  };

  // File upload handlers
  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    
    const newFiles: TaskFile[] = [];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    Array.from(files).forEach(file => {
      if (file.size > maxSize) {
        setUploadError(t.fileTooBig);
        return;
      }
      
      const taskFile: TaskFile = {
        id: Date.now().toString() + Math.random().toString(36),
        name: file.name,
        type: file.type,
        size: file.size,
        file: file,
      };
      
      newFiles.push(taskFile);
    });
    
    if (newFiles.length > 0) {
      setAttachments([...attachments, ...newFiles]);
      setUploadError(null);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const removeFile = (fileId: string) => {
    setAttachments(attachments.filter(file => file.id !== fileId));
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return '🖼️';
    if (type.startsWith('video/')) return '🎥';
    if (type.includes('pdf')) return '📄';
    if (type.includes('word') || type.includes('document')) return '📝';
    if (type.includes('excel') || type.includes('spreadsheet')) return '📊';
    if (type.includes('powerpoint') || type.includes('presentation')) return '📈';
    if (type.includes('zip') || type.includes('rar') || type.includes('7z')) return '🗜️';
    return '📎';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Calculate stats
  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === "completed").length,
    pending: tasks.filter(t => t.status === "pending").length,
    inProgress: tasks.filter(t => t.status === "in_progress").length,
    urgent: tasks.filter(t => t.priority === "urgent").length,
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${isDarkMode ? 'dark:bg-gray-900' : 'from-primary/5 via-white to-primary/10'}`}>
      {/* Header */}
      <div className={`bg-white ${isDarkMode ? 'dark:bg-gray-800' : ''} shadow-sm border-b border-primary/20`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t.taskManager}</h1>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{t.welcomeBack}, {session?.user?.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Dark Mode Toggle */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5 text-yellow-400" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-700" />
                )}
              </button>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`relative p-2 rounded-lg ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
                >
                  <Bell className={`w-5 h-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {showNotifications && (
                  <div className={`absolute right-0 mt-2 w-80 ${isDarkMode ? 'dark:bg-gray-800' : 'bg-white'} rounded-lg shadow-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} z-50`}>
                    <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t.notifications}</h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div key={notification.id} className={`p-4 border-b ${isDarkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-100 hover:bg-gray-50'}`}>
                          <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{notification.title}</p>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{notification.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Stats Toggle */}
              <button
                onClick={() => setShowStats(!showStats)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  showStats
                    ? "bg-primary text-white"
                    : isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <BarChart3 className="w-4 h-4 inline mr-2" />
                {t.stats}
              </button>

              {/* Refresh */}
              <button className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}>
                <RefreshCw className={`w-5 h-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`} />
              </button>
            </div>
>>>>>>> Stashed changes
          </div>
        </div>
      </div>

<<<<<<< Updated upstream
        {/* Main Content */}
        <div className="p-8">
          {/* Stats Cards */}
          <AnimatePresence>
            {showStats && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8"
              >
                <div className="bg-linear-to-br from-primary/5 to-primary/10 p-6 rounded-xl border-l-4 border-primary shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                        {t.totalTasks}
                      </p>
                      <p className="text-3xl font-bold text-primary">
                        {stats.total}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                </div>

                <div className="bg-linear-to-br from-emerald-50 to-emerald-100 p-6 rounded-xl border-l-4 border-emerald-500 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                        {t.completed}
                      </p>
                      <p className="text-3xl font-bold text-emerald-600">
                        {stats.completed}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-emerald-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-linear-to-br from-blue-50 to-blue-100 p-6 rounded-xl border-l-4 border-blue-500 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                        {t.inProgress}
                      </p>
                      <p className="text-3xl font-bold text-blue-600">
                        {stats.inProgress}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Clock className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-linear-to-br from-amber-50 to-amber-100 p-6 rounded-xl border-l-4 border-amber-500 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                        {t.pending}
                      </p>
                      <p className="text-3xl font-bold text-amber-600">
                        {stats.pending}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                      <AlertCircle className="w-6 h-6 text-amber-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-linear-to-br from-red-50 to-red-100 p-6 rounded-xl border-l-4 border-red-500 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                        {t.urgent}
                      </p>
                      <p className="text-3xl font-bold text-red-600">
                        {stats.urgent}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <AlertCircle className="w-6 h-6 text-red-600" />
                    </div>
                  </div>
                </div>
              </motion.div>
=======
    completed: tasks.filter(t => t.status === "completed").length,
    pending: tasks.filter(t => t.status === "pending").length,
    inProgress: tasks.filter(t => t.status === "in_progress").length,
    urgent: tasks.filter(t => t.priority === "urgent").length,
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${isDarkMode ? 'dark:bg-gray-900' : 'from-primary/5 via-white to-primary/10'}`}>
      {/* Header */}
      <div className={`bg-white ${isDarkMode ? 'dark:bg-gray-800' : ''} shadow-sm border-b border-primary/20`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t.taskManager}</h1>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{t.welcomeBack}, {session?.user?.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Dark Mode Toggle */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5 text-yellow-400" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-700" />
                )}
              </button>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`relative p-2 rounded-lg ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
                >
                  <Bell className={`w-5 h-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {showNotifications && (
                  <div className={`absolute right-0 mt-2 w-80 ${isDarkMode ? 'dark:bg-gray-800' : 'bg-white'} rounded-lg shadow-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} z-50`}>
                    <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t.notifications}</h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div key={notification.id} className={`p-4 border-b ${isDarkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-100 hover:bg-gray-50'}`}>
                          <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{notification.title}</p>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{notification.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Stats Toggle */}
              <button
                onClick={() => setShowStats(!showStats)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  showStats
                    ? "bg-primary text-white"
                    : isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <BarChart3 className="w-4 h-4 inline mr-2" />
                {t.stats}
              </button>

              {/* Refresh */}
              <button className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}>
                <RefreshCw className={`w-5 h-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <AnimatePresence>
          {showStats && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8"
            >
              <div className={`rounded-lg p-4 shadow-sm border border-primary/20 ${isDarkMode ? 'dark:bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{t.totalTasks}</p>
                    <p className="text-2xl font-bold text-primary">{stats.total}</p>
                  </div>
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-primary" />
                  </div>
                </div>
              </div>

              <div className={`rounded-lg p-4 shadow-sm border border-emerald-200 ${isDarkMode ? 'dark:bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{t.completed}</p>
                    <p className="text-2xl font-bold text-emerald-600">{stats.completed}</p>
                  </div>
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  </div>
                </div>
              </div>

              <div className={`rounded-lg p-4 shadow-sm border border-blue-200 ${isDarkMode ? 'dark:bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{t.inProgress}</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
                  </div>
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className={`rounded-lg p-4 shadow-sm border border-amber-200 ${isDarkMode ? 'dark:bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{t.pending}</p>
                    <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
                  </div>
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                  </div>
                </div>
              </div>

              <div className={`rounded-lg p-4 shadow-sm border border-red-200 ${isDarkMode ? 'dark:bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{t.urgent}</p>
                    <p className="text-2xl font-bold text-red-600">{stats.urgent}</p>
                  </div>
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search and Filters */}
        <div className={`rounded-lg shadow-sm border border-primary/20 p-6 mb-8 ${isDarkMode ? 'dark:bg-gray-800' : 'bg-white'}`}>
          <div className={`flex flex-col md:flex-row gap-4 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400`} />
                <input
                  type="text"
                  placeholder={t.searchTasks}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${isDarkMode ? 'dark:bg-gray-700 dark:border-gray-600 dark:text-white' : ''}`}
                />
              </div>
            </div>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className={`px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${isDarkMode ? 'dark:bg-gray-700 dark:border-gray-600 dark:text-white' : ''}`}
            >
              <option value="all">{t.allStatus}</option>
              <option value="pending">{t.pendingStatus}</option>
              <option value="in_progress">{t.inProgressStatus}</option>
              <option value="completed">{t.completedStatus}</option>
              <option value="cancelled">{t.cancelledStatus}</option>
            </select>

            {/* Priority Filter */}
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className={`px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${isDarkMode ? 'dark:bg-gray-700 dark:border-gray-600 dark:text-white' : ''}`}
            >
              <option value="all">{t.allPriority}</option>
              <option value="low">{t.lowPriority}</option>
              <option value="medium">{t.mediumPriority}</option>
              <option value="high">{t.highPriority}</option>
              <option value="urgent">{t.urgentPriority}</option>
            </select>

            {/* Create Task Button */}
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              {t.newTask}
            </button>
          </div>
        </div>

        {/* Create/Edit Task Form */}
        <AnimatePresence>
          {(showCreateForm || editingTask) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`rounded-lg shadow-sm border border-primary/20 p-6 mb-8 ${isDarkMode ? 'dark:bg-gray-800' : 'bg-white'}`}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {editingTask ? t.editTask : t.createNewTask}
                </h2>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingTask(null);
                    setFormData({
                      title: "",
                      description: "",
                      status: "pending",
                      priority: "medium",
                      assignedTo: "",
                      startDate: "",
                      endDate: "",
                    });
                    setAttachments([]);
                    setUploadError(null);
                  }}
                  className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
                >
                  <X className={`w-5 h-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`} />
                </button>
              </div>
=======
              </div>
>>>>>>> Stashed changes
=======
              </div>
>>>>>>> Stashed changes
=======
              </div>
>>>>>>> Stashed changes

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${isRTL ? 'md:grid-cols-2' : ''}`}>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t.taskTitle}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${isDarkMode ? 'dark:bg-gray-700 dark:border-gray-600 dark:text-white' : ''}`}
                      placeholder={t.enterTaskTitle}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t.assignedTo}
                    </label>
                    <select
                      required
                      value={formData.assignedTo}
                      onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                      className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${isDarkMode ? 'dark:bg-gray-700 dark:border-gray-600 dark:text-white' : ''}`}
                    >
                      <option value="">{t.selectUser}</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.email}>
                          {user.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t.description}
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${isDarkMode ? 'dark:bg-gray-700 dark:border-gray-600 dark:text-white' : ''}`}
                    placeholder={t.enterTaskDescription}
                  />
                </div>

                <div className={`grid grid-cols-1 md:grid-cols-4 gap-4 ${isRTL ? 'md:grid-cols-4' : ''}`}>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t.status}
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as Task["status"] })}
                      className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${isDarkMode ? 'dark:bg-gray-700 dark:border-gray-600 dark:text-white' : ''}`}
                    >
                      <option value="pending">{t.pendingStatus}</option>
                      <option value="in_progress">{t.inProgressStatus}</option>
                      <option value="completed">{t.completedStatus}</option>
                      <option value="cancelled">{t.cancelledStatus}</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t.priority}
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as Task["priority"] })}
                      className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${isDarkMode ? 'dark:bg-gray-700 dark:border-gray-600 dark:text-white' : ''}`}
                    >
                      <option value="low">{t.lowPriority}</option>
                      <option value="medium">{t.mediumPriority}</option>
                      <option value="high">{t.highPriority}</option>
                      <option value="urgent">{t.urgentPriority}</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t.startDate}
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${isDarkMode ? 'dark:bg-gray-700 dark:border-gray-600 dark:text-white' : ''}`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t.endDate}
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${isDarkMode ? 'dark:bg-gray-700 dark:border-gray-600 dark:text-white' : ''}`}
                    />
                  </div>
                </div>

                {/* File Upload Section */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t.attachments}
                  </label>
                  
                  {/* Drop Zone */}
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                      dragActive 
                        ? 'border-primary bg-primary/5' 
                        : isDarkMode 
                          ? 'border-gray-600 hover:border-gray-500' 
                          : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      multiple
                      onChange={(e) => handleFileSelect(e.target.files)}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                          <Plus className="w-6 h-6 text-primary" />
                        </div>
                        <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t.addFiles}</p>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>{t.dropFiles}</p>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} mt-2`}>{t.supportedFormats}</p>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{t.maxFileSize}</p>
                      </div>
                    </label>
                  </div>

                  {/* Upload Error */}
                  {uploadError && (
                    <div className="mt-2 p-2 bg-red-100 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600">{uploadError}</p>
                    </div>
                  )}

                  {/* File List */}
                  {attachments.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {attachments.map((file) => (
                        <div
                          key={file.id}
                          className={`flex items-center justify-between p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{getFileIcon(file.type)}</span>
                            <div>
                              <p className={`font-medium text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{file.name}</p>
                              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{formatFileSize(file.size)}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(file.id)}
                            className={`p-1 rounded ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'} transition-colors`}
                          >
                            <X className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className={`flex justify-end gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setEditingTask(null);
                      setFormData({
                        title: "",
                        description: "",
                        status: "pending",
                        priority: "medium",
                        assignedTo: "",
                        startDate: "",
                        endDate: "",
                      });
                      setAttachments([]);
                      setUploadError(null);
                    }}
                    className={`px-6 py-3 border border-gray-200 rounded-lg font-medium hover:bg-gray-50 transition-colors ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'text-gray-700'}`}
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
                  >
                    {editingTask ? t.updateTask : t.createTask}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tasks List */}
        <div className={`rounded-lg shadow-sm border border-primary/20 p-6 mb-8 ${isDarkMode ? 'dark:bg-gray-800' : 'bg-white'}`}>
          <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {t.tasks} ({filteredTasks.length})
            </h2>
          </div>

          <div className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
            {filteredTasks.length === 0 ? (
              <div className="p-12 text-center">
                <div className={`w-16 h-16 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <CheckCircle className={`w-8 h-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                </div>
                <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>{t.noTasksFound}</h3>
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>{t.getStarted}</p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                  <Plus className="w-5 h-5 inline mr-2" />
                  {t.createTask}
                </button>
              </div>
            ) : (
              filteredTasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-6 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}
                >
                  <div className={`flex items-start justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className="flex-1">
                      <div className={`flex items-center gap-3 mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{task.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                          {task.status.replace("_", " ")}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>

                      <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>{task.description}</p>

                      {/* Attachments Display */}
                      {task.attachments && task.attachments.length > 0 && (
                        <div className="mb-4">
                          <div className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-2`}>
                            <span>📎</span>
                            <span>{task.attachments.length} {locale === 'ar' ? 'ملفات مرفقة' : 'attachments'}</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {task.attachments.slice(0, 3).map((file, index) => (
                              <div
                                key={index}
                                className={`flex items-center gap-2 px-2 py-1 rounded-lg text-xs ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}
                              >
                                <span>{getFileIcon(file.type)}</span>
                                <span className="truncate max-w-24">{file.name}</span>
                              </div>
                            ))}
                            {task.attachments.length > 3 && (
                              <div className={`flex items-center px-2 py-1 rounded-lg text-xs ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                                <span>+{task.attachments.length - 3} more</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <div className={`flex items-center gap-6 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <UserIcon className="w-4 h-4" />
                          <span>{task.assignedToName || task.assignedTo}</span>
                        </div>
                        <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <Calendar className="w-4 h-4" />
                          <span>{t.due} {new Date(task.endDate).toLocaleDateString()}</span>
                        </div>
                        <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <Clock className="w-4 h-4" />
                          <span>{t.created} {new Date(task.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className={`flex items-center gap-2 ${isRTL ? 'mr-6' : 'ml-6'}`}>
                      <button
                        onClick={() => handleEdit(task)}
                        className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
                      >
                        <Edit2 className={`w-4 h-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`} />
                      </button>
                      <button
                        onClick={() => handleDelete(task.id)}
                        className={`p-2 rounded-lg ${isDarkMode ? 'bg-red-900/50 hover:bg-red-900' : 'bg-red-100 hover:bg-red-200'} transition-colors`}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
            )}
          </AnimatePresence>

          {/* Search and Filters */}
          <div className="bg-linear-to-br from-gray-50 to-gray-100 p-6 rounded-xl mb-8 shadow-lg border border-gray-200">
            <div
              className={`flex flex-col md:flex-row gap-4 ${isRTL ? "md:flex-row-reverse" : ""}`}
            >
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search
                    className={`absolute ${isRTL ? "right-3" : "left-3"} top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400`}
                  />
                  <input
                    type="text"
                    placeholder={t.searchTasks}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full ${isRTL ? "pr-10 pl-4" : "pl-10 pr-4"} py-3 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary transition-colors`}
                  />
                </div>
              </div>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary transition-colors"
              >
                <option value="all">{t.allStatus}</option>
                <option value="pending">{t.pendingStatus}</option>
                <option value="in_progress">{t.inProgressStatus}</option>
                <option value="completed">{t.completedStatus}</option>
                <option value="cancelled">{t.cancelledStatus}</option>
              </select>

              {/* Priority Filter */}
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary transition-colors"
              >
                <option value="all">{t.allPriority}</option>
                <option value="low">{t.lowPriority}</option>
                <option value="medium">{t.mediumPriority}</option>
                <option value="high">{t.highPriority}</option>
                <option value="urgent">{t.urgentPriority}</option>
              </select>

              {/* Create Task Button */}
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-lg"
              >
                <Plus className="w-5 h-5" />
                {t.newTask}
              </button>
            </div>
=======
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <AnimatePresence>
          {showStats && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8"
            >
              <div className={`rounded-lg p-4 shadow-sm border border-primary/20 ${isDarkMode ? 'dark:bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{t.totalTasks}</p>
                    <p className="text-2xl font-bold text-primary">{stats.total}</p>
                  </div>
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-primary" />
                  </div>
                </div>
              </div>

              <div className={`rounded-lg p-4 shadow-sm border border-emerald-200 ${isDarkMode ? 'dark:bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{t.completed}</p>
                    <p className="text-2xl font-bold text-emerald-600">{stats.completed}</p>
                  </div>
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  </div>
                </div>
              </div>

              <div className={`rounded-lg p-4 shadow-sm border border-blue-200 ${isDarkMode ? 'dark:bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{t.inProgress}</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
                  </div>
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className={`rounded-lg p-4 shadow-sm border border-amber-200 ${isDarkMode ? 'dark:bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{t.pending}</p>
                    <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
                  </div>
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                  </div>
                </div>
              </div>

              <div className={`rounded-lg p-4 shadow-sm border border-red-200 ${isDarkMode ? 'dark:bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{t.urgent}</p>
                    <p className="text-2xl font-bold text-red-600">{stats.urgent}</p>
                  </div>
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search and Filters */}
        <div className={`rounded-lg shadow-sm border border-primary/20 p-6 mb-8 ${isDarkMode ? 'dark:bg-gray-800' : 'bg-white'}`}>
          <div className={`flex flex-col md:flex-row gap-4 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400`} />
                <input
                  type="text"
                  placeholder={t.searchTasks}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${isDarkMode ? 'dark:bg-gray-700 dark:border-gray-600 dark:text-white' : ''}`}
                />
              </div>
            </div>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className={`px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${isDarkMode ? 'dark:bg-gray-700 dark:border-gray-600 dark:text-white' : ''}`}
            >
              <option value="all">{t.allStatus}</option>
              <option value="pending">{t.pendingStatus}</option>
              <option value="in_progress">{t.inProgressStatus}</option>
              <option value="completed">{t.completedStatus}</option>
              <option value="cancelled">{t.cancelledStatus}</option>
            </select>

            {/* Priority Filter */}
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className={`px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${isDarkMode ? 'dark:bg-gray-700 dark:border-gray-600 dark:text-white' : ''}`}
            >
              <option value="all">{t.allPriority}</option>
              <option value="low">{t.lowPriority}</option>
              <option value="medium">{t.mediumPriority}</option>
              <option value="high">{t.highPriority}</option>
              <option value="urgent">{t.urgentPriority}</option>
            </select>

            {/* Create Task Button */}
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              {t.newTask}
            </button>
>>>>>>> Stashed changes
          </div>
        </div>

<<<<<<< Updated upstream
          {/* Create/Edit Task Form */}
          <AnimatePresence>
            {(showCreateForm || editingTask) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-linear-to-br from-primary/5 to-primary/10 p-8 rounded-xl mb-8 shadow-lg "
              >
                <div className="flex items-center justify-between mb-6">
                  <h2
                    className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}
                  >
                    {editingTask ? t.editTask : t.createNewTask}
                  </h2>
                  <button
=======
        {/* Create/Edit Task Form */}
        <AnimatePresence>
          {(showCreateForm || editingTask) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`rounded-lg shadow-sm border border-primary/20 p-6 mb-8 ${isDarkMode ? 'dark:bg-gray-800' : 'bg-white'}`}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {editingTask ? t.editTask : t.createNewTask}
                </h2>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingTask(null);
                    setFormData({
                      title: "",
                      description: "",
                      status: "pending",
                      priority: "medium",
                      assignedTo: "",
                      startDate: "",
                      endDate: "",
                    });
                    setAttachments([]);
                    setUploadError(null);
                  }}
                  className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
                >
                  <X className={`w-5 h-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${isRTL ? 'md:grid-cols-2' : ''}`}>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t.taskTitle}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${isDarkMode ? 'dark:bg-gray-700 dark:border-gray-600 dark:text-white' : ''}`}
                      placeholder={t.enterTaskTitle}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t.assignedTo}
                    </label>
                    <select
                      required
                      value={formData.assignedTo}
                      onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                      className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${isDarkMode ? 'dark:bg-gray-700 dark:border-gray-600 dark:text-white' : ''}`}
                    >
                      <option value="">{t.selectUser}</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.email}>
                          {user.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t.description}
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${isDarkMode ? 'dark:bg-gray-700 dark:border-gray-600 dark:text-white' : ''}`}
                    placeholder={t.enterTaskDescription}
                  />
                </div>

                <div className={`grid grid-cols-1 md:grid-cols-4 gap-4 ${isRTL ? 'md:grid-cols-4' : ''}`}>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t.status}
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as Task["status"] })}
                      className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${isDarkMode ? 'dark:bg-gray-700 dark:border-gray-600 dark:text-white' : ''}`}
                    >
                      <option value="pending">{t.pendingStatus}</option>
                      <option value="in_progress">{t.inProgressStatus}</option>
                      <option value="completed">{t.completedStatus}</option>
                      <option value="cancelled">{t.cancelledStatus}</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t.priority}
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as Task["priority"] })}
                      className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${isDarkMode ? 'dark:bg-gray-700 dark:border-gray-600 dark:text-white' : ''}`}
                    >
                      <option value="low">{t.lowPriority}</option>
                      <option value="medium">{t.mediumPriority}</option>
                      <option value="high">{t.highPriority}</option>
                      <option value="urgent">{t.urgentPriority}</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t.startDate}
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${isDarkMode ? 'dark:bg-gray-700 dark:border-gray-600 dark:text-white' : ''}`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t.endDate}
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${isDarkMode ? 'dark:bg-gray-700 dark:border-gray-600 dark:text-white' : ''}`}
                    />
                  </div>
                </div>

                {/* File Upload Section */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t.attachments}
                  </label>
                  
                  {/* Drop Zone */}
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                      dragActive 
                        ? 'border-primary bg-primary/5' 
                        : isDarkMode 
                          ? 'border-gray-600 hover:border-gray-500' 
                          : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      multiple
                      onChange={(e) => handleFileSelect(e.target.files)}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                          <Plus className="w-6 h-6 text-primary" />
                        </div>
                        <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t.addFiles}</p>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>{t.dropFiles}</p>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} mt-2`}>{t.supportedFormats}</p>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{t.maxFileSize}</p>
                      </div>
                    </label>
                  </div>

                  {/* Upload Error */}
                  {uploadError && (
                    <div className="mt-2 p-2 bg-red-100 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600">{uploadError}</p>
                    </div>
                  )}

                  {/* File List */}
                  {attachments.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {attachments.map((file) => (
                        <div
                          key={file.id}
                          className={`flex items-center justify-between p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{getFileIcon(file.type)}</span>
                            <div>
                              <p className={`font-medium text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{file.name}</p>
                              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{formatFileSize(file.size)}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(file.id)}
                            className={`p-1 rounded ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'} transition-colors`}
                          >
                            <X className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className={`flex justify-end gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <button
                    type="button"
>>>>>>> Stashed changes
                    onClick={() => {
                      setShowCreateForm(false);
                      setEditingTask(null);
                      setFormData({
                        title: "",
                        description: "",
                        status: "pending",
                        priority: "medium",
                        assignedTo: "",
<<<<<<< Updated upstream
                        relatedTo: [],
=======
>>>>>>> Stashed changes
                        startDate: "",
                        endDate: "",
                      });
                      setAttachments([]);
                      setUploadError(null);
                    }}
<<<<<<< Updated upstream
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                  >
                    <X className={`w-5 h-5 text-white`} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div
                    className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${isRTL ? "md:grid-cols-2" : ""}`}
                  >
                    <div className="bg-white p-4 rounded-xl border-l-4 border-primary shadow-md">
                      <label
                        className={`block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2`}
                      >
                        {t.taskTitle}
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary transition-colors"
                        placeholder={t.enterTaskTitle}
                      />
                    </div>

                    <div className="bg-white p-4 border-l-4 border-primary rounded-xl shadow-md">
                      <label
                        className={`block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2`}
                      >
                        {t.assignedTo}
                      </label>
                      <select
                        required
                        value={formData.assignedTo}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            assignedTo: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary transition-colors"
                      >
                        <option value="">{t.selectUser}</option>
                        {users.map((user) => (
                          <option key={user.id} value={user.email}>
                            {user.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="bg-white p-4 border-l-4 border-primary rounded-xl shadow-md">
                    <label
                      className={`block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2`}
                    >
                      {t.description}
                    </label>
                    <textarea
                      required
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      rows={3}
                      className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary transition-colors"
                      placeholder={t.enterTaskDescription}
                    />
                  </div>

                  <div
                    className={`grid grid-cols-1 md:grid-cols-4 gap-6 ${isRTL ? "md:grid-cols-4" : ""}`}
                  >
                    <div className="bg-white p-4 border-l-4 border-primary rounded-xl shadow-md">
                      <label
                        className={`block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2`}
                      >
                        {t.status}
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            status: e.target.value as Task["status"],
                          })
                        }
                        className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary transition-colors"
                      >
                        <option value="pending">{t.pendingStatus}</option>
                        <option value="in_progress">
                          {t.inProgressStatus}
                        </option>
                        <option value="completed">{t.completedStatus}</option>
                        <option value="cancelled">{t.cancelledStatus}</option>
                      </select>
                    </div>

                    <div className="bg-white border-l-4 border-primary p-4 rounded-xl shadow-md">
                      <label
                        className={`block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2`}
                      >
                        {t.priority}
                      </label>
                      <select
                        value={formData.priority}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            priority: e.target.value as Task["priority"],
                          })
                        }
                        className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary transition-colors"
                      >
                        <option value="low">{t.lowPriority}</option>
                        <option value="medium">{t.mediumPriority}</option>
                        <option value="high">{t.highPriority}</option>
                        <option value="urgent">{t.urgentPriority}</option>
                      </select>
                    </div>

                    <div className="bg-white border-l-4 border-primary p-4 rounded-xl shadow-md">
                      <label
                        className={`block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2`}
                      >
                        {t.startDate}
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.startDate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            startDate: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>

                    <div className="bg-white border-l-4 border-primary p-4 rounded-xl shadow-md">
                      <label
                        className={`block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2`}
                      >
                        {t.endDate}
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.endDate}
                        onChange={(e) =>
                          setFormData({ ...formData, endDate: e.target.value })
                        }
                        className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                  </div>

                  <div className="bg-white border-l-4 border-primary p-4 rounded-xl shadow-md">
                    <label
                      className={`block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2`}
                    >
                      {t.relatedTo}
                    </label>
                    <div className="space-y-2">
                      {[
                        {
                          value: "hope_bridge",
                          label: locale === "ar" ? "جسر الأمل" : "Hope Bridge",
                        },
                        {
                          value: "ummah",
                          label: locale === "ar" ? "الأمة" : "Ummah",
                        },
                        {
                          value: "one_nation",
                          label: locale === "ar" ? "أمة واحدة" : "One Nation",
                        },
                        {
                          value: "dudley",
                          label: locale === "ar" ? "دودلي" : "Dudley",
                        },
                      ].map((option) => (
                        <label
                          key={option.value}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={formData.relatedTo.includes(option.value)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  relatedTo: [
                                    ...formData.relatedTo,
                                    option.value,
                                  ],
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  relatedTo: formData.relatedTo.filter(
                                    (item) => item !== option.value
                                  ),
                                });
                              }
                            }}
                            className="w-4 h-4 text-primary border-2 border-gray-300 rounded focus:ring-primary"
                          />
                          <span
                            className={`text-sm font-medium ${isDarkMode ? "text-gray-700" : "text-gray-700"}`}
                          >
                            {option.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* File Upload Section */}
                  <div className="bg-white border-l-4 border-primary p-4 rounded-xl shadow-md">
                    <label
                      className={`block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2`}
                    >
                      {t.attachments}
                    </label>

                    {/* Drop Zone */}
                    <div
                      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                        dragActive
                          ? "border-primary bg-primary/5"
                          : isDarkMode
                            ? "border-gray-600 hover:border-gray-500"
                            : "border-gray-300 hover:border-gray-400"
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <input
                        type="file"
                        multiple
                        onChange={(e) => handleFileSelect(e.target.files)}
                        className="hidden"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                            <Plus className="w-6 h-6 text-primary" />
                          </div>
                          <p
                            className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}
                          >
                            {t.addFiles}
                          </p>
                          <p
                            className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"} mt-1`}
                          >
                            {t.dropFiles}
                          </p>
                          <p
                            className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-400"} mt-2`}
                          >
                            {t.supportedFormats}
                          </p>
                          <p
                            className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}
                          >
                            {t.maxFileSize}
                          </p>
                        </div>
                      </label>
                    </div>

                    {/* Upload Error */}
                    {uploadError && (
                      <div className="mt-2 p-2 bg-red-100 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600">{uploadError}</p>
                      </div>
                    )}

                    {/* File List */}
                    {attachments.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {attachments.map((file) => (
                          <div
                            key={file.id}
                            className={`flex items-center justify-between p-3 rounded-lg border ${isDarkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"}`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">
                                {getFileIcon(file.type)}
                              </span>
                              <div>
                                <p
                                  className={`font-medium text-sm ${isDarkMode ? "text-white" : "text-gray-900"}`}
                                >
                                  {file.name}
                                </p>
                                <p
                                  className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                                >
                                  {formatFileSize(file.size)}
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFile(file.id)}
                              className={`p-1 rounded ${isDarkMode ? "hover:bg-gray-600" : "hover:bg-gray-200"} transition-colors`}
                            >
                              <X
                                className={`w-4 h-4 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                              />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div
                    className={`flex justify-end gap-3 ${isRTL ? "flex-row-reverse" : ""}`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateForm(false);
                        setEditingTask(null);
                        setFormData({
                          title: "",
                          description: "",
                          status: "pending",
                          priority: "medium",
                          assignedTo: "",
                          relatedTo: [],
                          startDate: "",
                          endDate: "",
                        });
                        setAttachments([]);
                        setUploadError(null);
                      }}
                      className={`px-6 py-3 border border-gray-200 rounded-lg font-medium hover:bg-gray-50 transition-colors ${isDarkMode ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "text-gray-700"}`}
                    >
                      {t.cancel}
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
                    >
                      {editingTask ? t.updateTask : t.createTask}
                    </button>
                  </div>
                </form>
              </motion.div>
=======
                    className={`px-6 py-3 border border-gray-200 rounded-lg font-medium hover:bg-gray-50 transition-colors ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'text-gray-700'}`}
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
                  >
                    {editingTask ? t.updateTask : t.createTask}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tasks List */}
        <div className={`rounded-lg shadow-sm border border-primary/20 p-6 mb-8 ${isDarkMode ? 'dark:bg-gray-800' : 'bg-white'}`}>
          <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {t.tasks} ({filteredTasks.length})
            </h2>
          </div>

          <div className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
            {filteredTasks.length === 0 ? (
              <div className="p-12 text-center">
                <div className={`w-16 h-16 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <CheckCircle className={`w-8 h-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                </div>
                <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>{t.noTasksFound}</h3>
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>{t.getStarted}</p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                  <Plus className="w-5 h-5 inline mr-2" />
                  {t.createTask}
                </button>
              </div>
            ) : (
              filteredTasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-6 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}
                >
                  <div className={`flex items-start justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className="flex-1">
                      <div className={`flex items-center gap-3 mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{task.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                          {task.status.replace("_", " ")}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>

                      <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>{task.description}</p>

                      {/* Attachments Display */}
                      {task.attachments && task.attachments.length > 0 && (
                        <div className="mb-4">
                          <div className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-2`}>
                            <span>📎</span>
                            <span>{task.attachments.length} {locale === 'ar' ? 'ملفات مرفقة' : 'attachments'}</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {task.attachments.slice(0, 3).map((file, index) => (
                              <div
                                key={index}
                                className={`flex items-center gap-2 px-2 py-1 rounded-lg text-xs ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}
                              >
                                <span>{getFileIcon(file.type)}</span>
                                <span className="truncate max-w-24">{file.name}</span>
                              </div>
                            ))}
                            {task.attachments.length > 3 && (
                              <div className={`flex items-center px-2 py-1 rounded-lg text-xs ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                                <span>+{task.attachments.length - 3} more</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <div className={`flex items-center gap-6 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <UserIcon className="w-4 h-4" />
                          <span>{task.assignedToName || task.assignedTo}</span>
                        </div>
                        <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <Calendar className="w-4 h-4" />
                          <span>{t.due} {new Date(task.endDate).toLocaleDateString()}</span>
                        </div>
                        <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <Clock className="w-4 h-4" />
                          <span>{t.created} {new Date(task.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className={`flex items-center gap-2 ${isRTL ? 'mr-6' : 'ml-6'}`}>
                      <button
                        onClick={() => handleEdit(task)}
                        className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
                      >
                        <Edit2 className={`w-4 h-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`} />
                      </button>
                      <button
                        onClick={() => handleDelete(task.id)}
                        className={`p-2 rounded-lg ${isDarkMode ? 'bg-red-900/50 hover:bg-red-900' : 'bg-red-100 hover:bg-red-200'} transition-colors`}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
>>>>>>> Stashed changes
            )}
          </AnimatePresence>

          {/* Tasks List */}
          <div className="bg-linear-to-br from-gray-50 to-gray-100 rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-linear-to-r from-primary to-primary/80 p-6">
              <h2 className="text-xl font-bold text-white">
                {t.tasks} ({filteredTasks.length})
              </h2>
            </div>

            <div className="divide-y divide-gray-200">
              {filteredTasks.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {t.noTasksFound}
                  </h3>
                  <p className="text-gray-600 mb-6">{t.getStarted}</p>
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="px-8 py-4 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-lg"
                  >
                    <Plus className="w-6 h-6 inline mr-3" />
                    {t.createTask}
                  </button>
                </div>
              ) : (
                filteredTasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-6 bg-white hover:bg-gray-50 transition-colors border-b border-gray-100"
                  >
                    <div
                      className={`flex items-start justify-between ${isRTL ? "flex-row-reverse" : ""}`}
                    >
                      <div className="flex-1">
                        <div
                          className={`flex items-center gap-3 mb-4 ${isRTL ? "flex-row-reverse" : ""}`}
                        >
                          <h3 className="text-xl font-bold text-gray-900">
                            {task.title}
                          </h3>
                          <span
                            className={`px-4 py-2 rounded-full text-sm font-bold border-2 ${getStatusColor(task.status)}`}
                          >
                            {task.status.replace("_", " ")}
                          </span>
                          <span
                            className={`px-4 py-2 rounded-full text-sm font-bold border-2 ${getPriorityColor(task.priority)}`}
                          >
                            {task.priority}
                          </span>
                        </div>

                        <p className="text-gray-600 mb-4 text-lg leading-relaxed">
                          {task.description}
                        </p>

                        {/* Related To Display */}
                        {task.relatedTo && task.relatedTo.length > 0 && (
                          <div className="mb-4">
                            <div className="flex items-center gap-2 text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">
                              <span>🏷️</span>
                              <span>
                                {locale === "ar" ? "متعلق بـ" : "Related To"}:
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {task.relatedTo.map((item, index) => {
                                const labels: {
                                  [key: string]: { en: string; ar: string };
                                } = {
                                  hope_bridge: {
                                    en: "Hope Bridge",
                                    ar: "جسر الأمل",
                                  },
                                  ummah: { en: "Ummah", ar: "الأمة" },
                                  one_nation: {
                                    en: "One Nation",
                                    ar: "أمة واحدة",
                                  },
                                  dudley: { en: "Dudley", ar: "دودلي" },
                                };
                                const label = labels[item]?.[locale] || item;
                                return (
                                  <span
                                    key={index}
                                    className="px-3 py-1 rounded-lg text-sm font-bold bg-primary/10 text-primary border-2 border-primary/20"
                                  >
                                    {label}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Attachments Display */}
                        {task.attachments && task.attachments.length > 0 && (
                          <div className="mb-4">
                            <div className="flex items-center gap-2 text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">
                              <span>📎</span>
                              <span>
                                {task.attachments.length}{" "}
                                {locale === "ar"
                                  ? "ملفات مرفقة"
                                  : "attachments"}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {task.attachments
                                .slice(0, 3)
                                .map((file, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-gray-100 text-gray-600 border border-gray-200"
                                  >
                                    <span>{getFileIcon(file.type)}</span>
                                    <span className="truncate max-w-32">
                                      {file.name}
                                    </span>
                                  </div>
                                ))}
                              {task.attachments.length > 3 && (
                                <div className="flex items-center px-3 py-2 rounded-lg text-sm bg-gray-100 text-gray-600 border border-gray-200">
                                  <span>
                                    +{task.attachments.length - 3} more
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        <div
                          className={`flex items-center gap-8 text-sm font-bold text-gray-500 uppercase tracking-wider ${isRTL ? "flex-row-reverse" : ""}`}
                        >
                          <div
                            className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}
                          >
                            <UserIcon className="w-5 h-5" />
                            <span>
                              {task.assignedToName || task.assignedTo}
                            </span>
                          </div>
                          <div
                            className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}
                          >
                            <Calendar className="w-5 h-5" />
                            <span>
                              {t.due}{" "}
                              {new Date(task.endDate).toLocaleDateString()}
                            </span>
                          </div>
                          <div
                            className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}
                          >
                            <Clock className="w-5 h-5" />
                            <span>
                              {t.created}{" "}
                              {new Date(task.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div
                        className={`flex items-center gap-3 ${isRTL ? "mr-6" : "ml-6"}`}
                      >
                        <button
                          onClick={() => handleEdit(task)}
                          className="p-3 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-xl transition-colors shadow-md"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(task.id)}
                          className="p-3 bg-red-100 hover:bg-red-200 text-red-600 rounded-xl transition-colors shadow-md"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskManager;
