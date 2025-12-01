import express from 'express';
import {
  getUsers,
  getMessages,
  sendMessage,
  markTyping,
  getTypingStatus,
  markAsRead,
  getUnreadCounts
} from '../controllers/chatController.js';

const router = express.Router();

// Get all users for chat
router.get('/users', getUsers);

// Get messages with a specific user
router.get('/:userId', getMessages);

// Send message to a specific user
router.post('/:userId', sendMessage);

// Mark typing status
router.post('/:userId/typing', markTyping);

// Get typing status
router.get('/:userId/typing', getTypingStatus);

// Mark messages as read
router.post('/:userId/read', markAsRead);

// Get unread message counts
router.get('/unread/counts', getUnreadCounts);

export default router;
