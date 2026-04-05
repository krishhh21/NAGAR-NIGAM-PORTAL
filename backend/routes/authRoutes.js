const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Validation rules
const registerValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please include a valid email'),
  body('phone').matches(/^\d{10}$/).withMessage('Please provide a valid 10-digit phone number'),
  body('address').notEmpty().withMessage('Address is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const loginValidation = [
  body('email').isEmail().withMessage('Please include a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

const forgotPasswordValidation = [
  body('email').isEmail().withMessage('Please include a valid email')
];

const resetPasswordValidation = [
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

// Public routes
router.post('/register', registerValidation, registerUser);
router.post('/login', loginValidation, loginUser);
router.post('/forgot-password', forgotPasswordValidation, forgotPassword);
router.put('/reset-password/:resettoken', resetPasswordValidation, resetPassword);

// Protected routes
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);

// Admin routes
router.get('/users', protect, authorize('admin'), getUsers);

module.exports = router;