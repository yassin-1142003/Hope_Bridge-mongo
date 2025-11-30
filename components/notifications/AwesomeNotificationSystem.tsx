/**
 * 🎆 AWESOME NOTIFICATION SYSTEM
 * 
 * Mind-blowing notification component with glassmorphism,
 * particle effects, and stunning animations!
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  X,
  Sparkles,
  Zap,
  Heart,
  Star,
  Crown,
  Diamond,
  Rocket,
  Flame,
  Zap as Thunderbolt,
  Gift,
  Trophy,
  Target,
  Shield,
  Eye
} from 'lucide-react';

interface AwesomeNotification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info' | 'achievement' | 'milestone' | 'reward';
  title: string;
  message: string;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: any;
  particles?: boolean;
}

interface AwesomeNotificationSystemProps {
  notifications: AwesomeNotification[];
  onNotificationClick?: (notification: AwesomeNotification) => void;
  onDismiss?: (id: string) => void;
  className?: string;
}

const AwesomeNotificationSystem: React.FC<AwesomeNotificationSystemProps> = ({
  notifications,
  onNotificationClick,
  onDismiss,
  className = ''
}) => {
  const [visibleNotifications, setVisibleNotifications] = useState<AwesomeNotification[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [sparkleEffects, setSparkleEffects] = useState(true);

  useEffect(() => {
    setVisibleNotifications(notifications.slice(0, 5));
  }, [notifications]);

  // 🎨 Get awesome icon for notification type
  const getNotificationIcon = (type: AwesomeNotification['type']) => {
    const iconMap = {
      success: { icon: CheckCircle, gradient: 'from-green-500 to-emerald-500', bgGradient: 'from-green-100 to-emerald-100' },
      warning: { icon: AlertCircle, gradient: 'from-yellow-500 to-orange-500', bgGradient: 'from-yellow-100 to-orange-100' },
      error: { icon: X, gradient: 'from-red-500 to-pink-500', bgGradient: 'from-red-100 to-pink-100' },
      info: { icon: Info, gradient: 'from-blue-500 to-cyan-500', bgGradient: 'from-blue-100 to-cyan-100' },
      achievement: { icon: Trophy, gradient: 'from-purple-500 to-pink-500', bgGradient: 'from-purple-100 to-pink-100' },
      milestone: { icon: Target, gradient: 'from-indigo-500 to-purple-500', bgGradient: 'from-indigo-100 to-purple-100' },
      reward: { icon: Gift, gradient: 'from-yellow-500 to-red-500', bgGradient: 'from-yellow-100 to-red-100' }
    };
    return iconMap[type] || iconMap.info;
  };

  // 🌟 Get priority color
  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'border-gray-300',
      medium: 'border-blue-400',
      high: 'border-orange-400',
      urgent: 'border-red-500 animate-pulse'
    };
    return colors[priority as keyof typeof colors] || colors.low;
  };

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-sm ${className}`}>
      {/* 🎯 Notification Bell */}
      <motion.div
        whileHover={{ scale: 1.1, rotate: 15 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsExpanded(!isExpanded)}
        className="relative p-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl cursor-pointer shadow-2xl mb-4"
      >
        <Bell className="w-6 h-6 text-white" />
        {notifications.length > 0 && (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold"
          >
            {notifications.length}
          </motion.div>
        )}
        
        {/* ✨ Sparkle Effects */}
        {sparkleEffects && [...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ 
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
              rotate: [0, 180, 360]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              delay: i * 0.3,
              ease: "easeOut"
            }}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${20 + Math.cos(i * 60 * Math.PI / 180) * 15}px`,
              top: `${20 + Math.sin(i * 60 * Math.PI / 180) * 15}px`
            }}
          />
        ))}
      </motion.div>

      {/* 🎆 Notification List */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl max-h-96 overflow-y-auto"
          >
            <div className="p-4 border-b border-white/10">
              <h3 className="text-white font-bold text-lg">Notifications</h3>
              <p className="text-white/60 text-sm">{notifications.length} new notifications</p>
            </div>
            
            <div className="p-2 space-y-2">
              {visibleNotifications.map((notification, index) => {
                const iconConfig = getNotificationIcon(notification.type);
                const Icon = notification.icon || iconConfig.icon;
                
                return (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 100 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, x: -5 }}
                    onClick={() => onNotificationClick?.(notification)}
                    className={`p-4 bg-gradient-to-r ${iconConfig.bgGradient} rounded-2xl border-2 ${getPriorityColor(notification.priority)} cursor-pointer relative overflow-hidden group`}
                  >
                    {/* 🌟 Particle Background */}
                    {notification.particles && [...Array(8)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{ 
                          opacity: [0, 1, 0],
                          scale: [0, 1, 0],
                          x: [Math.random() * 100 - 50, Math.random() * 100 - 50],
                          y: [Math.random() * 100 - 50, Math.random() * 100 - 50]
                        }}
                        transition={{ 
                          duration: 3, 
                          repeat: Infinity, 
                          delay: Math.random() * 2
                        }}
                        className="absolute w-1 h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
                      />
                    ))}
                    
                    <div className="flex items-start gap-3 relative z-10">
                      <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        className={`p-2 bg-gradient-to-r ${iconConfig.gradient} rounded-xl flex-shrink-0`}
                      >
                        <Icon className="w-4 h-4 text-white" />
                      </motion.div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-800 text-sm">{notification.title}</h4>
                        <p className="text-gray-600 text-xs mt-1 line-clamp-2">{notification.message}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">
                            {new Date(notification.timestamp).toLocaleTimeString()}
                          </span>
                          {notification.action && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                notification.action?.onClick();
                              }}
                              className="px-2 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs rounded-lg"
                            >
                              {notification.action.label}
                            </motion.button>
                          )}
                        </div>
                      </div>
                      
                      <motion.button
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onDismiss?.(notification.id);
                        }}
                        className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                      >
                        <X className="w-3 h-3 text-gray-600" />
                      </motion.button>
                    </div>
                    
                    {/* 🎨 Hover Effect */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                    />
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AwesomeNotificationSystem;
