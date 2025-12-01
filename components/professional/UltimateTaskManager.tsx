'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AwesomeDashboardForm from '@/components/ui/AwesomeDashboardForm';
import '../styles/awesome-dashboard.css';
import { 
  Calendar, 
  Clock, 
  Users, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  BarChart3,
  Filter,
  Search,
  Plus,
  Edit3,
  Trash2,
  Archive,
  Star,
  Flag,
  MessageSquare,
  Paperclip,
  User,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Download,
  Upload,
  RefreshCw,
  Settings,
  Bell,
  Zap,
  Target,
  Award,
  Activity,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Share2,
  Link2,
  Copy,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Heart,
  Shield,
  Crown,
  Rocket,
  Sparkles,
  Flame,
  Gem,
  Diamond,
  Trophy,
  Medal,
  Ribbon,
  X
} from 'lucide-react';
import '../styles/ultimate-progress-bars.css';
import PrioritySelector from '../ui/PrioritySelector';
import TaskStatusSelector from '../ui/TaskStatusSelector';

interface UltimateTask {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'active' | 'in_progress' | 'review' | 'completed' | 'cancelled' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'urgent' | 'critical';
  category: string;
  tags: string[];
  assignedTo: {
    id: string;
    name: string;
    email: string;
    avatar: string;
    role: string;
    department: string;
    skills: string[];
    performance: number;
    availability: 'available' | 'busy' | 'offline';
  };
  createdBy: {
    id: string;
    name: string;
    email: string;
    avatar: string;
  };
  dueDate: Date;
  startDate?: Date;
  estimatedHours?: number;
  actualHours?: number;
  progress: number;
  budget?: number;
  actualCost?: number;
  dependencies: string[];
  subtasks: {
    id: string;
    title: string;
    completed: boolean;
    assignedTo?: string;
    dueDate?: Date;
  }[];
  attachments: {
    id: string;
    name: string;
    type: string;
    size: number;
    url: string;
    uploadedBy: string;
    uploadedAt: Date;
  }[];
  comments: {
    id: string;
    content: string;
    author: string;
    authorAvatar: string;
    createdAt: Date;
    mentions: string[];
    attachments?: string[];
  }[];
  watchers: string[];
  labels: string[];
  customFields: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  location?: string;
  client?: {
    name: string;
    email: string;
    phone: string;
    company: string;
  };
  project: {
    id: string;
    name: string;
    color: string;
    status: string;
  };
  milestones: string[];
  risks: {
    level: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    mitigation: string;
    owner: string;
  }[];
  quality: {
    score: number;
    criteria: string[];
    feedback: string[];
  };
  timeTracking: {
    entries: {
      id: string;
      user: string;
      startTime: Date;
      endTime?: Date;
      duration: number;
      description: string;
      billable: boolean;
    }[];
    total: number;
    billable: number;
  };
  approvals: {
    type: string;
    required: number;
    received: number;
    status: 'pending' | 'approved' | 'rejected';
    approvers: {
      id: string;
      name: string;
      status: 'pending' | 'approved' | 'rejected';
      comment?: string;
      timestamp?: Date;
    }[];
  }[];
}

interface UltimateUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  department: string;
  skills: string[];
  performance: number;
  availability: 'available' | 'busy' | 'offline';
  workload: number;
  efficiency: number;
  lastActive: Date;
  preferences: {
    notifications: boolean;
    theme: 'light' | 'dark' | 'auto';
    language: string;
    timezone: string;
  };
  stats: {
    tasksCompleted: number;
    tasksInProgress: number;
    overdueTasks: number;
    averageCompletionTime: number;
    satisfaction: number;
  };
}

