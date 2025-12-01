import express from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Register
router.post('/register', register);

// Login
router.post('/login', login);

// Get current user (protected)
router.get('/me', protect, getMe);

export default router;
