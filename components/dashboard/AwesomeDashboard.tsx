/**
 * 🚀 AWESOME PROFESSIONAL DASHBOARD COMPONENT
 * 
 * World-class dashboard with stunning animations, glassmorphism effects,
 * gradient backgrounds, and professional design elements.
 * This dashboard will blow your mind with its perfection! ✨
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import TaskAlertSystem from '@/components/notifications/TaskAlertSystem';
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
=======
import RoleBasedTaskDashboard from './RoleBasedTaskDashboard';
>>>>>>> Stashed changes
=======
import RoleBasedTaskDashboard from './RoleBasedTaskDashboard';
>>>>>>> Stashed changes
=======
import RoleBasedTaskDashboard from './RoleBasedTaskDashboard';
>>>>>>> Stashed changes
=======
import RoleBasedTaskDashboard from './RoleBasedTaskDashboard';
>>>>>>> Stashed changes
=======
import RoleBasedTaskDashboard from './RoleBasedTaskDashboard';
>>>>>>> Stashed changes
=======
import RoleBasedTaskDashboard from './RoleBasedTaskDashboard';
>>>>>>> Stashed changes
import { 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  TrendingUp,
  Users,
  Calendar,
  BarChart3,
  Activity,
  Settings,
  Sparkles,
  Zap,
  Target,
  Award,
  Rocket,
  Star,
  Flame,
  Diamond,
  Crown,
  Shield,
  Eye,
  Filter,
  MoreVertical,
  ChevronUp,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  Minus,
  Sun,
  Moon,
  Cloud,
  Zap as Thunderbolt,
  Plus
} from 'lucide-react';

interface DashboardStats {
  totalTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  overdueTasks: number;
  unreadNotifications: number;
  actionRequiredNotifications: number;
  todayTasks: number;
  weeklyTasks: number;
}

interface TaskAlertDashboardProps {
  userId?: string;
  userRole?: string;
  onTaskClick?: (taskId: string) => void;
  className?: string;
}

const TaskAlertDashboard: React.FC<TaskAlertDashboardProps> = ({
  userId,
  userRole,
  onTaskClick,
  className = ''
}) => {
  const [stats, setStats] = useState<DashboardStats>({
    totalTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
    unreadNotifications: 0,
    actionRequiredNotifications: 0,
    todayTasks: 0,
    weeklyTasks: 0
  });

  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<string>('overview');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [sparkleAnimation, setSparkleAnimation] = useState(true);
  const controls = useAnimation();

  // 🎯 Fetch dashboard data with awesome loading
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Simulate API call with awesome delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Mock data with awesome numbers
        const mockStats: DashboardStats = {
          totalTasks: 147,
          pendingTasks: 23,
          inProgressTasks: 45,
          completedTasks: 79,
          overdueTasks: 8,
          unreadNotifications: 12,
          actionRequiredNotifications: 5,
          todayTasks: 15,
          weeklyTasks: 89
        };
        
        setStats(mockStats);
        
        // 🎨 Trigger awesome entrance animation
        await controls.start({
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { duration: 0.8, ease: "easeOut" }
        });
        
        setSparkleAnimation(true);
      } catch (error) {
        console.error('🚨 Dashboard fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [controls]);

  // 🌟 Awesome gradient animations
  const [gradientAngle, setGradientAngle] = useState(45);
  useEffect(() => {
    const interval = setInterval(() => {
      setGradientAngle(prev => (prev + 1) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // 🎊 Calculate awesome percentages
  const completionRate = stats.totalTasks > 0 ? (stats.completedTasks / stats.totalTasks) * 100 : 0;
  const productivityScore = Math.min(100, completionRate + (stats.todayTasks > 10 ? 10 : 0));

  // 💎 Awesome metric cards data
  const metricCards = [
    {
      id: 'overview',
      title: '🚀 Overview',
      icon: Rocket,
      value: stats.totalTasks,
      subtitle: 'Total Tasks',
      gradient: 'from-purple-600 via-pink-600 to-red-600',
      bgGradient: 'from-purple-50 to-pink-50',
      trend: stats.todayTasks > 10 ? 'up' : 'stable',
      trendValue: stats.todayTasks > 10 ? '+12%' : '0%'
    },
    {
      id: 'productivity',
      title: '⚡ Productivity',
      icon: Zap,
      value: `${Math.round(productivityScore)}%`,
      subtitle: 'Efficiency Rate',
      gradient: 'from-blue-600 via-cyan-600 to-teal-600',
      bgGradient: 'from-blue-50 to-cyan-50',
      trend: 'up',
      trendValue: '+8%'
    },
    {
      id: 'achievements',
      title: '🏆 Achievements',
      icon: Award,
      value: stats.completedTasks,
      subtitle: 'Completed',
      gradient: 'from-green-600 via-emerald-600 to-teal-600',
      bgGradient: 'from-green-50 to-emerald-50',
      trend: 'up',
      trendValue: '+23%'
    },
    {
      id: 'alerts',
      title: '🔔 Alerts',
      icon: Bell,
      value: stats.unreadNotifications,
      subtitle: 'Notifications',
      gradient: 'from-orange-600 via-red-600 to-pink-600',
      bgGradient: 'from-orange-50 to-red-50',
      trend: stats.unreadNotifications > 5 ? 'up' : 'down',
      trendValue: stats.unreadNotifications > 5 ? '+3' : '-2'
    }
  ];

  // 🎨 Awesome loading skeleton
  if (loading) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 ${className}`}>
        <div className="p-8">
          {/* 🌟 Awesome Header Loading */}
          <motion.div
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="mb-8"
          >
            <div className="h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl w-64 shimmer"></div>
            <div className="h-4 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl w-96 mt-4 shimmer"></div>
          </motion.div>

          {/* 💎 Metric Cards Loading */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                animate={{ scale: [0.95, 1, 0.95], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                className="h-32 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-2xl backdrop-blur-xl border border-white/10 shimmer"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden ${className}`}>
      {/* 🌟 Animated Background Effects */}
      <div className="absolute inset-0">
        {/* 🎨 Gradient Orbs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
            x: [0, 100, 0],
            y: [0, -100, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-purple-600/30 to-pink-600/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
            x: [0, -100, 0],
            y: [0, 100, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-blue-600/30 to-cyan-600/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -180, -360],
            x: [100, 0, -100],
            y: [-100, 0, 100]
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-full blur-3xl"
        />
        
        {/* ✨ Sparkle Effects */}
        {sparkleAnimation && [...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              delay: Math.random() * 5,
              ease: "easeOut"
            }}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
          />
        ))}
      </div>

      {/* 🎯 Main Dashboard Content */}
      <div className="relative z-10 p-8">
        {/* 🌟 Awesome Header */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl"
              >
                <Rocket className="w-8 h-8 text-white" />
              </motion.div>
              <div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                  Awesome Dashboard
                </h1>
                <p className="text-xl text-gray-300 mt-2">
                  Welcome back! Your productivity is 🚀 {Math.round(productivityScore)}% today!
                </p>
              </div>
            </div>
            
            {/* 🎛️ Awesome Controls */}
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSparkleAnimation(!sparkleAnimation)}
                className="p-3 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl backdrop-blur-xl border border-white/10"
              >
                <Sparkles className="w-5 h-5 text-purple-300" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, rotate: -5 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-xl backdrop-blur-xl border border-white/10"
              >
                <Settings className="w-5 h-5 text-blue-300" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* 💎 Awesome Metric Cards */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {metricCards.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ 
                scale: 1.05, 
                y: -10,
                boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
              }}
              onClick={() => setSelectedMetric(card.id)}
              className={`relative p-6 bg-gradient-to-br ${card.bgGradient} rounded-3xl backdrop-blur-xl border border-white/20 cursor-pointer overflow-hidden group`}
            >
              {/* 🌟 Card Background Animation */}
              <motion.div
                animate={{
                  background: `linear-gradient(${gradientAngle}deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))`
                }}
                className="absolute inset-0"
              />
              
              {/* 💎 Card Content */}
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 bg-gradient-to-r ${card.gradient} rounded-2xl`}>
                    <card.icon className="w-6 h-6 text-white" />
                  </div>
                  <motion.div
                    animate={{ rotate: card.trend === 'up' ? 360 : -360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className={`p-2 rounded-full ${
                      card.trend === 'up' ? 'bg-green-500/20 text-green-400' : 
                      card.trend === 'down' ? 'bg-red-500/20 text-red-400' : 
                      'bg-gray-500/20 text-gray-400'
                    }`}
                  >
                    {card.trend === 'up' ? <ArrowUp className="w-4 h-4" /> : 
                     card.trend === 'down' ? <ArrowDown className="w-4 h-4" /> : 
                     <Minus className="w-4 h-4" />}
                  </motion.div>
                </div>
                
                <motion.h3 
                  className="text-3xl font-bold text-gray-800 mb-1"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {card.value}
                </motion.h3>
                <p className="text-sm text-gray-600 mb-2">{card.subtitle}</p>
                <div className={`text-xs font-semibold ${
                  card.trend === 'up' ? 'text-green-600' : 
                  card.trend === 'down' ? 'text-red-600' : 
                  'text-gray-600'
                }`}>
                  {card.trendValue}
                </div>
              </div>
              
              {/* ✨ Hover Effect */}
              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"
              />
            </motion.div>
          ))}
        </motion.div>

        {/* 📊 Awesome Progress Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
        >
          {/* 🎯 Task Progress */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-8 bg-gradient-to-br from-purple-600/10 to-pink-600/10 rounded-3xl backdrop-blur-xl border border-white/20"
          >
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Target className="w-6 h-6 text-purple-400" />
              Task Progress
            </h3>
            
            <div className="space-y-6">
              {[
                { label: 'Completed', value: stats.completedTasks, color: 'from-green-500 to-emerald-500', percentage: completionRate },
                { label: 'In Progress', value: stats.inProgressTasks, color: 'from-blue-500 to-cyan-500', percentage: (stats.inProgressTasks / stats.totalTasks) * 100 },
                { label: 'Pending', value: stats.pendingTasks, color: 'from-yellow-500 to-orange-500', percentage: (stats.pendingTasks / stats.totalTasks) * 100 }
              ].map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white font-medium">{item.label}</span>
                    <span className="text-white/80">{item.value} tasks</span>
                  </div>
                  <div className="h-4 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.percentage}%` }}
                      transition={{ duration: 1, delay: index * 0.2, ease: "easeOut" }}
                      className={`h-full bg-gradient-to-r ${item.color} rounded-full relative overflow-hidden`}
                    >
                      <motion.div
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      />
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
=======
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
          {/* 🎯 Role-Based Task Management */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="col-span-full"
          >
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="p-8 bg-gradient-to-br from-indigo-600/10 to-purple-600/10 rounded-3xl backdrop-blur-xl border border-white/20"
            >
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Shield className="w-6 h-6 text-indigo-400" />
                Role-Based Task Management
              </h3>
              
              <div className="bg-black/20 rounded-2xl p-4">
                <RoleBasedTaskDashboard className="min-h-[600px]" />
              </div>
            </motion.div>
          </motion.div>

<<<<<<< Updated upstream
<<<<<<< Updated upstream
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
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
          {/* 🏆 Achievements */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-8 bg-gradient-to-br from-blue-600/10 to-cyan-600/10 rounded-3xl backdrop-blur-xl border border-white/20"
          >
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Award className="w-6 h-6 text-blue-400" />
              Recent Achievements
            </h3>
            
            <div className="space-y-4">
              {[
                { icon: Crown, title: 'Task Master', description: 'Completed 50+ tasks', color: 'from-yellow-500 to-orange-500' },
                { icon: Flame, title: 'On Fire!', description: '7-day streak', color: 'from-red-500 to-pink-500' },
                { icon: Diamond, title: 'Perfect Week', description: '100% completion rate', color: 'from-blue-500 to-purple-500' }
              ].map((achievement, index) => (
                <motion.div
                  key={achievement.title}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, x: 10 }}
                  className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className={`p-3 bg-gradient-to-r ${achievement.color} rounded-xl`}
                  >
                    <achievement.icon className="w-5 h-5 text-white" />
                  </motion.div>
                  <div>
                    <h4 className="text-white font-semibold">{achievement.title}</h4>
                    <p className="text-white/60 text-sm">{achievement.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* 🚀 Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-wrap gap-4"
        >
          {[
            { icon: Plus, label: 'New Task', gradient: 'from-purple-600 to-pink-600' },
            { icon: Calendar, label: 'Schedule', gradient: 'from-blue-600 to-cyan-600' },
            { icon: BarChart3, label: 'Reports', gradient: 'from-green-600 to-emerald-600' },
            { icon: Users, label: 'Team', gradient: 'from-orange-600 to-red-600' }
          ].map((action, index) => (
            <motion.button
              key={action.label}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`px-6 py-3 bg-gradient-to-r ${action.gradient} text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2`}
            >
              <action.icon className="w-4 h-4" />
              {action.label}
            </motion.button>
          ))}
        </motion.div>
      </div>

      {/* 🎨 Custom Styles */}
      <style jsx>{`
        .shimmer {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }
        
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
};

export default TaskAlertDashboard;
