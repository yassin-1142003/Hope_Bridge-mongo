'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Clock, 
  Target, 
  Award, 
  Activity, 
  BarChart3, 
  PieChart, 
  LineChart, 
  Calendar, 
  Filter, 
  Download, 
  RefreshCw, 
  Settings, 
  Eye, 
  AlertCircle, 
  CheckCircle, 
  Zap, 
  Shield, 
  Rocket, 
  Star, 
  Trophy, 
  Medal, 
  Crown, 
  Diamond, 
  Flame, 
  Sparkles, 
  Heart, 
  Brain, 
  Cpu, 
  Globe, 
  Database, 
  Server, 
  Cloud, 
  Wifi, 
  Battery, 
  Gauge, 
  Timer, 
  Stopwatch, 
  Hourglass, 
  Sunrise, 
  Sunset, 
  Moon, 
  Sun, 
  Mountain, 
  Map, 
  Compass, 
  Navigation, 
  Flag, 
  Target as TargetIcon, 
  Bullseye, 
  Crosshair, 
  Focus, 
  Scope, 
  Radar, 
  Satellite, 
  Telescope, 
  Microscope, 
  Binoculars, 
  Camera, 
  Video, 
  Film, 
  Image, 
  Picture, 
  Photo, 
  Screenshot, 
  Monitor, 
  Desktop, 
  Laptop, 
  Tablet, 
  Smartphone, 
  Watch, 
  Headphones, 
  Speaker, 
  Volume, 
  Mic, 
  Record, 
  Play, 
  Pause, 
  Stop, 
  Skip, 
  Rewind, 
  FastForward, 
  Next, 
  Previous, 
  First, 
  Last, 
  Begin, 
  End, 
  Top, 
  Bottom, 
  Left, 
  Right, 
  Up, 
  Down, 
  Forward, 
  Backward, 
  Expand, 
  Collapse, 
  Maximize, 
  Minimize, 
  Fullscreen, 
  Exit, 
  Close, 
  Open, 
  Save, 
  Load, 
  Import, 
  Export, 
  Print, 
  Scan, 
  Copy, 
  Paste, 
  Cut, 
  Undo, 
  Redo, 
  Repeat, 
  Loop, 
  Shuffle, 
  Random, 
  Sort, 
  Order, 
  List, 
  Grid, 
  Table, 
  Card, 
  Tile, 
  Stack, 
  Layer, 
  Group, 
  Ungroup, 
  Merge, 
  Split, 
  Join, 
  Connect, 
  Disconnect, 
  Link, 
  Unlink, 
  Attach, 
  Detach, 
  Add, 
  Remove, 
  Delete, 
  Trash, 
  Recycle, 
  Archive, 
  Backup, 
  Restore, 
  Recover, 
  Reset, 
  Clear, 
  Clean, 
  Empty, 
  Fill, 
  Complete, 
  Incomplete, 
  Partial, 
  Full, 
  Half, 
  Quarter, 
  Third, 
  Fifth, 
  Sixth, 
  Seventh, 
  Eighth, 
  Ninth, 
  Tenth, 
  Hundred, 
  Thousand, 
  Million, 
  Billion, 
  Trillion, 
  Percent, 
  Degree, 
  Celsius, 
  Fahrenheit, 
  Kelvin, 
  Meter, 
  Kilometer, 
  Mile, 
  Foot, 
  Inch, 
  Yard, 
  Pound, 
  Kilogram, 
  Gram, 
  Liter, 
  Gallon, 
  Ounce, 
  Ton, 
  Carat, 
  Karat, 
  Carrot, 
  Apple, 
  Orange, 
  Banana, 
  Grape, 
  Strawberry, 
  Cherry, 
  Blueberry, 
  Raspberry, 
  Blackberry, 
  Cranberry, 
  Lemon, 
  Lime, 
  Peach, 
  Pear, 
  Plum, 
  Mango, 
  Pineapple, 
  Coconut, 
  Watermelon, 
  Cantaloupe, 
  Honeydew, 
  Kiwi, 
  Papaya, 
  Pomegranate, 
  Fig, 
  Date, 
  Raisin, 
  Prune, 
  Apricot, 
  Nectarine, 
  Avocado, 
  Tomato, 
  Potato, 
  Carrot, 
  Broccoli, 
  Cauliflower, 
  Cabbage, 
  Lettuce, 
  Spinach, 
  Kale, 
  Arugula, 
  Celery, 
  Cucumber, 
  Pepper, 
  Onion, 
  Garlic, 
  Ginger, 
  Turmeric, 
  Cinnamon, 
  Nutmeg, 
  Clove, 
  Pepper as PepperSpice, 
  Salt, 
  Sugar, 
  Honey, 
  Syrup, 
  Butter, 
  Cheese, 
  Milk, 
  Cream, 
  Yogurt, 
  IceCream, 
  Chocolate, 
  Vanilla, 
  Strawberry as StrawberryFood, 
  Blueberry as BlueberryFood, 
  Raspberry as RaspberryFood, 
  Lemon as LemonFood, 
  Orange as OrangeFood, 
  Lime as LimeFood, 
  Grape as GrapeFood, 
  Cherry as CherryFood, 
  Peach as PeachFood, 
  Pear as PearFood, 
  Plum as PlumFood, 
  Mango as MangoFood, 
  Pineapple as PineappleFood, 
  Coconut as CoconutFood, 
  Watermelon as WatermelonFood, 
  Cantaloupe as CantaloupeFood, 
  Honeydew as HoneydewFood, 
  Kiwi as KiwiFood, 
  Papaya as PapayaFood, 
  Pomegranate as PomegranateFood, 
  Fig as FigFood, 
  Date as DateFood, 
  Raisin as RaisinFood, 
  Prune as PruneFood, 
  Apricot as ApricotFood, 
  Nectarine as NectarineFood, 
  Avocado as AvocadoFood, 
  Tomato as TomatoFood, 
  Potato as PotatoFood, 
  Carrot as CarrotFood, 
  Broccoli as BroccoliFood, 
  Cauliflower as CauliflowerFood, 
  Cabbage as CabbageFood, 
  Lettuce as LettuceFood, 
  Spinach as SpinachFood, 
  Kale as KaleFood, 
  Arugula as ArugulaFood, 
  Celery as CeleryFood, 
  Cucumber as CucumberFood, 
  Pepper as PepperFood, 
  Onion as OnionFood, 
  Garlic as GarlicFood, 
  Ginger as GingerFood, 
  Turmeric as TurmericFood, 
  Cinnamon as CinnamonFood, 
  Nutmeg as NutmegFood, 
  Clove as CloveFood, 
  PepperSpice as PepperSpiceFood, 
  Salt as SaltFood, 
  Sugar as SugarFood, 
  Honey as HoneyFood, 
  Syrup as SyrupFood, 
  Butter as ButterFood, 
  Cheese as CheeseFood, 
  Milk as MilkFood, 
  Cream as CreamFood, 
  Yogurt as YogurtFood, 
  IceCream as IceCreamFood, 
  Chocolate as ChocolateFood, 
  Vanilla as VanillaFood,
  DollarSign
} from 'lucide-react';
import '../styles/analytics-progress-bars.css';

