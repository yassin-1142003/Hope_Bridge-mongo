"use client";
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  X, 
  Send, 
  Users, 
  Search, 
  Circle,
  Check,
  CheckCheck
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { hasPermission } from '@/lib/roles';
import { useTranslations } from 'next-intl';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  read: boolean;
  type: 'sent' | 'received';
}

interface ChatUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isOnline: boolean;
  lastMessage?: string;
  unreadCount?: number;
}

const ChatWidget: React.FC = () => {
  const { user } = useAuth();
  const t = useTranslations('chat');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatButtonRef = useRef<HTMLButtonElement>(null);

  // Handle keyboard navigation
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Check if user has permission to access chat
  const canAccessChat = user && hasPermission(user.role as any, 'canSendMessages');

  // Mock users for demonstration
  useEffect(() => {
    if (canAccessChat) {
      const mockUsers: ChatUser[] = [
        {
          id: '1',
          name: 'Admin User',
          email: 'admin@hopebridge.com',
          role: 'ADMIN',
          isOnline: true,
          lastMessage: 'Welcome to the team!',
          unreadCount: 2
        },
        {
          id: '2',
          name: 'Project Manager',
          email: 'pm@hopebridge.com',
          role: 'PROGRAM_MANAGER',
          isOnline: false,
          lastMessage: 'Task completed successfully',
          unreadCount: 0
        },
        {
          id: '3',
          name: 'HR Manager',
          email: 'hr@hopebridge.com',
          role: 'HR',
          isOnline: true,
          lastMessage: 'Meeting scheduled for tomorrow',
          unreadCount: 1
        },
        {
          id: '4',
          name: 'Finance Officer',
          email: 'finance@hopebridge.com',
          role: 'FINANCE',
          isOnline: false,
          lastMessage: 'Budget approved',
          unreadCount: 0
        }
      ];
      setUsers(mockUsers);
    }
  }, [canAccessChat]);

  // Mock messages for demonstration
  useEffect(() => {
    if (selectedUser) {
      const mockMessages: Message[] = [
        {
          id: '1',
          senderId: selectedUser.id,
          senderName: selectedUser.name,
          content: 'Hello! How can I help you today?',
          timestamp: new Date(Date.now() - 3600000),
          read: true,
          type: 'received'
        },
        {
          id: '2',
          senderId: user?.id || '',
          senderName: user?.name || 'You',
          content: 'Hi! I need help with the task management system.',
          timestamp: new Date(Date.now() - 3000000),
          read: true,
          type: 'sent'
        },
        {
          id: '3',
          senderId: selectedUser.id,
          senderName: selectedUser.name,
          content: 'I can definitely help you with that. What specific issue are you facing?',
          timestamp: new Date(Date.now() - 2400000),
          read: true,
          type: 'received'
        }
      ];
      setMessages(mockMessages);
    }
  }, [selectedUser, user]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: user?.id || '',
      senderName: user?.name || 'You',
      content: newMessage,
      timestamp: new Date(),
      read: false,
      type: 'sent'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Simulate response
    setTimeout(() => {
      const response: Message = {
        id: (Date.now() + 1).toString(),
        senderId: selectedUser.id,
        senderName: selectedUser.name,
        content: 'Thank you for your message. I will respond shortly.',
        timestamp: new Date(),
        read: false,
        type: 'received'
      };
      setMessages(prev => [...prev, response]);
    }, 1000);
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const totalUnreadCount = users.reduce((sum, user) => sum + (user.unreadCount || 0), 0);

  // Don't render if user doesn't have permission
  if (!canAccessChat) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat Button */}
      {!isOpen && (
        <motion.button
          ref={chatButtonRef}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="relative bg-primary text-white p-4 rounded-full shadow-lg hover:bg-primary/90 transition-colors"
          aria-label={`Open chat ${totalUnreadCount > 0 ? `(${totalUnreadCount} unread messages)` : ''}`}
          title={`Open chat ${totalUnreadCount > 0 ? `(${totalUnreadCount} unread messages)` : ''}`}
        >
          <MessageCircle className="w-6 h-6" />
          {totalUnreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center" aria-label={`${totalUnreadCount} unread messages`}>
              {totalUnreadCount}
            </span>
          )}
        </motion.button>
      )}

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 w-96 h-[600px] flex flex-col"
          >
            {/* Header */}
            <div className="bg-primary text-white p-4 rounded-t-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5" />
                <h3 className="font-semibold">Team Chat</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 p-1 rounded transition-colors"
                aria-label="Close chat"
                title="Close chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-1 overflow-hidden">
              {/* Users Sidebar */}
              {!selectedUser ? (
                <div className="w-full flex flex-col">
                  {/* Search */}
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Users List */}
                  <div className="flex-1 overflow-y-auto">
                    {filteredUsers.map((chatUser) => (
                      <div
                        key={chatUser.id}
                        onClick={() => setSelectedUser(chatUser)}
                        className="p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                              <span className="text-primary font-semibold">
                                {chatUser.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <Circle
                              className={`absolute bottom-0 right-0 w-3 h-3 fill-current ${
                                chatUser.isOnline ? 'text-green-500' : 'text-gray-400'
                              }`}
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-gray-900 dark:text-white">
                                {chatUser.name}
                              </h4>
                              {chatUser.unreadCount && chatUser.unreadCount > 0 && (
                                <span className="bg-primary text-white text-xs rounded-full px-2 py-1">
                                  {chatUser.unreadCount}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                              {chatUser.lastMessage}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Chat Messages */
                <div className="w-full flex flex-col">
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSelectedUser(null)}
                        className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        aria-label="Back to user list"
                        title="Back to user list"
                      >
                        ←
                      </button>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {selectedUser.name}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {selectedUser.isOnline ? 'Online' : 'Offline'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.type === 'sent' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] px-4 py-2 rounded-lg ${
                            message.type === 'sent'
                              ? 'bg-primary text-white'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <span className={`text-xs ${
                              message.type === 'sent' ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'
                            }`}>
                              {formatTime(message.timestamp)}
                            </span>
                            {message.type === 'sent' && (
                              message.read ? <CheckCheck className="w-3 h-3 text-white/70" /> : <Check className="w-3 h-3 text-white/70" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                      <button
                        onClick={sendMessage}
                        disabled={!newMessage.trim()}
                        className="bg-primary text-white p-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Send message"
                        title="Send message"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatWidget;
