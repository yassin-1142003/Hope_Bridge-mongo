import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { useChat } from '../contexts/ChatContext';
import { BellIcon, UserCircleIcon, ArrowRightOnRectangleIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { alertsAPI } from '../services/api';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { connected } = useSocket();
  const { openChat, unreadCounts } = useChat();
  const navigate = useNavigate();
  const location = useLocation();
  const [alerts, setAlerts] = useState([]);
  const [showAlerts, setShowAlerts] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchAlerts();
      const interval = setInterval(fetchAlerts, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchAlerts = async () => {
    try {
      const response = await alertsAPI.getAlerts();
      setAlerts(response.data.alerts);
      setUnreadCount(response.data.alerts.filter(alert => alert.type === 'new-assignment').length);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  const handleMarkAlertRead = async (alertId) => {
    try {
      await alertsAPI.markAlertRead(alertId);
      fetchAlerts();
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'overdue':
        return '🔴';
      case 'due-soon':
        return '🟡';
      case 'urgent':
        return '🔴';
      case 'new-assignment':
        return '📋';
      default:
        return '🔔';
    }
  };

  const getAlertColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'border-red-300 bg-red-50';
      case 'high':
        return 'border-orange-300 bg-orange-50';
      case 'warning':
        return 'border-yellow-300 bg-yellow-50';
      case 'info':
        return 'border-blue-300 bg-blue-50';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  if (!user) return null;

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="text-xl font-bold text-gray-900">
              Task Manager
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-gray-600">
                {connected ? 'Connected' : 'Offline'}
              </span>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowAlerts(!showAlerts)}
                className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <BellIcon className="h-6 w-6" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showAlerts && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {alerts.length === 0 ? (
                      <div className="p-4 text-gray-500 text-center">
                        No notifications
                      </div>
                    ) : (
                      alerts.map((alert) => (
                        <div
                          key={alert.id}
                          className={`p-4 border-b border-gray-100 ${getAlertColor(alert.severity)} hover:opacity-80 transition-opacity cursor-pointer`}
                          onClick={() => {
                            if (alert.type === 'new-assignment') {
                              handleMarkAlertRead(alert.id);
                            }
                            navigate(`/task/${alert.task._id}`);
                            setShowAlerts(false);
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-lg">{getAlertIcon(alert.type)}</span>
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 text-sm">
                                {alert.title}
                              </div>
                              <div className="text-gray-600 text-sm mt-1">
                                {alert.message}
                              </div>
                              <div className="text-gray-500 text-xs mt-2">
                                {new Date(alert.createdAt).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={openChat}
                className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ChatBubbleLeftRightIcon className="h-6 w-6" />
                {Object.values(unreadCounts).reduce((sum, count) => sum + count, 0) > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {Object.values(unreadCounts).reduce((sum, count) => sum + count, 0)}
                  </span>
                )}
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <UserCircleIcon className="h-8 w-8 text-gray-600" />
                <div className="hidden sm:block">
                  <div className="text-sm font-medium text-gray-900">
                    {user.firstName} {user.lastName}
                  </div>
                  <div className="text-xs text-gray-500 capitalize">
                    {user.role}
                  </div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                title="Logout"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
