/**
 * Task Alerts Demo Page
 * 
 * Demonstration page for the professional task alert system
 * with real-time notifications and comprehensive monitoring.
 */

'use client';

import React, { useState } from 'react';
import TaskAlertDashboard from '@/components/dashboard/TaskAlertDashboard';
import TaskAlertSystem from '@/components/notifications/TaskAlertSystem';
import { motion } from 'framer-motion';
import { 
  Bell, 
  Settings, 
  TestTube, 
  Send,
  RefreshCw,
  Info,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

export default function TaskAlertsDemo() {
  const [isCreatingTestAlert, setIsCreatingTestAlert] = useState(false);
  const [lastAction, setLastAction] = useState<string>('');

  // Create a test notification
  const createTestNotification = async (type: string) => {
    setIsCreatingTestAlert(true);
    try {
      const response = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          title: `Test ${type} notification`,
          message: `This is a test ${type} notification created at ${new Date().toLocaleTimeString()}`,
          priority: type === 'urgent' ? 'urgent' : 'medium',
          actionRequired: type === 'assignment' || type === 'urgent'
        })
      });

      if (response.ok) {
        setLastAction(`Created test ${type} notification`);
        setTimeout(() => setLastAction(''), 3000);
      }
    } catch (error) {
      console.error('Failed to create test notification:', error);
      setLastAction('Failed to create test notification');
    } finally {
      setIsCreatingTestAlert(false);
    }
  };

  // Trigger the cron job manually
  const triggerCronJob = async (action: string) => {
    setIsCreatingTestAlert(true);
    try {
      const response = await fetch(`/api/cron/notifications?action=${action}`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || 'test-secret'}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLastAction(`Cron job "${action}" completed successfully`);
        setTimeout(() => setLastAction(''), 3000);
      }
    } catch (error) {
      console.error('Failed to trigger cron job:', error);
      setLastAction('Failed to trigger cron job');
    } finally {
      setIsCreatingTestAlert(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Bell className="w-8 h-8 text-blue-600" />
                Task Alert System
              </h1>
              <p className="text-gray-600 mt-2">
                Professional real-time task notifications and monitoring system
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <TaskAlertSystem />
            </div>
          </div>
        </motion.div>

        {/* Success/Error Message */}
        {lastAction && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-lg border ${
              lastAction.includes('Failed') 
                ? 'bg-red-50 border-red-200 text-red-800' 
                : 'bg-green-50 border-green-200 text-green-800'
            }`}
          >
            <div className="flex items-center gap-2">
              {lastAction.includes('Failed') ? (
                <AlertTriangle className="w-5 h-5" />
              ) : (
                <CheckCircle className="w-5 h-5" />
              )}
              <span>{lastAction}</span>
            </div>
          </motion.div>
        )}

        {/* Main Dashboard */}
        <TaskAlertDashboard className="mb-8" />

        {/* Test Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <TestTube className="w-5 h-5 text-purple-600" />
            Test Controls
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Test Notifications */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4">Create Test Notifications</h3>
              <div className="space-y-3">
                <button
                  onClick={() => createTestNotification('assignment')}
                  disabled={isCreatingTestAlert}
                  className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Create Assignment Alert
                </button>
                
                <button
                  onClick={() => createTestNotification('update')}
                  disabled={isCreatingTestAlert}
                  className="w-full px-4 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Create Update Alert
                </button>
                
                <button
                  onClick={() => createTestNotification('completion')}
                  disabled={isCreatingTestAlert}
                  className="w-full px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Create Completion Alert
                </button>
                
                <button
                  onClick={() => createTestNotification('urgent')}
                  disabled={isCreatingTestAlert}
                  className="w-full px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Create Urgent Alert
                </button>
              </div>
            </div>

            {/* Cron Job Controls */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4">System Controls</h3>
              <div className="space-y-3">
                <button
                  onClick={() => triggerCronJob('overdue')}
                  disabled={isCreatingTestAlert}
                  className="w-full px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Check Overdue Tasks
                </button>
                
                <button
                  onClick={() => triggerCronJob('upcoming')}
                  disabled={isCreatingTestAlert}
                  className="w-full px-4 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Check Upcoming Due Dates
                </button>
                
                <button
                  onClick={() => triggerCronJob('cleanup')}
                  disabled={isCreatingTestAlert}
                  className="w-full px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Cleanup Old Notifications
                </button>
                
                <button
                  onClick={() => triggerCronJob('stats')}
                  disabled={isCreatingTestAlert}
                  className="w-full px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Get Notification Stats
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* System Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-8 bg-blue-50 rounded-xl p-6 border border-blue-200"
        >
          <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
            <Info className="w-5 h-5" />
            System Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Real-time Features</h4>
              <ul className="space-y-1 text-blue-700">
                <li>• 30-second polling interval</li>
                <li>• WebSocket-like updates</li>
                <li>• Browser notifications</li>
                <li>• Live status indicators</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Alert Types</h4>
              <ul className="space-y-1 text-blue-700">
                <li>• New task assignments</li>
                <li>• Task updates</li>
                <li>• Task completions</li>
                <li>• Overdue tasks</li>
                <li>• Task cancellations</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Smart Features</h4>
              <ul className="space-y-1 text-blue-700">
                <li>• Priority-based filtering</li>
                <li>• Action required tracking</li>
                <li>• Automatic cleanup</li>
                <li>• Due date reminders</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
