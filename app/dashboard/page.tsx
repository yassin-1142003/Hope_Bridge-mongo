/**
 * 🚀 ULTIMATE AWESOME DASHBOARD PAGE
 * 
 * This is the most stunning, professional, and mind-blowing dashboard
 * you will ever see! Prepare to be amazed! ✨🎆🎯
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import AwesomeDashboard from '@/components/dashboard/AwesomeDashboard';
import AwesomeNotificationSystem from '@/components/notifications/AwesomeNotificationSystem';
import AwesomeChart from '@/components/charts/AwesomeChart';
import { 
  Rocket, 
  Sparkles, 
  Zap, 
  Crown, 
  Diamond,
  Flame,
  Star,
  Trophy,
  Target,
  BarChart3,
  Activity,
  TrendingUp,
  Users,
  Calendar,
  Settings,
  Bell,
  Search,
  Filter,
  Moon,
  Sun,
  Globe,
  Shield,
  Heart,
  Award
} from 'lucide-react';

const UltimateAwesomeDashboard: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [sparkleMode, setSparkleMode] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('week');
  const [searchQuery, setSearchQuery] = useState('');
  const { scrollY } = useScroll();
  const headerOpacity = useTransform(scrollY, [0, 100], [1, 0.8]);
  const headerScale = useTransform(scrollY, [0, 100], [1, 0.95]);

  // 🎆 Mock data for awesome charts
  const performanceData = [
    { label: 'Tasks Completed', value: 147, color: '#8b5cf6', trend: 'up' as const, icon: Trophy },
    { label: 'Meetings Attended', value: 23, color: '#ec4899', trend: 'up' as const, icon: Users },
    { label: 'Projects Delivered', value: 8, color: '#3b82f6', trend: 'stable' as const, icon: Target },
    { label: 'Team Collaboration', value: 95, color: '#10b981', trend: 'up' as const, icon: Heart }
  ];

  const productivityData = [
    { label: 'Monday', value: 85, color: '#8b5cf6' },
    { label: 'Tuesday', value: 92, color: '#ec4899' },
    { label: 'Wednesday', value: 78, color: '#3b82f6' },
    { label: 'Thursday', value: 88, color: '#10b981' },
    { label: 'Friday', value: 95, color: '#f59e0b' }
  ];

  const achievementData = [
    { label: 'Task Master', value: 45, color: '#8b5cf6' },
    { label: 'Team Player', value: 30, color: '#ec4899' },
    { label: 'Innovation', value: 25, color: '#3b82f6' }
  ];

  // 🎯 Mock notifications
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      type: 'achievement' as const,
      title: '🏆 Achievement Unlocked!',
      message: 'You\'ve completed 100 tasks! You\'re a true champion!',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      priority: 'high' as const,
      particles: true,
      action: {
        label: 'View Achievement',
        onClick: () => console.log('View achievement')
      }
    },
    {
      id: '2',
      type: 'milestone' as const,
      title: '🎯 Milestone Reached',
      message: 'Your productivity increased by 25% this week!',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      priority: 'medium' as const,
      particles: true
    },
    {
      id: '3',
      type: 'reward' as const,
      title: '🎁 Reward Available',
      message: 'You\'ve earned a new badge! Claim your reward now.',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      priority: 'low' as const,
      action: {
        label: 'Claim Reward',
        onClick: () => console.log('Claim reward')
      }
    }
  ]);

  // 🌟 Time range options
  const timeRanges = [
    { value: 'day', label: 'Today', icon: Sun },
    { value: 'week', label: 'This Week', icon: Calendar },
    { value: 'month', label: 'This Month', icon: Calendar },
    { value: 'year', label: 'This Year', icon: Globe }
  ];

  return (
    <div className={`min-h-screen relative overflow-hidden ${isDarkMode ? 'dark' : ''}`}>
      {/* 🌟 Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* 🎨 Floating gradient orbs */}
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
        
        {/* ✨ Sparkle particles */}
        {sparkleMode && [...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
            transition={{ 
              duration: 3, 
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

      {/* 🎯 Sticky Header */}
      <motion.header
        style={{ opacity: headerOpacity, scale: headerScale }}
        className="fixed top-0 left-0 right-0 z-40 bg-white/10 backdrop-blur-xl border-b border-white/20"
      >
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              {/* 🚀 Logo */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl"
              >
                <Rocket className="w-6 h-6 text-white" />
              </motion.div>
              
              {/* 🎯 Title */}
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                  Ultimate Awesome Dashboard
                </h1>
                <p className="text-sm text-gray-300">
                  Experience perfection in every pixel ✨
                </p>
              </div>
            </div>
            
            {/* 🎛️ Controls */}
            <div className="flex items-center gap-4">
              {/* 🔍 Search */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="relative"
              >
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search anything..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </motion.div>
              
              {/* ⏰ Time Range */}
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-1">
                {timeRanges.map((range) => (
                  <motion.button
                    key={range.value}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedTimeRange(range.value)}
                    className={`px-3 py-1 rounded-lg flex items-center gap-2 transition-colors ${
                      selectedTimeRange === range.value
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    <range.icon className="w-3 h-3" />
                    <span className="text-xs">{range.label}</span>
                  </motion.button>
                ))}
              </div>
              
              {/* 🎨 Theme Toggle */}
              <motion.button
                whileHover={{ scale: 1.1, rotate: 15 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-3 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl"
              >
                {isDarkMode ? (
                  <Moon className="w-4 h-4 text-purple-300" />
                ) : (
                  <Sun className="w-4 h-4 text-yellow-300" />
                )}
              </motion.button>
              
              {/* ✨ Sparkle Toggle */}
              <motion.button
                whileHover={{ scale: 1.1, rotate: -15 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSparkleMode(!sparkleMode)}
                className="p-3 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-xl"
              >
                <Sparkles className="w-4 h-4 text-blue-300" />
              </motion.button>
              
              {/* 🔔 Notifications */}
              <motion.div className="relative">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-3 bg-gradient-to-r from-orange-600/20 to-red-600/20 rounded-xl"
                >
                  <Bell className="w-4 h-4 text-orange-300" />
                </motion.button>
                {notifications.length > 0 && (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  >
                    {notifications.length}
                  </motion.div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* 🎯 Main Content */}
      <main className="relative z-10 pt-24 px-8 pb-8">
        {/* 🚀 Awesome Dashboard Component */}
        <AwesomeDashboard className="mb-8" />
        
        {/* 📊 Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <AwesomeChart
            data={performanceData}
            type="bar"
            title="🏆 Performance Overview"
            subtitle="Your amazing achievements"
            className="lg:col-span-1"
          />
          <AwesomeChart
            data={productivityData}
            type="line"
            title="📈 Productivity Trends"
            subtitle="Daily performance metrics"
            className="lg:col-span-1"
          />
          <AwesomeChart
            data={achievementData}
            type="pie"
            title="🎯 Achievement Distribution"
            subtitle="Your success breakdown"
            className="lg:col-span-1"
          />
        </div>
        
        {/* 🎯 Quick Actions Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {[
            { icon: Target, title: 'Set Goals', gradient: 'from-purple-600 to-pink-600', description: 'Define your objectives' },
            { icon: Users, title: 'Team Work', gradient: 'from-blue-600 to-cyan-600', description: 'Collaborate effectively' },
            { icon: Award, title: 'Achievements', gradient: 'from-green-600 to-emerald-600', description: 'Track your success' },
            { icon: Settings, title: 'Settings', gradient: 'from-orange-600 to-red-600', description: 'Customize experience' }
          ].map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ 
                scale: 1.05, 
                y: -10,
                boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
              }}
              className="p-6 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 cursor-pointer group"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                className={`w-12 h-12 bg-gradient-to-r ${action.gradient} rounded-2xl flex items-center justify-center mb-4`}
              >
                <action.icon className="w-6 h-6 text-white" />
              </motion.div>
              <h3 className="text-lg font-bold text-white mb-2">{action.title}</h3>
              <p className="text-sm text-gray-300">{action.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </main>

      {/* 🎆 Notification System */}
      <AwesomeNotificationSystem
        notifications={notifications}
        onNotificationClick={(notification) => console.log('Clicked:', notification)}
        onDismiss={(id) => setNotifications(prev => prev.filter(n => n.id !== id))}
      />
    </div>
  );
};

export default UltimateAwesomeDashboard;
