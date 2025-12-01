const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { validateTask, validateComment } = require('../middleware/validation');
const {
  getMySentTasks,
  getMyReceivedTasks,
  getTaskById,
  createTask,
  updateTask,
  addComment,
  markComplete,
  sendReminder,
  getRelatedTasks
} = require('../controllers/taskController');

router.get('/my-sent', auth, getMySentTasks);
router.get('/my-received', auth, getMyReceivedTasks);
router.get('/:id', auth, getTaskById);
router.post('/', auth, validateTask, createTask);
router.patch('/:id', auth, updateTask);
router.post('/:id/comments', auth, validateComment, addComment);
router.post('/:id/reminder', auth, sendReminder);
router.post('/:id/mark-complete', auth, markComplete);
router.get('/:id/related', auth, getRelatedTasks);

module.exports = router;
