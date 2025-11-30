'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Sparkles, Send, Users, CheckCircle } from 'lucide-react';

interface AlertButtonProps {
  locale?: string;
}

export default function AlertButton({ locale = 'en' }: AlertButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [newProjectsCount, setNewProjectsCount] = useState(0);
  const [message, setMessage] = useState('');
  const [notificationSent, setNotificationSent] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [pulseEffect, setPulseEffect] = useState(false);

  // Fetch new projects count on component mount
  useEffect(() => {
    fetchNewProjectsCount();
    // Set up periodic refresh
    const interval = setInterval(fetchNewProjectsCount, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchNewProjectsCount = async () => {
    try {
      const response = await fetch('/api/projects/new/count');
      const data = await response.json();
      if (data.success) {
        setNewProjectsCount(data.count);
        setNotificationCount(data.count);
        // Trigger pulse effect when there are new projects
        if (data.count > 0) {
          setPulseEffect(true);
          setTimeout(() => setPulseEffect(false), 2000);
        }
      }
    } catch (error) {
      console.error('Failed to fetch new projects count:', error);
    }
  };

  const sendNotification = async () => {
    if (!message.trim() || newProjectsCount === 0) return;

    setIsSending(true);
    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message.trim(),
          type: 'new_projects_alert',
          targetUsers: 'all', // Can be 'all', 'volunteers', 'donors', etc.
        }),
      });

      const data = await response.json();
      if (data.success) {
        setNotificationSent(true);
        setNotificationCount(0);
        setNewProjectsCount(0);
        setTimeout(() => {
          setNotificationSent(false);
          setIsExpanded(false);
          setMessage('');
        }, 3000);
      }
    } catch (error) {
      console.error('Failed to send notification:', error);
    } finally {
      setIsSending(false);
    }
  };

  const isArabic = locale === 'ar';

  return (
    <div className={`fixed bottom-8 ${isArabic ? 'left-8' : 'right-8'} z-50 flex flex-col items-end`}>
      {/* Expanded Notification Panel */}
      {isExpanded && (
        <div className={`mb-4 p-6 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 w-80 transform transition-all duration-500 ease-out ${
          isExpanded ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent ${isArabic ? 'font-arabic' : ''}`}>
              {isArabic ? 'إرسال إشعار' : 'Send Notification'}
            </h3>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* New Projects Info */}
          {newProjectsCount > 0 && (
            <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 text-blue-700">
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {isArabic 
                    ? `${newProjectsCount} مشاريع جديدة` 
                    : `${newProjectsCount} new projects`
                  }
                </span>
              </div>
            </div>
          )}

          {/* Message Input */}
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={isArabic ? 'اكتب رسالتك هنا...' : 'Write your message here...'}
            className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            rows={3}
            dir={isArabic ? 'rtl' : 'ltr'}
          />

          {/* Send Button */}
          <button
            onClick={sendNotification}
            disabled={!message.trim() || newProjectsCount === 0 || isSending}
            className={`mt-4 w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300 transform ${
              message.trim() && newProjectsCount > 0 && !isSending
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 hover:scale-105 hover:shadow-lg'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            } ${isSending ? 'opacity-75' : ''}`}
          >
            {isSending ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{isArabic ? 'جاري الإرسال...' : 'Sending...'}</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Send className="w-4 h-4" />
                <span>{isArabic ? 'إرسال' : 'Send'}</span>
              </div>
            )}
          </button>

          {/* Success Message */}
          {notificationSent && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">
                {isArabic ? 'تم إرسال الإشعار بنجاح!' : 'Notification sent successfully!'}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Alert Button */}
      <div className="relative">
        {/* Pulse Effect Background */}
        {pulseEffect && newProjectsCount > 0 && (
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-ping opacity-75" />
        )}

        {/* Main Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`relative group flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-full shadow-lg transform transition-all duration-300 hover:scale-110 hover:shadow-2xl active:scale-95 ${
            isExpanded ? 'rotate-45' : ''
          } ${pulseEffect ? 'animate-pulse' : ''}`}
        >
          {/* Icon */}
          <div className="relative z-10">
            <Bell 
              className={`w-6 h-6 text-white transition-transform duration-300 ${
                isHovered ? 'scale-110' : ''
              } ${isExpanded ? 'animate-bounce' : ''}`} 
            />
          </div>

          {/* Sparkle Effects */}
          {isHovered && (
            <>
              <Sparkles className="absolute -top-1 -left-1 w-3 h-3 text-yellow-300 animate-spin" />
              <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-yellow-300 animate-spin" />
              <Sparkles className="absolute -bottom-1 -left-1 w-3 h-3 text-yellow-300 animate-spin" />
              <Sparkles className="absolute -bottom-1 -right-1 w-3 h-3 text-yellow-300 animate-spin" />
            </>
          )}

          {/* Notification Badge */}
          {notificationCount > 0 && (
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-bounce border-2 border-white">
              {notificationCount > 99 ? '99+' : notificationCount}
            </div>
          )}

          {/* Glow Effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 opacity-50 blur-lg group-hover:opacity-75 transition-opacity duration-300" />
        </button>

        {/* Tooltip */}
        {isHovered && !isExpanded && (
          <div className={`absolute bottom-full mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap ${
            isArabic ? 'right-0' : 'left-0'
          }`}>
            <div className="font-medium">
              {isArabic ? 'إشعارات المشاريع الجديدة' : 'New Projects Notifications'}
            </div>
            {newProjectsCount > 0 && (
              <div className="text-xs text-gray-300">
                {isArabic 
                  ? `${newProjectsCount} مشاريع جديدة` 
                  : `${newProjectsCount} new projects`
                }
              </div>
            )}
            {/* Arrow */}
            <div className={`absolute top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 ${
              isArabic ? 'right-2' : 'left-2'
            }`} />
          </div>
        )}
      </div>
    </div>
  );
}
