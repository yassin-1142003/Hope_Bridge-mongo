const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  getUsers,
  getMessages,
  sendMessage,
  markTyping,
  getTypingStatus,
  markAsRead,
  getUnreadCounts
} = require('../controllers/chatController');

router.get('/users', auth, getUsers);
router.get('/:userId', auth, getMessages);
router.post('/:userId', auth, sendMessage);
router.post('/:userId/typing', auth, markTyping);
router.get('/:userId/typing', auth, getTypingStatus);
router.post('/:userId/read', auth, markAsRead);
router.get('/unread/counts', auth, getUnreadCounts);

module.exports = router;
