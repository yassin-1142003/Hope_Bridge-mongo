/**
 * Professional Real-Time Task Alert System
 * 
 * Advanced notification system for new tasks sent/received
 * with WebSocket-like polling, toast notifications, and real-time updates.
 */

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  X, 
  Check, 
  AlertCircle, 
  User, 
  Calendar, 
  Clock,
  ChevronRight,
  RefreshCw,
  Settings,
  Filter
} from 'lucide-react';

interface TaskAlert {
  id: string;
  type: 'new_task_assigned' | 'task_updated' | 'task_completed' | 'task_overdue' | 'task_cancelled';
  title: string;
  message: string;
  taskId: string;
  taskTitle: string;
  assignedTo: string;
  assignedToName: string;
  assignedBy: string;
  assignedByName: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string;
  createdAt: string;
  read: boolean;
  actionRequired: boolean;
  metadata?: {
    [key: string]: any;
  };
}

interface TaskAlertSystemProps {
  userId?: string;
  userRole?: string;
  onTaskClick?: (taskId: string) => void;
  onMarkAllRead?: () => void;
  className?: string;
  maxAlerts?: number;
  refreshInterval?: number;
}

const TaskAlertSystem: React.FC<TaskAlertSystemProps> = ({
  userId,
  userRole,
  onTaskClick,
  onMarkAllRead,
  className = '',
  maxAlerts = 50,
  refreshInterval = 30000 // 30 seconds
}) => {
  const [alerts, setAlerts] = useState<TaskAlert[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'action_required'>('all');
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'error'>('connected');
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Fetch new alerts
  const fetchAlerts = useCallback(async (showLoading = false) => {
    if (showLoading) setIsLoading(true);
    
    try {
      // Cancel previous request if still pending
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      abortControllerRef.current = new AbortController();
      
      const params = new URLSearchParams({
        limit: maxAlerts.toString(),
        includeRead: filter === 'all' ? 'true' : 'false',
        actionRequired: filter === 'action_required' ? 'true' : 'false',
        lastFetch: lastFetchTime?.toISOString() || ''
      });

      const response = await fetch(`/api/notifications/tasks?${params}`, {
        signal: abortControllerRef.current.signal,
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.alerts) {
        setAlerts(prevAlerts => {
          const newAlerts = data.alerts.filter((newAlert: TaskAlert) => 
            !prevAlerts.some(existingAlert => existingAlert.id === newAlert.id)
          );
          return [...newAlerts, ...prevAlerts].slice(0, maxAlerts);
        });
        
        setUnreadCount(data.unreadCount || 0);
        setLastFetchTime(new Date());
        setConnectionStatus('connected');
        
        // Show toast notifications for new urgent alerts
        data.alerts.forEach((alert: TaskAlert) => {
          if (alert.priority === 'urgent' || alert.actionRequired) {
            showNotificationToast(alert);
          }
        });
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Failed to fetch task alerts:', error);
        setConnectionStatus('error');
      }
    } finally {
      setIsLoading(false);
    }
  }, [filter, maxAlerts, lastFetchTime]);

  // Show browser notification toast
  const showNotificationToast = (alert: TaskAlert) => {
    // Check if browser notifications are supported and permitted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`Task Alert: ${alert.title}`, {
        body: alert.message,
        icon: '/favicon.ico',
        tag: alert.id,
        requireInteraction: alert.actionRequired
      });
    }
    
    // Fallback to visual toast
    console.log(`🔔 New Task Alert: ${alert.title} - ${alert.message}`);
  };

  // Mark alert as read
  const markAsRead = async (alertId: string) => {
    try {
      const response = await fetch(`/api/notifications/${alertId}/read`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        setAlerts(prev => prev.map(alert => 
          alert.id === alertId ? { ...alert, read: true } : alert
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to mark alert as read:', error);
    }
  };

  // Mark all alerts as read
  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        setAlerts(prev => prev.map(alert => ({ ...alert, read: true })));
        setUnreadCount(0);
        onMarkAllRead?.();
      }
    } catch (error) {
      console.error('Failed to mark all alerts as read:', error);
    }
  };

  // Delete alert
  const deleteAlert = async (alertId: string) => {
    try {
      const response = await fetch(`/api/notifications/${alertId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setAlerts(prev => prev.filter(alert => alert.id !== alertId));
        if (!alerts.find(a => a.id === alertId)?.read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error('Failed to delete alert:', error);
    }
  };

  // Request notification permission
  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  };

  // Get alert icon and color based on type
  const getAlertIcon = (alert: TaskAlert) => {
    const iconClass = "w-5 h-5";
    
    switch (alert.type) {
      case 'new_task_assigned':
        return <User className={`${iconClass} text-blue-500`} />;
      case 'task_updated':
        return <RefreshCw className={`${iconClass} text-yellow-500`} />;
      case 'task_completed':
        return <Check className={`${iconClass} text-green-500`} />;
      case 'task_overdue':
        return <AlertCircle className={`${iconClass} text-red-500`} />;
      case 'task_cancelled':
        return <X className={`${iconClass} text-gray-500`} />;
      default:
        return <Bell className={`${iconClass} text-gray-500`} />;
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800 border-green-300',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      high: 'bg-orange-100 text-orange-800 border-orange-300',
      urgent: 'bg-red-100 text-red-800 border-red-300'
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  // Format relative time
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Filter alerts based on current filter
  const filteredAlerts = alerts.filter(alert => {
    switch (filter) {
      case 'unread':
        return !alert.read;
      case 'action_required':
        return alert.actionRequired;
      default:
        return true;
    }
  });

  // Initialize polling and notification permissions
  useEffect(() => {
    requestNotificationPermission();
    fetchAlerts(true);

    // Set up polling interval
    pollingIntervalRef.current = setInterval(() => {
      fetchAlerts(false);
    }, refreshInterval);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchAlerts, refreshInterval]);

  return (
    <div className={`relative ${className}`}>
      {/* Alert Bell Button */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          title="Task alerts"
          aria-label={`Task alerts ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </motion.span>
          )}
        </button>

        {/* Connection Status Indicator */}
        <div className={`absolute bottom-0 right-0 w-2 h-2 rounded-full ${
          connectionStatus === 'connected' ? 'bg-green-500' : 
          connectionStatus === 'error' ? 'bg-red-500' : 'bg-gray-400'
        }`} title={`Connection: ${connectionStatus}`} />
      </div>

      {/* Alerts Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-96 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 max-h-96 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">Task Alerts</h3>
                <div className="flex items-center gap-2">
                  {isLoading && (
                    <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
                  )}
                  <button
                    onClick={() => fetchAlerts(true)}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                    title="Refresh alerts"
                  >
                    <RefreshCw className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                    title="Close alerts"
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex gap-1">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    filter === 'all' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    filter === 'unread' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Unread {unreadCount > 0 && `(${unreadCount})`}
                </button>
                <button
                  onClick={() => setFilter('action_required')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    filter === 'action_required' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Action Required
                </button>
              </div>
            </div>

            {/* Alerts List */}
            <div className="max-h-64 overflow-y-auto">
              {filteredAlerts.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No {filter === 'all' ? '' : filter.replace('_', ' ')} alerts</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredAlerts.map((alert) => (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                        !alert.read ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getAlertIcon(alert)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className={`text-sm font-medium text-gray-900 ${
                                !alert.read ? 'font-semibold' : ''
                              }`}>
                                {alert.title}
                              </p>
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {alert.message}
                              </p>
                              
                              <div className="flex items-center gap-2 mt-2">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(alert.priority)}`}>
                                  {alert.priority}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {formatRelativeTime(alert.createdAt)}
                                </span>
                                {alert.actionRequired && (
                                  <span className="text-xs text-red-600 font-medium">
                                    Action Required
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-1 ml-2">
                              {!alert.read && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(alert.id);
                                  }}
                                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                                  title="Mark as read"
                                >
                                  <Check className="w-3 h-3 text-gray-600" />
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteAlert(alert.id);
                                }}
                                className="p-1 hover:bg-gray-200 rounded transition-colors"
                                title="Delete alert"
                              >
                                <X className="w-3 h-3 text-gray-600" />
                              </button>
                            </div>
                          </div>
                          
                          {alert.taskId && (
                            <button
                              onClick={() => {
                                onTaskClick?.(alert.taskId);
                                setIsOpen(false);
                              }}
                              className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                            >
                              View Task
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {alerts.length > 0 && (
              <div className="p-3 border-t border-gray-200 bg-gray-50 flex justify-between">
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  disabled={unreadCount === 0}
                >
                  Mark All Read
                </button>
                <span className="text-xs text-gray-500">
                  Last updated: {lastFetchTime?.toLocaleTimeString()}
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TaskAlertSystem;
