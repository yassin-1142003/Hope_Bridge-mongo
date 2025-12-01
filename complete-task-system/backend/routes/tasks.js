import express from 'express';
import { protect, generalRateLimit } from '../middleware/auth.js';
import { uploadTaskAttachment, handleUploadError } from '../middleware/upload.js';
import {
  createTask,
  getMyTasks,
  getSentTasks,
  getReceivedTasks,
  getTaskById,
  updateTaskStatus,
  deleteTask,
  addTaskComment,
  getNewTasks,
  getTaskStats
} from '../controllers/taskController.js';

const router = express.Router();

router.use(protect); // All routes require authentication

// Task management routes
router.post('/create', generalRateLimit, uploadTaskAttachment, handleUploadError, createTask);
router.get('/my-tasks', generalRateLimit, getMyTasks);
router.get('/sent', generalRateLimit, getSentTasks);
router.get('/received', generalRateLimit, getReceivedTasks);
router.get('/new', getNewTasks);
router.get('/stats', getTaskStats);
router.get('/:taskId', getTaskById);
router.patch('/:taskId/status', updateTaskStatus);
router.delete('/:taskId', deleteTask);
router.post('/:taskId/comment', addTaskComment);

export default router;