interface AnalyticsData {
  overview: {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    overdueTasks: number;
    totalUsers: number;
    activeUsers: number;
    totalProjects: number;
    activeProjects: number;
    totalHours: number;
    billableHours: number;
    totalBudget: number;
    actualCost: number;
    efficiency: number;
    satisfaction: number;
  };
  trends: {
    taskCompletion: Array<{ date: string; completed: number; created: number }>;
    userActivity: Array<{ date: string; activeUsers: number; totalUsers: number }>;
    budgetUsage: Array<{ date: string; budget: number; actual: number }>;
    performance: Array<{ date: string; efficiency: number; satisfaction: number }>;
  };
  distribution: {
    tasksByStatus: Array<{ status: string; count: number; percentage: number }>;
    tasksByPriority: Array<{ priority: string; count: number; percentage: number }>;
    tasksByCategory: Array<{ category: string; count: number; percentage: number }>;
    usersByDepartment: Array<{ department: string; count: number; percentage: number }>;
  };
  performance: {
    topPerformers: Array<{
      id: string;
      name: string;
      avatar: string;
      role: string;
      department: string;
      tasksCompleted: number;
      efficiency: number;
      satisfaction: number;
      quality: number;
      speed: number;
    }>;
    teamMetrics: Array<{
      teamId: string;
      teamName: string;
      members: number;
      tasksCompleted: number;
      efficiency: number;
      collaboration: number;
      innovation: number;
    }>;
    projectHealth: Array<{
      projectId: string;
      projectName: string;
      status: string;
      progress: number;
      budgetUsage: number;
      timeUsage: number;
      quality: number;
      risk: number;
    }>;
  };
  predictions: {
    nextMonthTasks: number;
    nextMonthUsers: number;
    nextMonthBudget: number;
    riskProbability: number;
    opportunityScore: number;
    recommendations: Array<{
      type: 'optimization' | 'risk' | 'opportunity';
      title: string;
      description: string;
      impact: 'high' | 'medium' | 'low';
      effort: 'high' | 'medium' | 'low';
      priority: number;
    }>;
  };
}

