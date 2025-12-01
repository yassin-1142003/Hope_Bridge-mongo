import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MESSAGES_FILE = path.join(__dirname, '../data/messages.json');

// Read messages file
const readMessagesFile = async () => {
  try {
    const data = await fs.readFile(MESSAGES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading messages file:', error);
    return { conversations: {}, typing: {}, lastSeen: {} };
  }
};

// Write messages file
const writeMessagesFile = async (data) => {
  try {
    await fs.writeFile(MESSAGES_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing messages file:', error);
    throw error;
  }
};

// Generate conversation key
const getConversationKey = (userId1, userId2) => {
  const sorted = [userId1, userId2].sort();
  return `${sorted[0]}_${sorted[1]}`;
};

// Get all users
export const getUsers = async (req, res) => {
  try {
    // In a real app, this would fetch from your user database
    // For demo purposes, returning sample users
    const users = [
      { _id: 'user1', name: 'John Doe', email: 'john@example.com', isOnline: true },
      { _id: 'user2', name: 'Jane Smith', email: 'jane@example.com', isOnline: false },
      { _id: 'user3', name: 'Bob Johnson', email: 'bob@example.com', isOnline: true },
      { _id: 'user4', name: 'Alice Brown', email: 'alice@example.com', isOnline: false }
    ];

    // Filter out current user
    const currentUserId = req.user.id;
    const otherUsers = users.filter(user => user._id !== currentUserId);

    res.json({
      success: true,
      users: otherUsers
    });
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
};

// Get messages with a specific user
export const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const data = await readMessagesFile();
    const conversationKey = getConversationKey(currentUserId, userId);
    const messages = data.conversations[conversationKey] || [];

    res.json({
      success: true,
      messages: messages.reverse() // Return newest first
    });
  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching messages'
    });
  }
};

// Send a message
export const sendMessage = async (req, res) => {
  try {
    const { userId } = req.params;
    const { message } = req.body;
    const currentUserId = req.user.id;
    
    if (!userId || !message) {
      return res.status(400).json({
        success: false,
        message: 'User ID and message are required'
      });
    }

    const data = await readMessagesFile();
    const conversationKey = getConversationKey(currentUserId, userId);
    
    // Initialize conversation if it doesn't exist
    if (!data.conversations[conversationKey]) {
      data.conversations[conversationKey] = [];
    }

    // Create new message
    const newMessage = {
      id: Date.now().toString(),
      sender: currentUserId,
      receiver: userId,
      message: message.trim(),
      timestamp: Date.now()
    };

    // Add message to conversation
    data.conversations[conversationKey].push(newMessage);

    // Save to file
    await writeMessagesFile(data);

    // Emit via Socket.IO if available
    if (req.io) {
      req.io.to(userId).emit('new_message', {
        conversationKey,
        message: newMessage,
        sender: req.user
      });
    }

    res.json({
      success: true,
      message: 'Message sent successfully',
      data: newMessage
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending message'
    });
  }
};

// Mark typing status
export const markTyping = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isTyping } = req.body;
    const currentUserId = req.user.id;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const data = await readMessagesFile();
    const conversationKey = getConversationKey(currentUserId, userId);
    
    if (isTyping) {
      data.typing[conversationKey] = currentUserId;
    } else {
      delete data.typing[conversationKey];
    }

    await writeMessagesFile(data);

    // Emit via Socket.IO if available
    if (req.io) {
      req.io.to(userId).emit('typing_status', {
        userId: currentUserId,
        isTyping: !!isTyping
      });
    }

    res.json({
      success: true,
      message: 'Typing status updated'
    });
  } catch (error) {
    console.error('Error marking typing status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating typing status'
    });
  }
};

// Get typing status
export const getTypingStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const data = await readMessagesFile();
    const conversationKey = getConversationKey(currentUserId, userId);
    const typingUserId = data.typing[conversationKey];
    const isTyping = typingUserId === userId;

    res.json({
      success: true,
      isTyping
    });
  } catch (error) {
    console.error('Error getting typing status:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching typing status'
    });
  }
};

// Mark messages as read
export const markAsRead = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const data = await readMessagesFile();
    const conversationKey = getConversationKey(currentUserId, userId);
    
    // Update last seen timestamp
    data.lastSeen[conversationKey] = {
      [currentUserId]: Date.now()
    };

    await writeMessagesFile(data);

    // Emit via Socket.IO if available
    if (req.io) {
      req.io.to(userId).emit('message_read', {
        userId: currentUserId,
        conversationKey
      });
    }

    res.json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking messages as read'
    });
  }
};

// Get unread message counts
export const getUnreadCounts = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const data = await readMessagesFile();
    const unreadCounts = {};

    // Check all conversations for unread messages
    Object.keys(data.conversations).forEach(conversationKey => {
      const [user1, user2] = conversationKey.split('_');
      const otherUserId = user1 === currentUserId ? user2 : user1;
      
      if (otherUserId !== currentUserId) {
        const messages = data.conversations[conversationKey];
        const lastSeen = data.lastSeen[conversationKey]?.[currentUserId] || 0;
        
        const unreadMessages = messages.filter(msg => 
          msg.sender === otherUserId && 
          msg.timestamp > lastSeen
        );
        
        if (unreadMessages.length > 0) {
          unreadCounts[otherUserId] = unreadMessages.length;
        }
      }
    });

    res.json({
      success: true,
      unreadCounts
    });
  } catch (error) {
    console.error('Error getting unread counts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching unread counts'
    });
  }
};
