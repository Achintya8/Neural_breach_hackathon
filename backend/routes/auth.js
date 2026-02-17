const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', authController.register);

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', authController.login);

// @route   GET api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, authController.getMe);

// @route   POST api/auth/forgot-password
// @desc    Send reset password email
// @access  Public
router.post('/forgot-password', authController.forgotPassword);

// @route   PUT api/auth/reset-password/:token
// @desc    Reset password
// @access  Public
router.put('/reset-password/:token', authController.resetPassword);

module.exports = router;