const UltimateAnalyticsDashboard: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'quarter' | 'year'>('month');
  const [selectedMetric, setSelectedMetric] = useState<'tasks' | 'users' | 'budget' | 'performance'>('tasks');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30);

  // Mock data generation
  useEffect(() => {
    const generateMockData = (): AnalyticsData => {
      const overview = {
        totalTasks: 1247,
        completedTasks: 892,
        inProgressTasks: 234,
        overdueTasks: 121,
        totalUsers: 48,
        activeUsers: 42,
        totalProjects: 23,
        activeProjects: 18,
        totalHours: 8765,
        billableHours: 7234,
        totalBudget: 1250000,
        actualCost: 987000,
        efficiency: 87.3,
        satisfaction: 4.6
      };

      const trends = {
        taskCompletion: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          completed: Math.floor(Math.random() * 50) + 20,
          created: Math.floor(Math.random() * 60) + 30
        })),
        userActivity: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          activeUsers: Math.floor(Math.random() * 15) + 30,
          totalUsers: 48
        })),
        budgetUsage: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          budget: Math.floor(Math.random() * 50000) + 30000,
          actual: Math.floor(Math.random() * 45000) + 25000
        })),
        performance: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          efficiency: Math.random() * 20 + 75,
          satisfaction: Math.random() * 1.5 + 3.5
        }))
      };

      const distribution = {
        tasksByStatus: [
          { status: 'completed', count: 892, percentage: 71.5 },
          { status: 'in_progress', count: 234, percentage: 18.8 },
          { status: 'draft', count: 87, percentage: 7.0 },
          { status: 'cancelled', count: 34, percentage: 2.7 }
        ],
        tasksByPriority: [
          { priority: 'high', count: 423, percentage: 33.9 },
          { priority: 'medium', count: 567, percentage: 45.5 },
          { priority: 'low', count: 257, percentage: 20.6 }
        ],
        tasksByCategory: [
          { category: 'Development', count: 456, percentage: 36.6 },
          { category: 'Design', count: 234, percentage: 18.8 },
          { category: 'Marketing', count: 189, percentage: 15.2 },
          { category: 'Analytics', count: 156, percentage: 12.5 },
          { category: 'Operations', count: 212, percentage: 17.0 }
        ],
        usersByDepartment: [
          { department: 'Engineering', count: 18, percentage: 37.5 },
          { department: 'Design', count: 8, percentage: 16.7 },
          { department: 'Marketing', count: 7, percentage: 14.6 },
          { department: 'Analytics', count: 6, percentage: 12.5 },
          { department: 'Operations', count: 9, percentage: 18.8 }
        ]
      };

      const performance = {
        topPerformers: [
          {
            id: '1',
            name: 'Sarah Chen',
            avatar: '/avatars/sarah.jpg',
            role: 'Lead Developer',
            department: 'Engineering',
            tasksCompleted: 67,
            efficiency: 95.2,
            satisfaction: 4.9,
            quality: 94.1,
            speed: 88.7
          },
          {
            id: '2',
            name: 'Robert Taylor',
            avatar: '/avatars/robert.jpg',
            role: 'Data Scientist',
            department: 'Analytics',
            tasksCompleted: 54,
            efficiency: 91.8,
            satisfaction: 4.7,
            quality: 92.3,
            speed: 85.2
          },
          {
            id: '3',
            name: 'Emily Rodriguez',
            avatar: '/avatars/emily.jpg',
            role: 'UX Designer',
            department: 'Design',
            tasksCompleted: 48,
            efficiency: 89.4,
            satisfaction: 4.8,
            quality: 96.7,
            speed: 82.1
          }
        ],
        teamMetrics: [
          {
            teamId: '1',
            teamName: 'Platform Development',
            members: 8,
            tasksCompleted: 234,
            efficiency: 87.3,
            collaboration: 92.1,
            innovation: 78.4
          },
          {
            teamId: '2',
            teamName: 'Data Analytics',
            members: 6,
            tasksCompleted: 189,
            efficiency: 91.2,
            collaboration: 85.7,
            innovation: 88.9
          },
          {
            teamId: '3',
            teamName: 'Design Systems',
            members: 5,
            tasksCompleted: 156,
            efficiency: 89.8,
            collaboration: 94.2,
            innovation: 91.3
          }
        ],
        projectHealth: [
          {
            projectId: '1',
            projectName: 'Platform V2.0',
            status: 'on_track',
            progress: 72.3,
            budgetUsage: 78.9,
            timeUsage: 65.4,
            quality: 88.7,
            risk: 12.3
          },
          {
            projectId: '2',
            projectName: 'AI Integration',
            status: 'at_risk',
            progress: 45.6,
            budgetUsage: 89.2,
            timeUsage: 78.1,
            quality: 76.4,
            risk: 34.7
          },
          {
            projectId: '3',
            projectName: 'Mobile App',
            status: 'on_track',
            progress: 81.2,
            budgetUsage: 67.8,
            timeUsage: 58.9,
            quality: 91.5,
            risk: 8.9
          }
        ]
      };

      const predictions = {
        nextMonthTasks: 1456,
        nextMonthUsers: 52,
        nextMonthBudget: 1450000,
        riskProbability: 23.4,
        opportunityScore: 78.9,
        recommendations: [
          {
            type: 'optimization' as const,
            title: 'Optimize Task Assignment',
            description: 'AI-powered task assignment could increase efficiency by 15%',
            impact: 'high' as const,
            effort: 'medium' as const,
            priority: 1
          },
          {
            type: 'risk' as const,
            title: 'Budget Overrun Risk',
            description: 'AI Integration project showing 89% budget usage with only 45% completion',
            impact: 'high' as const,
            effort: 'low' as const,
            priority: 2
          },
          {
            type: 'opportunity' as const,
            title: 'Expand Analytics Team',
            description: 'Analytics team showing 91% efficiency with high innovation scores',
            impact: 'medium' as const,
            effort: 'medium' as const,
            priority: 3
          }
        ]
      };

      return { overview, trends, distribution, performance, predictions };
    };

    setTimeout(() => {
      setData(generateMockData());
      setLoading(false);
    }, 1500);
  }, []);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // Refresh data
      console.log('Auto-refreshing analytics data...');
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getMetricColor = (value: number, type: 'percentage' | 'currency' | 'number' = 'number') => {
    if (type === 'percentage') {
      if (value >= 90) return 'text-green-600';
      if (value >= 75) return 'text-blue-600';
      if (value >= 60) return 'text-yellow-600';
      return 'text-red-600';
    }
    return 'text-gray-900';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      on_track: 'bg-green-100 text-green-800',
      at_risk: 'bg-yellow-100 text-yellow-800',
      delayed: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800'
    };
    return colors[status as keyof typeof colors] || colors.on_track;
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'optimization':
        return <Zap className="w-4 h-4 text-blue-500" />;
      case 'risk':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'opportunity':
        return <TargetIcon className="w-4 h-4 text-green-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getAnalyticsProgressClass = (percentage: number): string => {
    // Round to nearest 5 for available classes
    const rounded = Math.round(percentage / 5) * 5;
    return `analytics-progress-${rounded}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full"
        />
        <div className="ml-4 text-xl font-semibold text-gray-700">Loading Ultimate Analytics...</div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <BarChart3 className="w-8 h-8 text-purple-600 mr-3" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Ultimate Analytics Dashboard
              </h1>
              <div className="ml-4 px-3 py-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-semibold rounded-full">
                AI-POWERED
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Time Range Selector */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Time Range:</span>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value as any)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  title="Select time range for analytics"
                  aria-label="Select time range for analytics"
                >
                  <option value="day">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="quarter">This Quarter</option>
                  <option value="year">This Year</option>
                </select>
              </div>

              {/* Metric Selector */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Focus:</span>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  {(['tasks', 'users', 'budget', 'performance'] as const).map((metric) => (
                    <button
                      key={metric}
                      onClick={() => setSelectedMetric(metric)}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        selectedMetric === metric
                          ? 'bg-white text-purple-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {metric.charAt(0).toUpperCase() + metric.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`p-2 rounded-lg transition-colors ${
                    autoRefresh ? 'bg-purple-100 text-purple-600' : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title={`Auto-refresh ${autoRefresh ? 'enabled' : 'disabled'}`}
                  aria-label={`Auto-refresh ${autoRefresh ? 'enabled' : 'disabled'}`}
                >
                  <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
                </button>
                
                <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                  title="Download analytics data"
                  aria-label="Download analytics data"
                >
                  <Download className="w-4 h-4" />
                </button>
                
                <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                  title="Open analytics settings"
                  aria-label="Open analytics settings"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{formatNumber(data.overview.totalTasks)}</p>
                <div className="flex items-center mt-2">
                  {getTrendIcon('up')}
                  <span className="text-sm text-green-600 ml-1">+12.5%</span>
                  <span className="text-sm text-gray-500 ml-2">vs last month</span>
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <TargetIcon className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{formatNumber(data.overview.activeUsers)}</p>
                <div className="flex items-center mt-2">
                  {getTrendIcon('up')}
                  <span className="text-sm text-green-600 ml-1">+8.3%</span>
                  <span className="text-sm text-gray-500 ml-2">vs last month</span>
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Budget</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{formatCurrency(data.overview.totalBudget)}</p>
                <div className="flex items-center mt-2">
                  {getTrendIcon('stable')}
                  <span className="text-sm text-gray-600 ml-1">On track</span>
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Efficiency</p>
                <p className={`text-3xl font-bold mt-2 ${getMetricColor(data.overview.efficiency, 'percentage')}`}>
                  {data.overview.efficiency}%
                </p>
                <div className="flex items-center mt-2">
                  {getTrendIcon('up')}
                  <span className="text-sm text-green-600 ml-1">+3.2%</span>
                  <span className="text-sm text-gray-500 ml-2">improvement</span>
                </div>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Gauge className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Task Completion Trend */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Task Completion Trend</h3>
              <button className="text-gray-400 hover:text-gray-600"
                title="View detailed chart"
                aria-label="View detailed chart"
              >
                <Eye className="w-5 h-5" />
              </button>
            </div>
            
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <LineChart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Interactive chart visualization</p>
                <p className="text-sm text-gray-400 mt-1">Task completion over time</p>
              </div>
            </div>
          </motion.div>

          {/* Distribution Charts */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Task Distribution</h3>
              <button className="text-gray-400 hover:text-gray-600"
                title="View distribution chart"
                aria-label="View distribution chart"
              >
                <PieChart className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {data.distribution.tasksByStatus.map((item) => (
                <div key={item.status} className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    item.status === 'completed' ? 'bg-green-500' :
                    item.status === 'in_progress' ? 'bg-blue-500' :
                    item.status === 'draft' ? 'bg-gray-500' : 'bg-red-500'
                  }`} />
                  <div className="flex-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700 capitalize">{item.status.replace('_', ' ')}</span>
                      <span className="text-gray-900 font-medium">{item.percentage}%</span>
                    </div>
                    <div className="analytics-progress-container mt-1">
                      <div 
                        className={`${
                          item.status === 'completed' ? 'analytics-progress-fill-green' :
                          item.status === 'in_progress' ? 'analytics-progress-fill-green-blue' :
                          item.status === 'draft' ? 'analytics-progress-fill-yellow-red' : 'analytics-progress-fill-yellow-red'
                        } ${getAnalyticsProgressClass(item.percentage)}`}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Top Performers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Top Performers</h3>
            <button className="text-gray-400 hover:text-gray-600"
              title="View top performers details"
              aria-label="View top performers details"
            >
              <Award className="w-5 h-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.performance.topPerformers.map((performer, index) => (
              <div key={performer.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                    {performer.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-900">{index + 1}</span>
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{performer.name}</div>
                  <div className="text-sm text-gray-600">{performer.role}</div>
                  <div className="flex items-center space-x-4 mt-2">
                    <div className="flex items-center space-x-1">
                      <TargetIcon className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-600">{performer.tasksCompleted}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Gauge className="w-3 h-3 text-gray-400" />
                      <span className={`text-xs font-medium ${getMetricColor(performer.efficiency, 'percentage')}`}>
                        {performer.efficiency}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* AI Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-sm border border-gray-200 p-6 text-white"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Brain className="w-6 h-6" />
              <h3 className="text-lg font-semibold">AI Recommendations</h3>
              <div className="px-2 py-1 bg-white/20 rounded-full text-xs font-semibold">
                {data.predictions.recommendations.length} Action Items
              </div>
            </div>
            <button className="text-white/80 hover:text-white"
              title="View AI recommendations details"
              aria-label="View AI recommendations details"
            >
              <Sparkles className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            {data.predictions.recommendations.map((rec, index) => (
              <div key={index} className="flex items-start space-x-4 p-4 bg-white/10 rounded-lg backdrop-blur">
                <div className="p-2 bg-white/20 rounded-lg">
                  {getRecommendationIcon(rec.type)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{rec.title}</h4>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        rec.impact === 'high' ? 'bg-red-500/20 text-red-200' :
                        rec.impact === 'medium' ? 'bg-yellow-500/20 text-yellow-200' :
                        'bg-green-500/20 text-green-200'
                      }`}>
                        {rec.impact} impact
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        rec.effort === 'high' ? 'bg-orange-500/20 text-orange-200' :
                        rec.effort === 'medium' ? 'bg-blue-500/20 text-blue-200' :
                        'bg-green-500/20 text-green-200'
                      }`}>
                        {rec.effort} effort
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-white/80">{rec.description}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Predictions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900">Next Month</h4>
              <Calendar className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Tasks</span>
                <span className="font-medium text-gray-900">{formatNumber(data.predictions.nextMonthTasks)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Users</span>
                <span className="font-medium text-gray-900">{formatNumber(data.predictions.nextMonthUsers)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Budget</span>
                <span className="font-medium text-gray-900">{formatCurrency(data.predictions.nextMonthBudget)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900">Risk Analysis</h4>
              <Shield className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Risk Level</span>
                <span className={`font-medium ${getMetricColor(data.predictions.riskProbability, 'percentage')}`}>
                  {data.predictions.riskProbability}%
                </span>
              </div>
              <div className="analytics-progress-container">
                <div 
                  className={`analytics-progress-fill-yellow-red ${getAnalyticsProgressClass(data.predictions.riskProbability)}`}
                />
              </div>
              <p className="text-xs text-gray-500">Moderate risk detected</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900">Opportunities</h4>
              <TargetIcon className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Score</span>
                <span className={`font-medium ${getMetricColor(data.predictions.opportunityScore, 'percentage')}`}>
                  {data.predictions.opportunityScore}%
                </span>
              </div>
              <div className="analytics-progress-container">
                <div 
                  className={`analytics-progress-fill-green-blue ${getAnalyticsProgressClass(data.predictions.opportunityScore)}`}
                />
              </div>
              <p className="text-xs text-gray-500">High growth potential</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900">AI Insights</h4>
              <Brain className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Efficiency improving</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Team collaboration up</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Innovation score high</span>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default UltimateAnalyticsDashboard;