const UltimateTaskManager: React.FC = () => {
  const [tasks, setTasks] = useState<UltimateTask[]>([]);
  const [users, setUsers] = useState<UltimateUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'kanban' | 'list' | 'calendar' | 'gantt' | 'timeline'>('kanban');
  const [filters, setFilters] = useState({
    status: [] as string[],
    priority: [] as string[],
    category: [] as string[],
    assignedTo: [] as string[],
    dateRange: { start: null as Date | null, end: null as Date | null },
    tags: [] as string[]
  });
  const [sortBy, setSortBy] = useState<'priority' | 'dueDate' | 'progress' | 'created' | 'updated'>('priority');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeTask, setActiveTask] = useState<UltimateTask | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showTeamView, setShowTeamView] = useState(false);
  const [showTimeTracking, setShowTimeTracking] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Mock data generation
  useEffect(() => {
    const generateMockData = () => {
      const mockTasks: UltimateTask[] = [
        {
          id: '1',
          title: 'Launch Hope Bridge Platform V2.0',
          description: 'Complete development and deployment of the enhanced task management platform with advanced AI features and real-time collaboration.',
          status: 'in_progress',
          priority: 'critical',
          category: 'Development',
          tags: ['urgent', 'platform', 'ai', 'collaboration'],
          assignedTo: {
            id: 'user1',
            name: 'Sarah Chen',
            email: 'sarah@hopebridge.org',
            avatar: '/avatars/sarah.jpg',
            role: 'Lead Developer',
            department: 'Engineering',
            skills: ['React', 'Node.js', 'AI/ML', 'System Architecture'],
            performance: 95,
            availability: 'available'
          },
          createdBy: {
            id: 'admin1',
            name: 'Michael Johnson',
            email: 'michael@hopebridge.org',
            avatar: '/avatars/michael.jpg'
          },
          dueDate: new Date('2024-12-15'),
          startDate: new Date('2024-11-01'),
          estimatedHours: 200,
          actualHours: 145,
          progress: 72,
          budget: 50000,
          actualCost: 42000,
          dependencies: ['2', '3'],
          subtasks: [
            { id: '1-1', title: 'Backend API Development', completed: true, assignedTo: 'user2' },
            { id: '1-2', title: 'Frontend Implementation', completed: true, assignedTo: 'user1' },
            { id: '1-3', title: 'AI Integration', completed: false, assignedTo: 'user3' },
            { id: '1-4', title: 'Testing & QA', completed: false, assignedTo: 'user4' }
          ],
          attachments: [
            { id: 'att1', name: 'Technical Specification.pdf', type: 'application/pdf', size: 2048000, url: '/files/spec.pdf', uploadedBy: 'admin1', uploadedAt: new Date() },
            { id: 'att2', name: 'UI Mockups.fig', type: 'application/figma', size: 1024000, url: '/files/mockups.fig', uploadedBy: 'user5', uploadedAt: new Date() }
          ],
          comments: [
            { id: 'c1', content: 'Great progress on the API! The new endpoints are performing excellently.', author: 'David Kim', authorAvatar: '/avatars/david.jpg', createdAt: new Date(), mentions: ['user1'] },
            { id: 'c2', content: 'AI integration is 80% complete. Need to finalize the training data.', author: 'Emily Rodriguez', authorAvatar: '/avatars/emily.jpg', createdAt: new Date(), mentions: ['user3'] }
          ],
          watchers: ['user1', 'user2', 'admin1'],
          labels: ['feature', 'high-impact', 'q4-2024'],
          customFields: { complexity: 'high', riskLevel: 'medium', businessValue: 'very-high' },
          createdAt: new Date('2024-10-15'),
          updatedAt: new Date(),
          location: 'Remote',
          client: {
            name: 'Hope Bridge Foundation',
            email: 'contact@hopebridge.org',
            phone: '+1-555-0123',
            company: 'Hope Bridge Foundation'
          },
          project: {
            id: 'proj1',
            name: 'Digital Transformation Initiative',
            color: '#3B82F6',
            status: 'active'
          },
          milestones: ['MVP Complete', 'Beta Testing', 'Public Launch'],
          risks: [
            { level: 'medium', description: 'AI model performance may not meet requirements', mitigation: 'Increase training data and model tuning', owner: 'user3' },
            { level: 'low', description: 'Timeline constraints for Q4 launch', mitigation: 'Prioritize core features', owner: 'user1' }
          ],
          quality: {
            score: 88,
            criteria: ['Code Quality', 'Performance', 'Security', 'User Experience'],
            feedback: ['Excellent code structure', 'Outstanding performance metrics', 'Security audit passed']
          },
          timeTracking: {
            entries: [
              { id: 'tt1', user: 'user1', startTime: new Date('2024-11-01T09:00:00'), endTime: new Date('2024-11-01T17:00:00'), duration: 8, description: 'Frontend development', billable: true },
              { id: 'tt2', user: 'user2', startTime: new Date('2024-11-01T09:00:00'), endTime: new Date('2024-11-01T16:30:00'), duration: 7.5, description: 'API development', billable: true }
            ],
            total: 145,
            billable: 132
          },
          approvals: [
            {
              type: 'Technical Review',
              required: 2,
              received: 1,
              status: 'pending',
              approvers: [
                { id: 'user6', name: 'Alex Thompson', status: 'approved', comment: 'Technical implementation looks solid', timestamp: new Date() },
                { id: 'user7', name: 'Lisa Wang', status: 'pending' }
              ]
            }
          ]
        },
        {
          id: '2',
          title: 'Implement Advanced Analytics Dashboard',
          description: 'Create comprehensive analytics dashboard with real-time data visualization, predictive analytics, and customizable reporting.',
          status: 'active',
          priority: 'high',
          category: 'Analytics',
          tags: ['dashboard', 'analytics', 'visualization', 'reporting'],
          assignedTo: {
            id: 'user8',
            name: 'Robert Taylor',
            email: 'robert@hopebridge.org',
            avatar: '/avatars/robert.jpg',
            role: 'Data Scientist',
            department: 'Analytics',
            skills: ['Python', 'D3.js', 'Machine Learning', 'Statistics'],
            performance: 92,
            availability: 'available'
          },
          createdBy: {
            id: 'admin1',
            name: 'Michael Johnson',
            email: 'michael@hopebridge.org',
            avatar: '/avatars/michael.jpg'
          },
          dueDate: new Date('2024-12-10'),
          startDate: new Date('2024-11-05'),
          estimatedHours: 120,
          actualHours: 85,
          progress: 70,
          budget: 30000,
          actualCost: 25000,
          dependencies: [],
          subtasks: [
            { id: '2-1', title: 'Data Pipeline Setup', completed: true, assignedTo: 'user8' },
            { id: '2-2', title: 'Dashboard UI Development', completed: true, assignedTo: 'user9' },
            { id: '2-3', title: 'Predictive Models', completed: false, assignedTo: 'user8' }
          ],
          attachments: [],
          comments: [],
          watchers: ['user8', 'admin1'],
          labels: ['analytics', 'data-driven', 'insights'],
          customFields: { dataSource: 'multiple', updateFrequency: 'real-time', visualizationType: 'interactive' },
          createdAt: new Date('2024-10-20'),
          updatedAt: new Date(),
          project: {
            id: 'proj1',
            name: 'Digital Transformation Initiative',
            color: '#3B82F6',
            status: 'active'
          },
          milestones: ['Data Integration', 'Dashboard Launch', 'Advanced Features'],
          risks: [],
          quality: {
            score: 90,
            criteria: ['Data Accuracy', 'Visualization Quality', 'Performance', 'User Experience'],
            feedback: ['Excellent data insights', 'Beautiful visualizations']
          },
          timeTracking: {
            entries: [],
            total: 85,
            billable: 80
          },
          approvals: []
        }
      ];

      const mockUsers: UltimateUser[] = [
        {
          id: 'user1',
          name: 'Sarah Chen',
          email: 'sarah@hopebridge.org',
          avatar: '/avatars/sarah.jpg',
          role: 'Lead Developer',
          department: 'Engineering',
          skills: ['React', 'Node.js', 'AI/ML', 'System Architecture'],
          performance: 95,
          availability: 'available',
          workload: 75,
          efficiency: 92,
          lastActive: new Date(),
          preferences: {
            notifications: true,
            theme: 'dark',
            language: 'en',
            timezone: 'UTC'
          },
          stats: {
            tasksCompleted: 45,
            tasksInProgress: 3,
            overdueTasks: 0,
            averageCompletionTime: 4.2,
            satisfaction: 4.8
          }
        },
        {
          id: 'user8',
          name: 'Robert Taylor',
          email: 'robert@hopebridge.org',
          avatar: '/avatars/robert.jpg',
          role: 'Data Scientist',
          department: 'Analytics',
          skills: ['Python', 'D3.js', 'Machine Learning', 'Statistics'],
          performance: 92,
          availability: 'available',
          workload: 80,
          efficiency: 88,
          lastActive: new Date(),
          preferences: {
            notifications: true,
            theme: 'light',
            language: 'en',
            timezone: 'UTC'
          },
          stats: {
            tasksCompleted: 38,
            tasksInProgress: 2,
            overdueTasks: 1,
            averageCompletionTime: 5.1,
            satisfaction: 4.6
          }
        }
      ];

      setTasks(mockTasks);
      setUsers(mockUsers);
      setLoading(false);
    };

    setTimeout(generateMockData, 1000);
  }, []);

  // Helper functions...

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800 border-gray-300',
      active: 'bg-blue-100 text-blue-800 border-blue-300',
      in_progress: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      review: 'bg-purple-100 text-purple-800 border-purple-300',
      completed: 'bg-green-100 text-green-800 border-green-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300',
      archived: 'bg-gray-100 text-gray-600 border-gray-300'
    };
    return colors[status as keyof typeof colors] || colors.draft;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-gray-100 text-gray-700 border-gray-300',
      medium: 'bg-blue-100 text-blue-700 border-blue-300',
      high: 'bg-orange-100 text-orange-700 border-orange-300',
      urgent: 'bg-red-100 text-red-700 border-red-300',
      critical: 'bg-red-600 text-white border-red-700'
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  // Premium professional text displays
  const getStatusDisplay = (status: string) => {
    const displays = {
      draft: '🔄 Draft',
      active: '🚀 Active', 
      in_progress: '⏳ In Progress',
      review: '👁️ Review',
      completed: '✅ Completed',
      cancelled: '❌ Cancelled',
      archived: '📦 Archived'
    };
    return displays[status as keyof typeof displays] || displays.draft;
  };

  const getPriorityDisplay = (priority: string) => {
    const displays = {
      low: '🟢 Low',
      medium: '🟡 Medium',
      high: '🟠 High', 
      urgent: '🔴 Urgent',
      critical: '🚨 Critical'
    };
    return displays[priority as keyof typeof displays] || displays.medium;
  };

  const getPriorityIcon = (priority: string) => {
    const icons = {
      low: <Flag className="w-3 h-3" />,
      medium: <Flag className="w-3 h-3" />,
      high: <AlertCircle className="w-3 h-3" />,
      urgent: <Zap className="w-3 h-3" />,
      critical: <Flame className="w-3 h-3" />
    };
    return icons[priority as keyof typeof icons] || icons.medium;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getPerformanceColor = (performance: number) => {
    if (performance >= 90) return 'text-green-600';
    if (performance >= 80) return 'text-blue-600';
    if (performance >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAvailabilityBadge = (availability: string) => {
    const badges = {
      available: 'bg-green-100 text-green-800',
      busy: 'bg-yellow-100 text-yellow-800',
      offline: 'bg-gray-100 text-gray-800'
    };
    return badges[availability as keyof typeof badges] || badges.offline;
  };

  const getProgressClass = (percentage: number): string => {
    // Round to nearest 5 for available classes
    const rounded = Math.round(percentage / 5) * 5;
    return `progress-${rounded}`;
  };

  // Computed filtered and sorted tasks
  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks.filter(task => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        if (!task.title.toLowerCase().includes(searchLower) &&
            !task.description.toLowerCase().includes(searchLower) &&
            !task.tags.some(tag => tag.toLowerCase().includes(searchLower))) {
          return false;
        }
      }
      
      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(task.status)) {
        return false;
      }
      
      // Priority filter
      if (filters.priority.length > 0 && !filters.priority.includes(task.priority)) {
        return false;
      }
      
      // Category filter
      if (filters.category.length > 0 && !filters.category.includes(task.category)) {
        return false;
      }
      
      // Assigned to filter
      if (filters.assignedTo.length > 0 && !filters.assignedTo.includes(task.assignedTo.id)) {
        return false;
      }
      
      // Date range filter
      if (filters.dateRange.start && task.dueDate < filters.dateRange.start) {
        return false;
      }
      if (filters.dateRange.end && task.dueDate > filters.dateRange.end) {
        return false;
      }
      
      // Tags filter
      if (filters.tags.length > 0 && !filters.tags.some(tag => task.tags.includes(tag))) {
        return false;
      }
      
      return true;
    });
    
    // Sort tasks
    return filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { critical: 5, urgent: 4, high: 3, medium: 2, low: 1 };
          aValue = priorityOrder[a.priority as keyof typeof priorityOrder];
          bValue = priorityOrder[b.priority as keyof typeof priorityOrder];
          break;
        case 'dueDate':
          aValue = a.dueDate ? a.dueDate.getTime() : 0;
          bValue = b.dueDate ? b.dueDate.getTime() : 0;
          break;
        case 'progress':
          aValue = a.progress;
          bValue = b.progress;
          break;
        case 'created':
          aValue = a.createdAt.getTime();
          bValue = b.createdAt.getTime();
          break;
        case 'updated':
          aValue = a.updatedAt.getTime();
          bValue = b.updatedAt.getTime();
          break;
        default:
          return 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });
  }, [tasks, searchTerm, filters, sortBy, sortOrder]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full"
        />
        <div className="ml-4 text-xl font-semibold text-gray-700">Loading Ultimate Task Manager...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Rocket className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Ultimate Task Manager
              </h1>
              <div className="ml-4 px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-semibold rounded-full">
                PRO
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
                title="Toggle notifications panel"
                aria-label="Toggle notifications panel"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              <button
                onClick={() => setShowAnalytics(!showAnalytics)}
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                title="Toggle analytics dashboard"
                aria-label="Toggle analytics dashboard"
              >
                <BarChart3 className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => setShowTeamView(!showTeamView)}
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                title="Toggle team view"
                aria-label="Toggle team view"
              >
                <Users className="w-5 h-5" />
              </button>
              
              <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                title="Open settings"
                aria-label="Open settings"
              >
                <Settings className="w-5 h-5" />
              </button>
              
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                  JD
                </div>
                <span className="text-sm font-medium text-gray-700">John Doe</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Awesome Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AwesomeDashboardForm
          onSearch={(query) => setSearchTerm(query)}
          onFilter={(filters) => {
            // Handle filter updates
            console.log('Filters updated:', filters);
          }}
          onCreateTask={() => {
            // Handle task creation
            console.log('Create new task');
          }}
        />
      </div>

      {/* View Mode and Sort Controls */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* View Mode */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">View:</span>
              <div className="flex bg-gray-100 rounded-lg p-1">
                {(['kanban', 'list', 'calendar', 'gantt', 'timeline'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
                      viewMode === mode
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                title="Sort tasks by"
                aria-label="Sort tasks by"
              >
                <option value="priority">Priority</option>
                <option value="dueDate">Due Date</option>
                <option value="progress">Progress</option>
                <option value="created">Created</option>
                <option value="updated">Updated</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-1 text-gray-600 hover:text-gray-900 transition-colors"
                title={`Sort order: ${sortOrder === 'asc' ? 'ascending' : 'descending'}`}
                aria-label={`Sort order: ${sortOrder === 'asc' ? 'ascending' : 'descending'}`}
              >
                {sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{filteredAndSortedTasks.length}</p>
                <p className="text-xs text-gray-500 mt-1">Across all projects</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">
                  {filteredAndSortedTasks.filter(t => t.status === 'in_progress').length}
                </p>
                <p className="text-xs text-gray-500 mt-1">Active work items</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {filteredAndSortedTasks.filter(t => t.status === 'completed').length}
                </p>
                <p className="text-xs text-gray-500 mt-1">Finished this month</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-3xl font-bold text-red-600 mt-2">
                  {filteredAndSortedTasks.filter(t => t.dueDate < new Date() && t.status !== 'completed').length}
                </p>
                <p className="text-xs text-gray-500 mt-1">Need attention</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Kanban Board View */}
        {viewMode === 'kanban' && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {['draft', 'active', 'in_progress', 'review', 'completed'].map((status) => (
              <div key={status} className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">{getStatusDisplay(status)}</h3>
                  <span className="bg-gray-200 text-gray-700 text-xs font-semibold px-2 py-1 rounded-full">
                    {filteredAndSortedTasks.filter(t => t.status === status).length}
                  </span>
                </div>
                
                <div className="space-y-3">
                  {filteredAndSortedTasks
                    .filter(task => task.status === status)
                    .map((task) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ y: -2 }}
                        className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => setActiveTask(task)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-gray-900 text-sm line-clamp-2">{task.title}</h4>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                            <div className="flex items-center space-x-1">
                              {getPriorityIcon(task.priority)}
                              <span>{getPriorityDisplay(task.priority)}</span>
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-xs text-gray-600 mb-3 line-clamp-2">{task.description}</p>
                        
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {task.assignedTo.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <span className="text-xs text-gray-600">{task.assignedTo.name}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <Calendar className="w-3 h-3" />
                            <span>{task.dueDate.toLocaleDateString()}</span>
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                            <span>Progress</span>
                            <span>{task.progress}%</span>
                          </div>
                          <div className="progress-bar-container">
                            <div 
                              className={`progress-bar-fill ${getProgressClass(task.progress)}`}
                            />
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {task.tags.slice(0, 2).map((tag) => (
                              <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                                {tag}
                              </span>
                            ))}
                            {task.tags.length > 2 && (
                              <span className="text-xs text-gray-500">+{task.tags.length - 2}</span>
                            )}
                          </div>
                          <div className="flex items-center space-x-1">
                            {task.comments.length > 0 && (
                              <div className="flex items-center space-x-1 text-gray-500">
                                <MessageSquare className="w-3 h-3" />
                                <span className="text-xs">{task.comments.length}</span>
                              </div>
                            )}
                            {task.attachments.length > 0 && (
                              <div className="flex items-center space-x-1 text-gray-500">
                                <Paperclip className="w-3 h-3" />
                                <span className="text-xs">{task.attachments.length}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        title="Select all tasks"
                        aria-label="Select all tasks"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAndSortedTasks.map((task) => (
                    <tr key={task.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setActiveTask(task)}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedTasks.includes(task.id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            if (e.target.checked) {
                              setSelectedTasks([...selectedTasks, task.id]);
                            } else {
                              setSelectedTasks(selectedTasks.filter(id => id !== task.id));
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          title={`Select task: ${task.title}`}
                          aria-label={`Select task: ${task.title}`}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{task.title}</div>
                          <div className="text-sm text-gray-500">{task.project.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(task.status)}`}>
                          {getStatusDisplay(task.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                          <div className="flex items-center space-x-1">
                            {getPriorityIcon(task.priority)}
                            <span>{getPriorityDisplay(task.priority)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold mr-3">
                            {task.assignedTo.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{task.assignedTo.name}</div>
                            <div className="text-sm text-gray-500">{task.assignedTo.role}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {task.dueDate.toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 progress-bar-container mr-2">
                            <div 
                              className={`progress-bar-fill-small ${getProgressClass(task.progress)}`}
                            />
                          </div>
                          <span className="text-sm text-gray-600">{task.progress}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {task.budget ? formatCurrency(task.budget) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Edit task
                            }}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit task"
                            aria-label="Edit task"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Delete task
                            }}
                            className="text-red-600 hover:text-red-900"
                            title="Delete task"
                            aria-label="Delete task"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Task Detail Modal */}
      <AnimatePresence>
        {activeTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setActiveTask(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{activeTask.title}</h2>
                    <p className="text-gray-600 mt-1">{activeTask.description}</p>
                  </div>
                  <button
                    onClick={() => setActiveTask(null)}
                    className="text-gray-400 hover:text-gray-600"
                    title="Close task details"
                    aria-label="Close task details"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Main Details */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Status and Priority */}
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <TaskStatusSelector
                          value={activeTask.status === 'draft' ? 'pending' : 
                                 activeTask.status === 'active' ? 'in_progress' :
                                 activeTask.status === 'review' ? 'in_progress' :
                                 activeTask.status === 'archived' ? 'cancelled' :
                                 activeTask.status === 'completed' ? 'completed' :
                                 activeTask.status === 'cancelled' ? 'cancelled' : 'pending'}
                          onChange={(newStatus) => {
                            // Handle status change
                            console.log('Status changed to:', newStatus);
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                        <PrioritySelector
                          value={activeTask.priority === 'critical' ? 'urgent' : activeTask.priority}
                          onChange={(newPriority) => {
                            // Handle priority change
                            console.log('Priority changed to:', newPriority);
                          }}
                        />
                      </div>
                    </div>

                    {/* Progress */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Progress</label>
                      <div className="flex items-center space-x-4">
                        <div className="flex-1">
                          <div className="progress-bar-container">
                            <div 
                              className={`progress-bar-fill-large ${getProgressClass(activeTask.progress)}`}
                            />
                          </div>
                        </div>
                        <span className="text-lg font-semibold text-gray-900">{activeTask.progress}%</span>
                      </div>
                    </div>

                    {/* Assigned User */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Assigned To</label>
                      <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                          {activeTask.assignedTo.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{activeTask.assignedTo.name}</div>
                          <div className="text-sm text-gray-600">{activeTask.assignedTo.role} • {activeTask.assignedTo.department}</div>
                          <div className="flex items-center space-x-4 mt-2">
                            <div className="flex items-center space-x-1">
                              <span className="text-sm text-gray-500">Performance:</span>
                              <span className={`text-sm font-semibold ${getPerformanceColor(activeTask.assignedTo.performance)}`}>
                                {activeTask.assignedTo.performance}%
                              </span>
                            </div>
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${getAvailabilityBadge(activeTask.assignedTo.availability)}`}>
                              {activeTask.assignedTo.availability}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <div className="flex items-center space-x-2 text-gray-900">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>{activeTask.startDate?.toLocaleDateString() || 'Not set'}</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                        <div className="flex items-center space-x-2 text-gray-900">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>{activeTask.dueDate.toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Budget */}
                    {activeTask.budget && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Budget</label>
                        <div className="flex items-center space-x-4">
                          <div className="text-lg font-semibold text-gray-900">{formatCurrency(activeTask.budget)}</div>
                          {activeTask.actualCost && (
                            <div className="text-sm text-gray-600">
                              Actual: {formatCurrency(activeTask.actualCost)}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Tags */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                      <div className="flex flex-wrap gap-2">
                        {activeTask.tags.map((tag) => (
                          <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Subtasks */}
                    {activeTask.subtasks.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Subtasks</label>
                        <div className="space-y-2">
                          {activeTask.subtasks.map((subtask) => (
                            <div key={subtask.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                              <input
                                type="checkbox"
                                checked={subtask.completed}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                title={`Mark subtask as ${subtask.completed ? 'incomplete' : 'complete'}: ${subtask.title}`}
                                aria-label={`Subtask: ${subtask.title}, status: ${subtask.completed ? 'completed' : 'incomplete'}`}
                              />
                              <span className={`flex-1 ${subtask.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                {subtask.title}
                              </span>
                              {subtask.dueDate && (
                                <span className="text-sm text-gray-500">
                                  {subtask.dueDate.toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-6">
                    {/* Time Tracking */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Time Tracking</label>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Total Time</span>
                          <span className="text-sm font-medium text-gray-900">
                            {formatDuration(activeTask.timeTracking.total * 60)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Billable</span>
                          <span className="text-sm font-medium text-gray-900">
                            {formatDuration(activeTask.timeTracking.billable * 60)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Estimated</span>
                          <span className="text-sm font-medium text-gray-900">
                            {activeTask.estimatedHours ? `${activeTask.estimatedHours}h` : 'Not set'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Activity */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Recent Activity</label>
                      <div className="space-y-3">
                        {activeTask.comments.slice(-3).map((comment) => (
                          <div key={comment.id} className="flex space-x-3">
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold">
                              {comment.author.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div className="flex-1">
                              <div className="text-sm text-gray-900">{comment.content}</div>
                              <div className="text-xs text-gray-500">
                                {comment.author} • {comment.createdAt.toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-2">
                      <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        title="Edit current task"
                        aria-label="Edit current task"
                      >
                        Edit Task
                      </button>
                      <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        title="Add comment to task"
                        aria-label="Add comment to task"
                      >
                        Add Comment
                      </button>
                      <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        title="Share task with team"
                        aria-label="Share task with team"
                      >
                        Share Task
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UltimateTaskManager;
