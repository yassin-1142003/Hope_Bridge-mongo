import express from 'express';
import { protect, messageRateLimit } from '../middleware/auth.js';
import { uploadChatAttachment, handleUploadError } from '../middleware/upload.js';
import {
  getChatUsers,
  getConversation,
  sendMessage,
  getConversations,
  getUnreadCount,
  markAsRead,
  addReaction,
  deleteMessage,
  editMessage,
  getTaskMessages
} from '../controllers/chatController.js';

const router = express.Router();

router.use(protect); // All routes require authentication

// Chat routes
router.get('/users', messageRateLimit, getChatUsers);
router.get('/conversations', getConversations);
router.get('/unread/count', getUnreadCount);
router.get('/task/:taskId', getTaskMessages);

// Conversation routes
router.get('/:userId', messageRateLimit, getConversation);
router.post('/:userId', messageRateLimit, uploadChatAttachment, handleUploadError, sendMessage);
router.post('/:userId/read', markAsRead);

// Message actions
router.post('/message/:messageId/reaction', addReaction);
router.put('/message/:messageId', editMessage);
router.delete('/message/:messageId', deleteMessage);

export default router;
