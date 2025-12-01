const fs = require('fs').promises;
const path = require('path');
const User = require('../models/User');

const MESSAGES_FILE = path.join(__dirname, '../data/messages.json');

class ChatStorage {
  static async readData() {
    try {
      const data = await fs.readFile(MESSAGES_FILE, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return { conversations: {}, typing: {}, lastSeen: {} };
      }
      throw error;
    }
  }

  static async writeData(data) {
    await fs.writeFile(MESSAGES_FILE, JSON.stringify(data, null, 2));
  }

  static getConversationKey(userId1, userId2) {
    const sorted = [userId1, userId2].sort();
    return `${sorted[0]}_${sorted[1]}`;
  }
}

const getUsers = async (req, res) => {
  try {
    const users = await User.find({ 
      _id: { $ne: req.user._id },
      isActive: true 
    }).select('firstName lastName email avatar lastLogin');
    
    const usersWithStatus = users.map(user => ({
      ...user.toJSON(),
      isOnline: user.lastLogin && 
        (Date.now() - new Date(user.lastLogin).getTime()) < 5 * 60 * 1000
    }));

    res.json({ users: usersWithStatus });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
};

const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id.toString();
    
    if (!userId || userId === currentUserId) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const data = await ChatStorage.readData();
    const conversationKey = ChatStorage.getConversationKey(currentUserId, userId);
    const messages = data.conversations[conversationKey] || [];

    res.json({ messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Error fetching messages' });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { userId } = req.params;
    const { message } = req.body;
    const currentUserId = req.user._id.toString();
    
    if (!userId || userId === currentUserId) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    if (!message || message.trim() === '') {
      return res.status(400).json({ message: 'Message cannot be empty' });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const data = await ChatStorage.readData();
    const conversationKey = ChatStorage.getConversationKey(currentUserId, userId);
    
    if (!data.conversations[conversationKey]) {
      data.conversations[conversationKey] = [];
    }

    const newMessage = {
      sender: currentUserId,
      receiver: userId,
      message: message.trim(),
      timestamp: Date.now(),
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    data.conversations[conversationKey].push(newMessage);
    
    const lastSeenKey = `${currentUserId}_${userId}`;
    data.lastSeen[lastSeenKey] = Date.now();

    await ChatStorage.writeData(data);

    req.io.to(userId).emit('new_message', {
      conversationKey,
      message: newMessage,
      sender: {
        _id: req.user._id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        avatar: req.user.avatar
      }
    });

    res.json({ 
      message: 'Message sent successfully',
      data: newMessage
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Error sending message' });
  }
};

const markTyping = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isTyping } = req.body;
    const currentUserId = req.user._id.toString();
    
    if (!userId || userId === currentUserId) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const data = await ChatStorage.readData();
    const typingKey = `${currentUserId}_${userId}`;
    
    if (isTyping) {
      data.typing[typingKey] = Date.now();
    } else {
      delete data.typing[typingKey];
    }

    await ChatStorage.writeData(data);

    req.io.to(userId).emit('typing_status', {
      userId: currentUserId,
      isTyping,
      firstName: req.user.firstName,
      lastName: req.user.lastName
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating typing status:', error);
    res.status(500).json({ message: 'Error updating typing status' });
  }
};

const getTypingStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id.toString();
    
    if (!userId || userId === currentUserId) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const data = await ChatStorage.readData();
    const typingKey = `${userId}_${currentUserId}`;
    const typingTimestamp = data.typing[typingKey];
    
    const isTyping = typingTimestamp && (Date.now() - typingTimestamp) < 3000;

    res.json({ isTyping });
  } catch (error) {
    console.error('Error fetching typing status:', error);
    res.status(500).json({ message: 'Error fetching typing status' });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id.toString();
    
    if (!userId || userId === currentUserId) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const data = await ChatStorage.readData();
    const lastSeenKey = `${currentUserId}_${userId}`;
    data.lastSeen[lastSeenKey] = Date.now();

    await ChatStorage.writeData(data);

    req.io.to(userId).emit('message_read', {
      userId: currentUserId
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ message: 'Error marking messages as read' });
  }
};

const getUnreadCounts = async (req, res) => {
  try {
    const currentUserId = req.user._id.toString();
    const data = await ChatStorage.readData();
    const unreadCounts = {};

    for (const [conversationKey, messages] of Object.entries(data.conversations)) {
      const [user1, user2] = conversationKey.split('_');
      const otherUserId = user1 === currentUserId ? user2 : user1;
      
      if (user1 === currentUserId || user2 === currentUserId) {
        const lastSeenKey = `${currentUserId}_${otherUserId}`;
        const lastSeenTime = data.lastSeen[lastSeenKey] || 0;
        
        const unreadCount = messages.filter(msg => 
          msg.receiver === currentUserId && msg.timestamp > lastSeenTime
        ).length;
        
        if (unreadCount > 0) {
          unreadCounts[otherUserId] = unreadCount;
        }
      }
    }

    res.json({ unreadCounts });
  } catch (error) {
    console.error('Error fetching unread counts:', error);
    res.status(500).json({ message: 'Error fetching unread counts' });
  }
};

module.exports = {
  getUsers,
  getMessages,
  sendMessage,
  markTyping,
  getTypingStatus,
  markAsRead,
  getUnreadCounts
};
