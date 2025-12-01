import express from 'express';
import { protect, generalRateLimit } from '../middleware/auth.js';
import {
  getAllUsers,
  getUserById,
  getOnlineUsers,
  updateOnlineStatus,
  getUserStats,
  searchUsers,
  getDepartments,
  getUserActivity
} from '../controllers/userController.js';

const router = express.Router();

router.use(protect); // All routes require authentication

// User management routes
router.get('/all', generalRateLimit, getAllUsers);
router.get('/online', getOnlineUsers);
router.get('/search', searchUsers);
router.get('/departments', getDepartments);
router.get('/stats', getUserStats);
router.get('/activity/:userId?', getUserActivity);
router.get('/:userId', getUserById);
router.put('/online-status', updateOnlineStatus);

export default router;
