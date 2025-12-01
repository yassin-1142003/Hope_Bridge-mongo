import express from 'express';
import { protect, authRateLimit } from '../middleware/auth.js';
import {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  logout,
  deleteAccount
} from '../controllers/authController.js';

const router = express.Router();

// Public routes
router.post('/register', authRateLimit, register);
router.post('/login', authRateLimit, login);

// Protected routes
router.use(protect); // All routes below require authentication

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);
router.post('/logout', logout);
router.delete('/account/:userId?', deleteAccount);

export default router;
