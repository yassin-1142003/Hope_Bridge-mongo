import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { chatAPI } from '../services/chatAPI';
import { useSocket } from './SocketContext';
import toast from 'react-hot-toast';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState({});
  const [unreadCounts, setUnreadCounts] = useState({});
  const [typingStatus, setTypingStatus] = useState({});
  const [loading, setLoading] = useState(false);
  const { socket } = useSocket();
  const pollingIntervals = useRef({});

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      fetchUnreadCounts();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser._id);
      startPolling(selectedUser._id);
      markAsRead(selectedUser._id);
    } else {
      stopAllPolling();
    }
  }, [selectedUser]);

  useEffect(() => {
    if (socket) {
      socket.on('new_message', handleNewMessage);
      socket.on('typing_status', handleTypingStatus);
      socket.on('message_read', handleMessageRead);

      return () => {
        socket.off('new_message', handleNewMessage);
        socket.off('typing_status', handleTypingStatus);
        socket.off('message_read', handleMessageRead);
      };
    }
  }, [socket, selectedUser]);

  const startPolling = (userId) => {
    stopPolling(userId);
    
    pollingIntervals.current[userId] = setInterval(async () => {
      try {
        const response = await chatAPI.getMessages(userId);
        const newMessages = response.data.messages;
        
        setMessages(prev => {
          const currentMessages = prev[userId] || [];
          if (newMessages.length > currentMessages.length) {
            return { ...prev, [userId]: newMessages };
          }
          return prev;
        });

        const typingResponse = await chatAPI.getTypingStatus(userId);
        setTypingStatus(prev => ({
          ...prev,
          [userId]: typingResponse.data.isTyping
        }));
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 2000);
  };

  const stopPolling = (userId) => {
    if (pollingIntervals.current[userId]) {
      clearInterval(pollingIntervals.current[userId]);
      delete pollingIntervals.current[userId];
    }
  };

  const stopAllPolling = () => {
    Object.keys(pollingIntervals.current).forEach(userId => {
      stopPolling(userId);
    });
  };

  const fetchUsers = async () => {
    try {
      const response = await chatAPI.getUsers();
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Error fetching users');
    }
  };

  const fetchMessages = async (userId) => {
    try {
      setLoading(true);
      const response = await chatAPI.getMessages(userId);
      setMessages(prev => ({ ...prev, [userId]: response.data.messages }));
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Error fetching messages');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCounts = async () => {
    try {
      const response = await chatAPI.getUnreadCounts();
      setUnreadCounts(response.data.unreadCounts);
    } catch (error) {
      console.error('Error fetching unread counts:', error);
    }
  };

  const sendMessage = async (userId, message) => {
    try {
      const response = await chatAPI.sendMessage(userId, message);
      const newMessage = response.data.data;
      
      setMessages(prev => ({
        ...prev,
        [userId]: [...(prev[userId] || []), newMessage]
      }));

      return newMessage;
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Error sending message');
      throw error;
    }
  };

  const markAsRead = async (userId) => {
    try {
      await chatAPI.markAsRead(userId);
      setUnreadCounts(prev => {
        const newCounts = { ...prev };
        delete newCounts[userId];
        return newCounts;
      });
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const sendTypingStatus = async (userId, isTyping) => {
    try {
      await chatAPI.markTyping(userId, isTyping);
    } catch (error) {
      console.error('Error sending typing status:', error);
    }
  };

  const handleNewMessage = (data) => {
    const { conversationKey, message, sender } = data;
    const [user1, user2] = conversationKey.split('_');
    const otherUserId = user1 === message.receiver ? user2 : user1;
    
    if (otherUserId === message.receiver) {
      setMessages(prev => ({
        ...prev,
        [sender._id]: [...(prev[sender._id] || []), message]
      }));

      if (selectedUser?._id !== sender._id) {
        setUnreadCounts(prev => ({
          ...prev,
          [sender._id]: (prev[sender._id] || 0) + 1
        }));
        
        toast(`${sender.firstName} ${sender.lastName}: ${message.message}`, {
          icon: '💬',
          duration: 4000
        });
      }
    }
  };

  const handleTypingStatus = (data) => {
    const { userId, isTyping } = data;
    setTypingStatus(prev => ({
      ...prev,
      [userId]: isTyping
    }));
  };

  const handleMessageRead = (data) => {
    const { userId } = data;
  };

  const openChat = (user = null) => {
    setIsOpen(true);
    if (user) {
      setSelectedUser(user);
    }
  };

  const closeChat = () => {
    setIsOpen(false);
    setSelectedUser(null);
    stopAllPolling();
  };

  const selectUser = (user) => {
    setSelectedUser(user);
  };

  const value = {
    isOpen,
    users,
    selectedUser,
    messages,
    unreadCounts,
    typingStatus,
    loading,
    fetchUsers,
    fetchMessages,
    sendMessage,
    markAsRead,
    sendTypingStatus,
    openChat,
    closeChat,
    selectUser
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};
