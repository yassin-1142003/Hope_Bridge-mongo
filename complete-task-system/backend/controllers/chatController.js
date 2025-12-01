import ChatMessage from '../models/ChatMessage.js';
import User from '../models/User.js';
import { getFileInfo } from '../middleware/upload.js';

// Get all users for chat
export const getChatUsers = async (req, res) => {
  try {
    const { search } = req.query;
    const currentUserId = req.user._id;

    let query = { _id: { $ne: currentUserId } };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('name email avatar role isOnline lastSeen')
      .sort({ isOnline: -1, name: 1 });

    res.json({
      success: true,
      data: {
        users,
        count: users.length
      }
    });
  } catch (error) {
    console.error('Get chat users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching chat users'
    });
  }
};

// Get conversation between two users
export const getConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;
    const { limit = 50, page = 1 } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const skip = (page - 1) * limit;
    const conversation = await ChatMessage.getConversation(
      currentUserId,
      userId,
      parseInt(limit),
      skip
    );

    // Mark messages as read
    await ChatMessage.updateMany(
      {
        conversationId: ChatMessage.generateConversationId(currentUserId, userId),
        receiver: currentUserId,
        isRead: false
      },
      { isRead: true, readAt: new Date() }
    );

    res.json({
      success: true,
      data: {
        messages: conversation.reverse(), // Show oldest first
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          hasMore: conversation.length === parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching conversation'
    });
  }
};

// Send message
export const sendMessage = async (req, res) => {
  try {
    const { userId } = req.params;
    const { message, taskId } = req.body;
    const currentUserId = req.user._id;

    if (!userId || !message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'User ID and message are required'
      });
    }

    // Check if receiver exists
    const receiver = await User.findById(userId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'Receiver not found'
      });
    }

    // Create message
    const conversationId = ChatMessage.generateConversationId(currentUserId, userId);
    const chatMessage = new ChatMessage({
      conversationId,
      sender: currentUserId,
      receiver: userId,
      message: message.trim(),
      taskId: taskId || null,
      attachment: req.file ? getFileInfo(req.file) : null,
      messageType: req.file ? 
        (req.file.mimetype.startsWith('image/') ? 'image' : 'file') : 'text'
    });

    await chatMessage.save();

    // Populate message details
    const populatedMessage = await ChatMessage.findById(chatMessage._id)
      .populate('sender', 'name email avatar isOnline')
      .populate('receiver', 'name email avatar isOnline')
      .populate('taskId', 'title');

    // Emit real-time message
    if (req.io) {
      // Send to receiver
      req.io.to(userId).emit('new_message', {
        message: populatedMessage,
        sender: req.user.getProfile()
      });

      // Send to sender (for real-time update)
      req.io.to(currentUserId.toString()).emit('message_sent', {
        message: populatedMessage
      });

      // Update typing status
      req.io.to(userId).emit('typing_status', {
        userId: currentUserId,
        isTyping: false
      });
    }

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: {
        message: populatedMessage
      }
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error sending message'
    });
  }
};

// Get user conversations list
export const getConversations = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    const conversations = await ChatMessage.getUserConversations(currentUserId);

    res.json({
      success: true,
      data: {
        conversations,
        count: conversations.length
      }
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching conversations'
    });
  }
};

// Get unread message count
export const getUnreadCount = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    const unreadCount = await ChatMessage.getUnreadCount(currentUserId);

    res.json({
      success: true,
      data: {
        unreadCount
      }
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching unread count'
    });
  }
};

// Mark messages as read
export const markAsRead = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const conversationId = ChatMessage.generateConversationId(currentUserId, userId);

    await ChatMessage.updateMany(
      {
        conversationId,
        receiver: currentUserId,
        isRead: false
      },
      { isRead: true, readAt: new Date() }
    );

    // Emit read receipt
    if (req.io) {
      req.io.to(userId).emit('messages_read', {
        userId: currentUserId,
        conversationId
      });
    }

    res.json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error marking messages as read'
    });
  }
};

// Add reaction to message
export const addReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const currentUserId = req.user._id;

    if (!emoji) {
      return res.status(400).json({
        success: false,
        message: 'Emoji is required'
      });
    }

    const message = await ChatMessage.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user is involved in this conversation
    if (message.sender.toString() !== currentUserId.toString() && 
        message.receiver.toString() !== currentUserId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to react to this message'
      });
    }

    await message.addReaction(currentUserId, emoji);

    const updatedMessage = await ChatMessage.findById(messageId)
      .populate('sender', 'name email avatar')
      .populate('receiver', 'name email avatar')
      .populate('reactions.user', 'name email avatar');

    // Emit reaction update
    if (req.io) {
      const otherUserId = message.sender.toString() === currentUserId.toString() 
        ? message.receiver.toString() 
        : message.sender.toString();
      
      req.io.to(otherUserId).emit('message_reaction', {
        messageId,
        reaction: { user: req.user.getProfile(), emoji },
        message: updatedMessage
      });
    }

    res.json({
      success: true,
      message: 'Reaction added successfully',
      data: {
        message: updatedMessage
      }
    });
  } catch (error) {
    console.error('Add reaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding reaction'
    });
  }
};

// Delete message
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const currentUserId = req.user._id;

    const message = await ChatMessage.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Only sender can delete their own messages
    if (message.sender.toString() !== currentUserId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own messages'
      });
    }

    await message.softDelete();

    // Emit message deletion
    if (req.io) {
      const otherUserId = message.receiver.toString();
      req.io.to(otherUserId).emit('message_deleted', {
        messageId,
        deletedBy: req.user.getProfile()
      });
    }

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting message'
    });
  }
};

// Edit message
export const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { message: newMessage } = req.body;
    const currentUserId = req.user._id;

    if (!newMessage || !newMessage.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message text is required'
      });
    }

    const message = await ChatMessage.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Only sender can edit their own messages
    if (message.sender.toString() !== currentUserId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own messages'
      });
    }

    // Check if message is too old to edit (e.g., 15 minutes)
    const editTimeLimit = 15 * 60 * 1000; // 15 minutes
    if (Date.now() - message.createdAt.getTime() > editTimeLimit) {
      return res.status(400).json({
        success: false,
        message: 'Message can only be edited within 15 minutes of sending'
      });
    }

    await message.editMessage(newMessage.trim());

    const updatedMessage = await ChatMessage.findById(messageId)
      .populate('sender', 'name email avatar')
      .populate('receiver', 'name email avatar');

    // Emit message edit
    if (req.io) {
      const otherUserId = message.receiver.toString();
      req.io.to(otherUserId).emit('message_edited', {
        messageId,
        message: updatedMessage,
        editedBy: req.user.getProfile()
      });
    }

    res.json({
      success: true,
      message: 'Message edited successfully',
      data: {
        message: updatedMessage
      }
    });
  } catch (error) {
    console.error('Edit message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error editing message'
    });
  }
};

// Get messages related to a specific task
export const getTaskMessages = async (req, res) => {
  try {
    const { taskId } = req.params;
    const currentUserId = req.user._id;

    const messages = await ChatMessage.find({
      taskId,
      $or: [
        { sender: currentUserId },
        { receiver: currentUserId }
      ],
      isDeleted: { $ne: true }
    })
      .populate('sender', 'name email avatar')
      .populate('receiver', 'name email avatar')
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      data: {
        messages,
        count: messages.length
      }
    });
  } catch (error) {
    console.error('Get task messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching task messages'
    });
  }
};
