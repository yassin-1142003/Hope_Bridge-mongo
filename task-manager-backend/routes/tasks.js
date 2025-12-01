import express from 'express';
import {
  sendTask,
  getReceivedTasks,
  getSentTasks,
  getTaskById,
  updateTaskStatus,
  getNewTasks
} from '../controllers/taskController.js';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// All task routes are protected
router.use(protect);

// Send task with file upload
router.post('/send', upload.single('attachment'), sendTask);

// Get received tasks
router.get('/received', getReceivedTasks);

// Get sent tasks
router.get('/sent', getSentTasks);

// Get new tasks (last 24 hours)
router.get('/new', getNewTasks);

// Get single task by ID
router.get('/:id', getTaskById);

// Update task status
router.patch('/:id/status', updateTaskStatus);

export default router;
